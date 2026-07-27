import { cartModel, ICartItem } from "../models/cartModel";
import { IOrderItem, orderModel } from "../models/orderModel";
import { productModel } from "../models/productModel";
import { couponModel } from "../models/couponModel";

interface CreateCartForUser {
	userId: string;
}

const createCartForUser = async ({ userId }: CreateCartForUser) => {
	try {
		const newCart = await cartModel.create({ userId });
		await newCart.save();
		return newCart;
	} catch (error: any) {
		throw new Error(error.message);
	}
};

interface GetActiveCartForUser {
	userId: string;
}
export const getActiveCartForUser = async ({
	userId,
}: GetActiveCartForUser) => {
	try {
		const activeCart = await cartModel
			.findOne({ userId, status: "active" })
			.populate("items.product");

		if (!activeCart) {
			const newCart = await createCartForUser({ userId });
			return newCart;
		}

		return activeCart;
	} catch (error: any) {
		throw new Error(error.message);
	}
};

/** Internal: get cart WITHOUT populate for safe ObjectId comparisons */
const getActiveCartRaw = async (userId: string) => {
	const activeCart = await cartModel.findOne({ userId, status: "active" });
	if (!activeCart) {
		return await createCartForUser({ userId });
	}
	return activeCart;
};

/** Internal: populate items.product and return */
const populateCart = async (cartId: string) => {
	return await cartModel.findById(cartId).populate("items.product");
};

/** Compare a cart item's product ref to a productId (works with ObjectId or populated doc) */
const matchesProductId = (item: { product: any }, productId: string) => {
	const ref = item.product;
	if (typeof ref === "object" && ref !== null && ref._id) {
		return String(ref._id) === String(productId);
	}
	return String(ref) === String(productId);
};

interface AddItemToCart {
	productId: string;
	quantity: number;
	userId: string;
}

export const addItemToCart = async ({
	userId,
	productId,
	quantity,
}: AddItemToCart) => {
	try {
		const cart = await getActiveCartRaw(userId);

		const existsInCart = cart.items.find((item) =>
			matchesProductId(item, productId),
		);

		const product = await productModel.findById(productId);
		if (!product) {
			throw new Error("Product not found");
		}

		const newQuantity = existsInCart
			? existsInCart.quantity + quantity
			: quantity;

		if (newQuantity > product.stock) {
			throw new Error(
				`Cannot add ${quantity} items to cart. Only ${product.stock} items in stock.`,
			);
		}

		if (existsInCart) {
			existsInCart.quantity = newQuantity;
		} else {
			cart.items.push({
				product: productId,
				quantity,
				unitPrice: product.price,
			});
		}

		cart.totalAmount += product.price * quantity;

		await cart.save();
		const populatedCart = await populateCart(cart._id.toString());

		return populatedCart || cart;
	} catch (error: any) {
		throw new Error(error.message);
	}
};

interface UpdateItemInCart {
	userId: string;
	productId: string;
	quantity: number;
}
export const updateItemInCart = async ({
	userId,
	productId,
	quantity,
}: UpdateItemInCart) => {
	try {
		const cart = await getActiveCartRaw(userId);
		const existsInCart = cart.items.find((item) =>
			matchesProductId(item, productId),
		);

		if (!existsInCart) {
			throw new Error("Item not found in cart");
		}

		const product = await productModel.findById(productId);
		if (!product) {
			throw new Error("Product not found");
		}

		if (quantity > product.stock) {
			throw new Error(
				`Cannot set quantity to ${quantity}. Only ${product.stock} items in stock.`,
			);
		}

		existsInCart.quantity = quantity;
		existsInCart.unitPrice = product.price;

		cart.totalAmount = cart.items.reduce(
			(total, item) => total + item.quantity * item.unitPrice,
			0,
		);

		await cart.save();
		const populatedCart = await populateCart(cart._id.toString());

		return populatedCart || cart;
	} catch (error: any) {
		throw new Error(error.message);
	}
};

interface ClearCart {
	userId: string;
}
export const clearCart = async ({ userId }: ClearCart) => {
	try {
		const cart = await getActiveCartRaw(userId);
		cart.items = [];
		await cart.save();
		return { message: "Cart cleared successfully" };
	} catch (error: any) {
		throw new Error(error.message);
	}
};

