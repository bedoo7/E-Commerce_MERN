"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkout = exports.deleteItemFromCart = exports.clearCart = exports.updateItemInCart = exports.addItemToCart = exports.getActiveCartForUser = void 0;
const cartModel_1 = require("../models/cartModel");
const orderModel_1 = require("../models/orderModel");
const productModel_1 = require("../models/productModel");
const createCartForUser = async ({ userId }) => {
    try {
        const newCart = await cartModel_1.cartModel.create({ userId });
        await newCart.save();
        return newCart;
    }
    catch (error) {
        throw new Error(error.message);
    }
};
const getActiveCartForUser = async ({ userId, }) => {
    try {
        const activeCart = await cartModel_1.cartModel.findOne({ userId, status: "active" });
        if (!activeCart) {
            const newCart = await createCartForUser({ userId });
            return newCart;
        }
        return activeCart;
    }
    catch (error) {
        throw new Error(error.message);
    }
};
exports.getActiveCartForUser = getActiveCartForUser;
const addItemToCart = async ({ userId, productId, quantity, }) => {
    try {
        const cart = await (0, exports.getActiveCartForUser)({ userId });
        // Does the product already exist in the cart?
        const existsInCart = cart.items.find((item) => item.product.equals(productId));
        const product = await productModel_1.productModel.findById(productId);
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
        }
        else {
            cart.items.push({
                product: productId,
                quantity,
                unitPrice: product?.price || 0,
            });
        }
        cart.totalAmount += (product?.price || 0) * quantity;
        const updatedCart = await cart.save();
        return updatedCart;
    }
    catch (error) {
        throw new Error(error.message);
    }
};
exports.addItemToCart = addItemToCart;
const updateItemInCart = async ({ userId, productId, quantity, }) => {
    try {
        const cart = await (0, exports.getActiveCartForUser)({ userId });
        const existsInCart = cart.items.find((item) => item.product.equals(productId));
        if (!existsInCart) {
            return { message: "Item not found in cart" };
        }
        const product = await productModel_1.productModel.findById(productId);
        if (quantity > (product?.stock || 0)) {
            return {
                message: `Cannot add ${quantity} items to cart. Only ${product?.stock} items in stock.`,
            };
        }
        existsInCart.quantity = quantity;
        existsInCart.unitPrice = product?.price || 0;
        cart.totalAmount = cart.items.reduce((total, item) => total + item.quantity * item.unitPrice, 0);
        await cart.save();
        return cart;
    }
    catch (error) {
        throw new Error(error.message);
    }
};
exports.updateItemInCart = updateItemInCart;
const clearCart = async ({ userId }) => {
    try {
        const cart = await (0, exports.getActiveCartForUser)({ userId });
        cart.items = [];
        await cart.save();
        return { message: "Cart cleared successfully" };
    }
    catch (error) {
        throw new Error(error.message);
    }
};
exports.clearCart = clearCart;
const deleteItemFromCart = async ({ userId, productId, }) => {
    try {
        const cart = await (0, exports.getActiveCartForUser)({ userId });
        const existsInCart = cart.items.find((item) => item.product.equals(productId));
        if (!existsInCart) {
            return { message: "Item not found in cart" };
        }
        const otherItems = cart.items.filter((item) => !item.product.equals(productId));
        cart.items = otherItems;
        cart.totalAmount = cart.items.reduce((total, item) => total + item.quantity * item.unitPrice, 0);
        await cart.save();
        return cart;
    }
    catch (error) {
        throw new Error(error.message);
    }
};
exports.deleteItemFromCart = deleteItemFromCart;
const checkout = async ({ userId, address }) => {
    try {
        if (!address) {
            return { message: "Address is required for checkout" };
        }
        const cart = await (0, exports.getActiveCartForUser)({ userId });
        const orderItems = [];
        for (const item of cart.items) {
            const product = await productModel_1.productModel.findById(item.product);
            orderItems.push({
                productTitle: product?.name || "",
                productImage: product?.imageUrl || "",
                quantity: item.quantity,
                unitPrice: item.unitPrice,
            });
        }
        const order = await orderModel_1.orderModel.create({
            userId,
            orderItems,
            totalAmount: cart.totalAmount,
            address,
        });
        await order.save();
        cart.status = "completed";
        await cart.save();
        return order;
    }
    catch (error) {
        throw new Error(error.message);
    }
};
exports.checkout = checkout;
