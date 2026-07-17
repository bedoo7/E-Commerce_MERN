import { cartModel } from "../models/cartModel";
import { IOrderItem, orderModel } from "../models/orderModel";
import { productModel } from "../models/productModel";

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
		const activeCart = await cartModel.findOne({ userId, status: "active" });

		if (!activeCart) {
			const newCart = await createCartForUser({ userId });
			return newCart;
		}

		return activeCart;
	} catch (error: any) {
		throw new Error(error.message);
	}
};

interface AddItemToCart {
	productId: any;
	quantity: number;
	userId: string;
}

export const addItemToCart = async ({
	userId,
	productId,
	quantity,
}: AddItemToCart) => {
	try {
		const cart = await getActiveCartForUser({ userId });

		// Does the product already exist in the cart?
		const existsInCart = cart.items.find((item) =>
			item.product.equals(productId),
		);

		const product = await productModel.findById(productId);

		const newQuantity = existsInCart
			? existsInCart.quantity + quantity
			: quantity;

		if (newQuantity > (product?.stock || 0)) {
			return {
				message: `Cannot add ${quantity} items to cart. Only ${product?.stock} items in stock.`,
			};
		}

		if (existsInCart) {
			existsInCart.quantity = newQuantity;
		} else {
			cart.items.push({
				product: productId,
				quantity,
				unitPrice: product?.price || 0,
			});
		}

		cart.totalAmount += (product?.price || 0) * quantity;

		const updatedCart = await cart.save();

		return updatedCart;
	} catch (error: any) {
		throw new Error(error.message);
	}
};

interface UpdateItemInCart {
	userId: string;
	productId: any;
	quantity: number;
}
export const updateItemInCart = async ({
	userId,
	productId,
	quantity,
}: UpdateItemInCart) => {
	try {
		const cart = await getActiveCartForUser({ userId });
		const existsInCart = cart.items.find((item) =>
			item.product.equals(productId),
		);

		if (!existsInCart) {
			return { message: "Item not found in cart" };
		}

		const product = await productModel.findById(productId);

		if (quantity > (product?.stock || 0)) {
			return {
				message: `Cannot add ${quantity} items to cart. Only ${product?.stock} items in stock.`,
			};
		}

		existsInCart.quantity = quantity;
		existsInCart.unitPrice = product?.price || 0;

		cart.totalAmount = cart.items.reduce(
			(total, item) => total + item.quantity * item.unitPrice,
			0,
		);

		await cart.save();

		return cart;
	} catch (error: any) {
		throw new Error(error.message);
	}
};

interface ClearCart {
	userId: string;
}
export const clearCart = async ({ userId }: ClearCart) => {
	try {
		const cart = await getActiveCartForUser({ userId });
		cart.items = [];
		await cart.save();
		return { message: "Cart cleared successfully" };
	} catch (error: any) {
		throw new Error(error.message);
	}
};

interface DeleteItemFromCart {
	userId: string;
	productId: any;
}

export const deleteItemFromCart = async ({
	userId,
	productId,
}: DeleteItemFromCart) => {
	try {
		const cart = await getActiveCartForUser({ userId });

		const existsInCart = cart.items.find((item) =>
			item.product.equals(productId),
		);

		if (!existsInCart) {
			return { message: "Item not found in cart" };
		}

		const otherItems = cart.items.filter(
			(item) => !item.product.equals(productId),
		);

		cart.items = otherItems;

		cart.totalAmount = cart.items.reduce(
			(total, item) => total + item.quantity * item.unitPrice,
			0,
		);

		await cart.save();

		return cart;
	} catch (error: any) {
		throw new Error(error.message);
	}
};

interface Checkout {
	userId: string;
	address: string;
}
export const checkout = async ({ userId, address }: Checkout) => {
	try {
		if (!address) {
			return { message: "Address is required for checkout" };
		}

		const cart = await getActiveCartForUser({ userId });

		const orderItems: IOrderItem[] = [];

		for (const item of cart.items) {
			const product = await productModel.findById(item.product);
			orderItems.push({
				productTitle: product?.name || "",
				productImage: product?.imageUrl || "",
				quantity: item.quantity,
				unitPrice: item.unitPrice,
			});
		}

		const order = await orderModel.create({
			userId,
			orderItems,
			totalAmount: cart.totalAmount,
			address,
		});

		await order.save();

		cart.status = "completed";
		await cart.save();
		return order;
	} catch (error: any) {
		throw new Error(error.message);
	}
};