interface DeleteItemFromCart {
	userId: string;
	productId: string;
}

export const deleteItemFromCart = async ({
	userId,
	productId,
}: DeleteItemFromCart) => {
	try {
		const cart = await getActiveCartRaw(userId);

		const existsInCart = cart.items.find((item) =>
			matchesProductId(item, productId),
		);

		if (!existsInCart) {
			throw new Error("Item not found in cart");
		}

		cart.items = cart.items.filter(
			(item) => !matchesProductId(item, productId),
		);

		cart.totalAmount = cart.items.reduce(
			(total, item) => total + item.quantity * item.unitPrice,
			0,
		);

		await cart.save();
		const populatedCart = await populateCart(cart._id.toString());

		return populatedCart || cart;
	} catch (error: any) {
		throw new Error(error.message);
	}
};

interface Checkout {
	userId: string;
	address: string;
	couponCode?: string;
}
export const checkout = async ({ userId, address, couponCode }: Checkout) => {
	try {
		if (!address) {
			throw new Error("Shipping address is required for checkout");
		}

		const cart = await getActiveCartForUser({ userId });

		if (cart.items.length === 0) {
			throw new Error("Cart is empty. Add items before checkout.");
		}

		const orderItems: IOrderItem[] = [];

		for (const item of cart.items) {
			const product = item.product as any;
			const productId = product._id ? String(product._id) : String(product);

			if (product.stock === undefined || product.stock < item.quantity) {
				throw new Error(
					`Insufficient stock for ${product.name || "product"}. Only ${product.stock || 0} left.`,
				);
			}

			await productModel.findByIdAndUpdate(productId, {
				$inc: { stock: -item.quantity },
			});

			orderItems.push({
				productTitle: product.name || "Product",
				productImage: product.imageUrl || "",
				quantity: item.quantity,
				unitPrice: item.unitPrice,
			});
		}

		const subtotal = cart.totalAmount;
		let discount = 0;
		let couponPercent: number | undefined = undefined;

		// Validate and apply coupon server-side (per-user check only)
		if (couponCode) {
			const coupon = await couponModel.findOne({
				code: couponCode.toUpperCase(),
				isActive: true,
				expiresAt: { $gt: new Date() },
			});

			if (coupon) {
				// Check per-user usage (not global - each user can use independently)
				const userEntry = (coupon.usedBy || []).find(
					(u: any) => String(u.userId) === String(userId),
				);
				if (userEntry && userEntry.count >= 1) {
					throw new Error("You have already used this coupon");
				}

				couponPercent = coupon.discountPercent;
				discount = Math.round((subtotal * coupon.discountPercent) / 100);

				// After successful order creation, update coupon usage
				// (done after orderModel.create below)
			}
		}

		const finalTotal = Math.max(subtotal - discount, 0);

		// Generate unique order number (ORD-YYYYMMDD-XXXXXX)
		const now = new Date();
		const dateStr =
			now.getFullYear().toString() +
			String(now.getMonth() + 1).padStart(2, "0") +
			String(now.getDate()).padStart(2, "0");
		const randomSuffix = Math.floor(Math.random() * 900000) + 100000;
		const orderNumber = `ORD-${dateStr}-${randomSuffix}`;
		const order = await orderModel.create({
			orderNumber,
			userId,
			orderItems,
			totalAmount: finalTotal,
			subtotal,
			discount,
			couponCode: couponCode ? couponCode.toUpperCase() : undefined,
			couponPercent,
			address,
		});

		// Update coupon usage only after successful order creation
		// Per-user tracking: increment existing user's count or add new entry
		if (couponCode && discount > 0) {
			// Try to increment existing user's count first
			const updateResult = await couponModel.updateOne(
				{
					code: couponCode.toUpperCase(),
					"usedBy.userId": userId,
				},
				{
					$inc: { usedCount: 1, "usedBy.$.count": 1 },
				},
			);

			// If no existing entry was found, push a new one
			if (updateResult.modifiedCount === 0) {
				await couponModel.updateOne(
					{ code: couponCode.toUpperCase() },
					{
						$inc: { usedCount: 1 },
						$push: { usedBy: { userId, count: 1 } },
					},
				);
			}
		}

		cart.status = "completed";
		await cart.save();

		return order;
	} catch (error: any) {
		throw new Error(error.message);
	}
};
