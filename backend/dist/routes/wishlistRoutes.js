"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const wishlistService_1 = require("../services/wishlistService");
const router = express_1.default.Router();
router.get("/", auth_middleware_1.authenticate, async (req, res) => {
    try {
        const wishlist = await (0, wishlistService_1.getWishlist)({ userId: req.user.id });
        res.status(200).json(wishlist);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
router.get("/check/:productId", auth_middleware_1.authenticate, async (req, res) => {
    try {
        const inWishlist = await (0, wishlistService_1.checkInWishlist)({
            userId: req.user.id,
            productId: req.params.productId,
        });
        res.status(200).json({ inWishlist });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
router.post("/:productId", auth_middleware_1.authenticate, async (req, res) => {
    try {
        const wishlist = await (0, wishlistService_1.addToWishlist)({
            userId: req.user.id,
            productId: req.params.productId,
        });
        res.status(200).json(wishlist);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
router.delete("/:productId", auth_middleware_1.authenticate, async (req, res) => {
    try {
        const wishlist = await (0, wishlistService_1.removeFromWishlist)({
            userId: req.user.id,
            productId: req.params.productId,
        });
        res.status(200).json(wishlist);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
router.delete("/", auth_middleware_1.authenticate, async (req, res) => {
    try {
        const result = await (0, wishlistService_1.clearWishlist)({ userId: req.user.id });
        res.status(200).json(result);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.default = router;
