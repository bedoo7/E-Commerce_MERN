import mongoose, { Document, Schema } from "mongoose";
export interface IUser extends Document {
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	role: "user" | "admin";
}

const userSchema = new Schema<IUser>(
	{
		firstName: { type: String, required: true },
		lastName: { type: String, required: true },
		email: { type: String, required: true, unique: true },
		password: { type: String, required: true },
		role: { type: String, enum: ["user", "admin"], default: "user" },
	},
	{
		timestamps: true,
	},
);

export const userModel = mongoose.model<IUser>("User", userSchema);
