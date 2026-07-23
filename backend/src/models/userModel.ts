import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	role: "user" | "admin";
	isActive: boolean;
	resetPasswordToken?: string;
	resetPasswordExpires?: Date;
}

const userSchema = new Schema<IUser>(
	{
		firstName: { type: String, required: true },
		lastName: { type: String, required: true },
		email: { type: String, required: true, unique: true },
		password: { type: String, required: true },
		role: { type: String, enum: ["user", "admin"], default: "user" },
		isActive: { type: Boolean, default: true },
		resetPasswordToken: { type: String },
		resetPasswordExpires: { type: Date },
	},
	{
		timestamps: true,
	},
);

export const userModel = mongoose.model<IUser>("User", userSchema);
