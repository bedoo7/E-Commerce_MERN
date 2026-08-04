"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const reviewService_1 = require("../services/reviewService");
const router = express_1.default.Router();
// Get reviews for a product (public)
router.get("/product/:productId", async (req, res) => {
    try {
        const result = await (0, reviewService_1.getProductReviews)(req.params.productId);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
// Create a review (authenticated)
router.post("/", auth_middleware_1.authenticate, async (req, res) => {
    try {
        const { productId, rating, comment } = req.body;
        if (!productId || !rating || !comment) {
            return res
                .status(400)
                .json({ message: "ProductId, rating, and comment are required" });
        }
        if (rating < 1 || rating > 5) {
            return res
                .status(400)
                .json({ message: "Rating must be between 1 and 5" });
        }
        const review = await (0, reviewService_1.createReview)({
            productId,
            userId: req.user.id,
            rating,
            comment,
        });
        res.status(201).json(review);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
// Delete a review (authenticated)
router.delete("/:reviewId", auth_middleware_1.authenticate, async (req, res) => {
    try {
        const result = await (0, reviewService_1.deleteReview)(req.params.reviewId, req.user.id);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.default = router;
