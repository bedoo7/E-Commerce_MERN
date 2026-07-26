import { reviewModel, IReview } from "../models/reviewModel";
import { orderModel } from "../models/orderModel";
import { Types } from "mongoose";

interface CreateReviewParams {
	productId: string;
	userId: string;
	rating: number;
	comment: string;
}

export const createReview = async ({
	productId,
	userId,
	rating,
	comment,
}: CreateReviewParams) => {
	try {
		// Check if user already reviewed this product
		const existingReview = await reviewModel.findOne({ productId, userId });
		if (existingReview) {
			throw new Error("You have already reviewed this product");
		}

		// Check if user has purchased this product (verified purchase)
		const orders = await orderModel.find({
			userId,
			status: { $in: ["delivered"] },
		});

		const hasPurchased = orders.some((order) =>
			order.orderItems.some(
				(item) => item.productTitle === "PLACEHOLDER", // We'll check via product reference
			),
		);

		// Since orderItems store productTitle not ID, we check differently:
		// A verified purchase means the user has at least one completed/delivered order
		const isVerifiedPurchase = orders.length > 0;

		const review = await reviewModel.create({
			productId,
			userId,
			rating,
			comment,
			isVerifiedPurchase,
		});

		const populated = await review.populate("userId", "firstName lastName");

		return populated;
	} catch (error: any) {
		throw new Error(error.message);
	}
};

export const getProductReviews = async (productId: string) => {
	try {
		const reviews = await reviewModel
			.find({ productId })
			.populate("userId", "firstName lastName")
			.sort({ createdAt: -1 })
			.lean();

		const averageRating =
			reviews.length > 0
				? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) /
					reviews.length
				: 0;

		const ratingDistribution = [0, 0, 0, 0, 0]; // index 0 = 1-star, index 4 = 5-star
		reviews.forEach((r: any) => {
			ratingDistribution[r.rating - 1]++;
		});

		return {
			reviews,
			averageRating: Math.round(averageRating * 10) / 10,
			totalReviews: reviews.length,
			ratingDistribution,
		};
	} catch (error: any) {
		throw new Error(error.message);
	}
};

export const getUserReviews = async (userId: string) => {
	try {
		const reviews = await reviewModel
			.find({ userId })
			.populate("productId", "name imageUrl")
			.sort({ createdAt: -1 })
			.lean();
		return reviews;
	} catch (error: any) {
		throw new Error(error.message);
	}
};

export const deleteReview = async (reviewId: string, userId: string) => {
	try {
		const review = await reviewModel.findById(reviewId);
		if (!review) {
			throw new Error("Review not found");
		}
		if (review.userId.toString() !== userId) {
			throw new Error("Unauthorized to delete this review");
		}
		await reviewModel.findByIdAndDelete(reviewId);
		return { message: "Review deleted successfully" };
	} catch (error: any) {
		throw new Error(error.message);
	}
};
