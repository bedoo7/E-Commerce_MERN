"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearWishlist = exports.checkInWishlist = exports.removeFromWishlist = exports.addToWishlist = exports.getWishlist = void 0;
const wishlistModel_1 = require("../models/wishlistModel");
const productModel_1 = require("../models/productModel");
const getWishlistProductId = (item) => {
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
const sanitizeWishlistItems = (wishlist) => {
    const validItems = wishlist.items.filter((item) => {
        return getWishlistProductId(item) !== null;
    });
    if (validItems.length !== wishlist.items.length) {
        wishlist.items = validItems;
    }
    return wishlist;
};
const getOrCreateWishlist = async (userId) => {
    let wishlist = await wishlistModel_1.wishlistModel
        .findOne({ userId })
        .populate("items.product");
    if (!wishlist) {
        wishlist = await wishlistModel_1.wishlistModel.create({ userId, items: [] });
        return wishlist;
    }
    const sanitizedWishlist = sanitizeWishlistItems(wishlist);
    if (sanitizedWishlist.items.length !== wishlist.items.length) {
        await sanitizedWishlist.save();
    }
    return sanitizedWishlist;
};
const getWishlist = async ({ userId }) => {
    try {
        const wishlist = await getOrCreateWishlist(userId);
        return wishlist;
    }
    catch (error) {
        throw new Error(error.message);
    }
};
exports.getWishlist = getWishlist;
const addToWishlist = async ({ userId, productId }) => {
    try {
        const product = await productModel_1.productModel.findById(productId);
        if (!product) {
            throw new Error("Product not found");
        }
        const wishlist = await wishlistModel_1.wishlistModel.findOne({ userId });
        if (!wishlist) {
            const newWishlist = await wishlistModel_1.wishlistModel.create({
                userId,
                items: [{ product: productId }],
            });
            const populated = await newWishlist.populate("items.product");
            return populated;
        }
        const exists = wishlist.items.find((item) => getWishlistProductId(item) === productId);
        if (exists) {
            throw new Error("Product already in wishlist");
        }
        wishlist.items.push({ product: productId, addedAt: new Date() });
        await wishlist.save();
        const populated = await wishlist.populate("items.product");
        return populated;
    }
    catch (error) {
        throw new Error(error.message);
    }
};
exports.addToWishlist = addToWishlist;
const removeFromWishlist = async ({ userId, productId, }) => {
    try {
        const wishlist = await wishlistModel_1.wishlistModel.findOne({ userId });
        if (!wishlist) {
            throw new Error("Wishlist not found");
        }
        wishlist.items = wishlist.items.filter((item) => getWishlistProductId(item) !== productId);
        await wishlist.save();
        const populated = await wishlist.populate("items.product");
        return populated;
    }
    catch (error) {
        throw new Error(error.message);
    }
};
exports.removeFromWishlist = removeFromWishlist;
const checkInWishlist = async ({ userId, productId, }) => {
    try {
        const wishlist = await wishlistModel_1.wishlistModel.findOne({ userId });
        if (!wishlist)
            return false;
        return wishlist.items.some((item) => getWishlistProductId(item) === productId);
    }
    catch (error) {
        return false;
    }
};
exports.checkInWishlist = checkInWishlist;
const clearWishlist = async ({ userId }) => {
    try {
        const wishlist = await wishlistModel_1.wishlistModel.findOne({ userId });
        if (!wishlist) {
            throw new Error("Wishlist not found");
        }
        wishlist.items = [];
        await wishlist.save();
        return { message: "Wishlist cleared" };
    }
    catch (error) {
        throw new Error(error.message);
    }
};
exports.clearWishlist = clearWishlist;
