import mongoose, { Document, Schema } from "mongoose";

export interface IProduct extends Document {
	name: string;
	description: string;
	price: number;
	category: string;
	brand: string;
	stock: number;
	imageUrl: string;
}

const productSchema = new Schema<IProduct>(
	{
		name: { type: String, required: true },
		description: { type: String, required: true },
		price: { type: Number, required: true },
		category: { type: String, required: true },
		brand: { type: String, required: true },
		stock: { type: Number, required: true, default: 0 },
		imageUrl: { type: String, required: true },
	},
	{
		timestamps: true,
	},
);

export const productModel = mongoose.model<IProduct>("Product", productSchema);
