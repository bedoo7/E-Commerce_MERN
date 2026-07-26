import mongoose, { Schema, Document } from "mongoose";

export type CouponDiscountType = "percentage" | "fixed";

export interface ICoupon extends Document {
	code: string;
	discountType?: CouponDiscountType;
	discountPercent: number;
	discountValue?: number;
	minOrderAmount: number;
	expiresAt: Date;
	usageLimit: number;
	usedCount: number;
	isActive: boolean;
	createdAt?: Date;
	updatedAt?: Date;
}

const couponSchema = new Schema<ICoupon>(
	{
		code: {
			type: String,
			required: true,
			unique: true,
			uppercase: true,
			trim: true,
		},
		discountType: {
			type: String,
			enum: ["percentage", "fixed"],
			default: "percentage",
		},
		discountPercent: {
			type: Number,
			default: 0,
			min: 0,
			max: 100,
		},
		discountValue: {
			type: Number,
			default: 0,
			min: 0,
		},
		minOrderAmount: {
			type: Number,
			default: 0,
		},
		expiresAt: {
			type: Date,
			required: true,
		},
		usageLimit: {
			type: Number,
			default: 0,
		},
		usedCount: {
			type: Number,
			default: 0,
		},
		isActive: {
			type: Boolean,
			default: true,
		},
	},
	{ timestamps: true },
);

export const couponModel = mongoose.model<ICoupon>("Coupon", couponSchema);
