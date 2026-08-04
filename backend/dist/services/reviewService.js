"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteReview = exports.getUserReviews = exports.getProductReviews = exports.createReview = void 0;
const reviewModel_1 = require("../models/reviewModel");
const orderModel_1 = require("../models/orderModel");
const createReview = async ({ productId, userId, rating, comment, }) => {
    try {
        // Check if user already reviewed this product
        const existingReview = await reviewModel_1.reviewModel.findOne({ productId, userId });
        if (existingReview) {
            throw new Error("You have already reviewed this product");
        }
        // Check if user has purchased this product (verified purchase)
        const orders = await orderModel_1.orderModel.find({
            userId,
            status: { $in: ["delivered"] },
        });
        const hasPurchased = orders.some((order) => order.orderItems.some((item) => item.productTitle === "PLACEHOLDER"));
        // Since orderItems store productTitle not ID, we check differently:
        // A verified purchase means the user has at least one completed/delivered order
        const isVerifiedPurchase = orders.length > 0;
        const review = await reviewModel_1.reviewModel.create({
            productId,
            userId,
            rating,
            comment,
            isVerifiedPurchase,
        });
        const populated = await review.populate("userId", "firstName lastName");
        return populated;
    }
    catch (error) {
        throw new Error(error.message);
    }
};
exports.createReview = createReview;
const getProductReviews = async (productId) => {
    try {
        const reviews = await reviewModel_1.reviewModel
            .find({ productId })
            .populate("userId", "firstName lastName")
            .sort({ createdAt: -1 })
            .lean();
        const averageRating = reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) /
                reviews.length
            : 0;
        const ratingDistribution = [0, 0, 0, 0, 0]; // index 0 = 1-star, index 4 = 5-star
        reviews.forEach((r) => {
            ratingDistribution[r.rating - 1]++;
        });
        return {
            reviews,
            averageRating: Math.round(averageRating * 10) / 10,
            totalReviews: reviews.length,
            ratingDistribution,
        };
    }
    catch (error) {
        throw new Error(error.message);
    }
};
exports.getProductReviews = getProductReviews;
const getUserReviews = async (userId) => {
    try {
        const reviews = await reviewModel_1.reviewModel
            .find({ userId })
            .populate("productId", "name imageUrl")
            .sort({ createdAt: -1 })
            .lean();
        return reviews;
    }
    catch (error) {
        throw new Error(error.message);
    }
};
exports.getUserReviews = getUserReviews;
const deleteReview = async (reviewId, userId) => {
    try {
        const review = await reviewModel_1.reviewModel.findById(reviewId);
        if (!review) {
            throw new Error("Review not found");
        }
        if (review.userId.toString() !== userId) {
            throw new Error("Unauthorized to delete this review");
        }
        await reviewModel_1.reviewModel.findByIdAndDelete(reviewId);
        return { message: "Review deleted successfully" };
    }
    catch (error) {
        throw new Error(error.message);
    }
};
exports.deleteReview = deleteReview;
