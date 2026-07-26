import mongoose, { Schema, Document, ObjectId } from "mongoose";

export interface IReview extends Document {
	productId: ObjectId | string;
	userId: ObjectId | string;
	rating: number;
	comment: string;
	isVerifiedPurchase: boolean;
	createdAt?: Date;
	updatedAt?: Date;
}

const reviewSchema = new Schema<IReview>(
	{
		productId: {
			type: Schema.Types.ObjectId,
			ref: "Product",
			required: true,
			index: true,
		},
		userId: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		rating: {
			type: Number,
			required: true,
			min: 1,
			max: 5,
		},
		comment: {
			type: String,
			required: true,
			maxlength: 1000,
		},
		isVerifiedPurchase: {
			type: Boolean,
			default: false,
		},
	},
	{ timestamps: true },
);

// Ensure one review per user per product
reviewSchema.index({ productId: 1, userId: 1 }, { unique: true });
reviewSchema.index({ productId: 1, rating: -1 });

export const reviewModel = mongoose.model<IReview>("Review", reviewSchema);
