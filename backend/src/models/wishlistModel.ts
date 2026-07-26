import mongoose, { Schema, Document, ObjectId } from "mongoose";

export interface IWishlistItem {
	product: ObjectId | string | null;
	addedAt: Date;
}

export interface IWishlist extends Document {
	userId: ObjectId | string;
	items: IWishlistItem[];
}

const wishlistItemSchema = new Schema<IWishlistItem>({
	product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
	addedAt: { type: Date, default: Date.now },
});

const wishlistSchema = new Schema<IWishlist>(
	{
		userId: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
			unique: true,
		},
		items: [wishlistItemSchema],
	},
	{ timestamps: true },
);

export const wishlistModel = mongoose.model<IWishlist>(
	"Wishlist",
	wishlistSchema,
);
