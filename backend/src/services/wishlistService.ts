import { wishlistModel } from "../models/wishlistModel";
import { productModel } from "../models/productModel";

interface GetWishlist {
	userId: string;
}

type WishlistItemLike = {
	product?: unknown;
};

type SanitizableWishlist = {
	items: WishlistItemLike[];
	save: () => Promise<unknown>;
};

const getWishlistProductId = (item: WishlistItemLike) => {
	if (!item?.product) {
		return null;
	}

	if (typeof item.product === "string") {
		return item.product;
	}

	if (typeof item.product === "object" && "toString" in item.product) {
		return item.product.toString();
	}

	return null;
};

const sanitizeWishlistItems = (wishlist: SanitizableWishlist) => {
	const validItems = wishlist.items.filter((item) => {
		return getWishlistProductId(item) !== null;
	});

	if (validItems.length !== wishlist.items.length) {
		wishlist.items = validItems;
	}

	return wishlist;
};

const getOrCreateWishlist = async (userId: string) => {
	let wishlist = await wishlistModel
		.findOne({ userId })
		.populate("items.product");
	if (!wishlist) {
		wishlist = await wishlistModel.create({ userId, items: [] });
		return wishlist;
	}

	const sanitizedWishlist = sanitizeWishlistItems(
		wishlist as SanitizableWishlist,
	);
	if (sanitizedWishlist.items.length !== wishlist.items.length) {
		await sanitizedWishlist.save();
	}

	return sanitizedWishlist;
};

export const getWishlist = async ({ userId }: GetWishlist) => {
	try {
		const wishlist = await getOrCreateWishlist(userId);
		return wishlist;
	} catch (error: any) {
		throw new Error(error.message);
	}
};

interface AddToWishlist {
	userId: string;
	productId: string;
}

export const addToWishlist = async ({ userId, productId }: AddToWishlist) => {
	try {
		const product = await productModel.findById(productId);
		if (!product) {
			throw new Error("Product not found");
		}

		const wishlist = await wishlistModel.findOne({ userId });
		if (!wishlist) {
			const newWishlist = await wishlistModel.create({
				userId,
				items: [{ product: productId }],
			});
			const populated = await newWishlist.populate("items.product");
			return populated;
		}

		const exists = wishlist.items.find(
			(item) => getWishlistProductId(item) === productId,
		);
		if (exists) {
			throw new Error("Product already in wishlist");
		}

		wishlist.items.push({ product: productId as any, addedAt: new Date() });
		await wishlist.save();
		const populated = await wishlist.populate("items.product");
		return populated;
	} catch (error: any) {
		throw new Error(error.message);
	}
};

interface RemoveFromWishlist {
	userId: string;
	productId: string;
}

export const removeFromWishlist = async ({
	userId,
	productId,
}: RemoveFromWishlist) => {
	try {
		const wishlist = await wishlistModel.findOne({ userId });
		if (!wishlist) {
			throw new Error("Wishlist not found");
		}

		wishlist.items = wishlist.items.filter(
			(item) => getWishlistProductId(item) !== productId,
		);
		await wishlist.save();
		const populated = await wishlist.populate("items.product");
		return populated;
	} catch (error: any) {
		throw new Error(error.message);
	}
};

interface CheckInWishlist {
	userId: string;
	productId: string;
}

export const checkInWishlist = async ({
	userId,
	productId,
}: CheckInWishlist) => {
	try {
		const wishlist = await wishlistModel.findOne({ userId });
		if (!wishlist) return false;
		return wishlist.items.some(
			(item) => getWishlistProductId(item) === productId,
		);
	} catch (error: any) {
		return false;
	}
};

export const clearWishlist = async ({ userId }: GetWishlist) => {
	try {
		const wishlist = await wishlistModel.findOne({ userId });
		if (!wishlist) {
			throw new Error("Wishlist not found");
		}
		wishlist.items = [];
		await wishlist.save();
		return { message: "Wishlist cleared" };
	} catch (error: any) {
		throw new Error(error.message);
	}
};
