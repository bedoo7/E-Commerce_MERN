"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cartService_1 = require("../services/cartService");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
router.get("/", auth_middleware_1.authenticate, async (req, res) => {
    const userId = req.user.id;
    try {
        const activeCart = await (0, cartService_1.getActiveCartForUser)({ userId });
        res.status(200).json(activeCart);
    }
    catch (error) {
        res.status(500).json({ message: "Error retrieving active cart", error });
    }
});
router.post("/items", auth_middleware_1.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId, quantity } = req.body;
        const response = await (0, cartService_1.addItemToCart)({ userId, productId, quantity });
        res.status(200).json(response);
    }
    catch (error) {
        res.status(500).json({ message: "Error adding item to cart", error });
    }
});
router.put("/items", auth_middleware_1.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId, quantity } = req.body;
        const response = await (0, cartService_1.updateItemInCart)({ userId, productId, quantity });
        res.status(200).json(response);
    }
    catch (error) {
        res.status(500).json({ message: "Error updating item in cart", error });
    }
});
router.delete("/items/:productId", auth_middleware_1.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.params;
        const response = await (0, cartService_1.deleteItemFromCart)({ userId, productId });
        res.status(200).json(response);
    }
    catch (error) {
        res.status(500).json({ message: "Error deleting item from cart", error });
    }
});
router.delete("/clear", auth_middleware_1.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const response = await (0, cartService_1.clearCart)({ userId });
        res.status(200).json(response);
    }
    catch (error) {
        res.status(500).json({ message: "Error clearing cart", error });
    }
});
router.post("/checkout", auth_middleware_1.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const { address } = req.body;
        const response = await (0, cartService_1.checkout)({ userId, address });
        res.status(200).json(response);
    }
    catch (error) {
        res.status(500).json({ message: "Error during checkout", error });
    }
});
exports.default = router;
