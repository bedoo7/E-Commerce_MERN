import { userModel } from "../models/userModel";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

interface RegisterParams {
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	role?: "user" | "admin";
}

export const registerUser = async ({
	firstName,
	lastName,
	email,
	password,
	role,
}: RegisterParams) => {
	const existingUser = await userModel.findOne({ email });
	if (existingUser) {
		throw new Error("User with this email already exists");
	}

	const hashedPassword = await bcrypt.hash(password, 10);

	const user = await userModel.create({
		firstName,
		lastName,
		email,
		password: hashedPassword,
		role: role || "user",
	});

	return user;
};

interface LoginParams {
	email: string;
	password: string;
}

export const loginUser = async ({ email, password }: LoginParams) => {
	const existingUser = await userModel.findOne({ email });
	if (!existingUser) {
		throw new Error("Invalid email or password");
	}

	const isPasswordValid = await bcrypt.compare(password, existingUser.password);
	if (!isPasswordValid) {
		throw new Error("Invalid email or password");
	}

	const token = jwt.sign(
		{ id: existingUser._id, role: existingUser.role },
		process.env.JWT_SECRET || "asdasdaxdsxc",
		{ expiresIn: "1h" },
	);

	// return existingUser;

	return { message: "Login successful", user: existingUser, token };
};

// Get the authenticated user's profile
export const getmebytoken = async (req: any, res: any) => {
	const id = req.user.id;
	const user = await userModel.findById(id).select("-password"); // Exclude the password field

	if (!user) {
		return res.status(404).json({ message: "User not found" });
	}

	res.status(200).json(user);

	return user;
};

//Get All Users
export const getAllUsers = async () => {
	const users = await userModel.find().select("-password"); // Exclude the password field
	return {
		users,
		count: users.length,
	};
};
