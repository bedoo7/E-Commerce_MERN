import mongoose, { Schema, ObjectId, Document } from "mongoose";

export interface IOrderItem {
	productTitle: string;
	productImage: string;
	unitPrice: number;
	quantity: number;
}

const orderItemSchema = new Schema<IOrderItem>({
	productTitle: { type: String, required: true },
	productImage: { type: String, required: true },
	unitPrice: { type: Number, required: true },
	quantity: { type: Number, required: true, default: 1 },
});

export type OrderStatus =
	| "pending"
	| "processing"
	| "shipped"
	| "delivered"
	| "cancelled";

export interface IOrder extends Document {
	orderNumber?: string;
	userId: ObjectId | string;
	orderItems: IOrderItem[];
	totalAmount: number;
	subtotal: number;
	discount: number;
	couponCode?: string;
	couponPercent?: number;
	address: string;
	status: OrderStatus;
	createdAt?: Date;
	updatedAt?: Date;
}

const orderSchema = new Schema<IOrder>(
	{
		orderNumber: { type: String, unique: true, sparse: true },
		userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
		orderItems: [orderItemSchema],
		totalAmount: { type: Number, required: true, default: 0 },
		subtotal: { type: Number, default: 0 },
		discount: { type: Number, default: 0 },
		couponCode: { type: String, default: undefined },
		couponPercent: { type: Number, default: undefined },
		address: { type: String, required: true },
		status: {
			type: String,
			enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
			default: "pending",
		},
	},
	{
		timestamps: true,
	},
);

orderSchema.index({ userId: 1, createdAt: -1 });

export const orderModel = mongoose.model<IOrder>("Order", orderSchema);
