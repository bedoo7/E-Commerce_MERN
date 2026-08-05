import { userModel, IUser } from "../models/userModel";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import {
	buildPaginatedResponse,
	parsePaginationParams,
	PaginatedResponse,
} from "../utils/pagination";
import { sendVerificationEmail } from "../utils/emailService";

export interface UserQueryParams {
	page?: string | number;
	limit?: string | number;
	search?: string;
	role?: string;
	isActive?: string | boolean;
	startDate?: string;
	endDate?: string;
	sortBy?: string;
	sortOrder?: string;
}

interface RegisterParams {
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	confirmPassword: string;
	role?: "user" | "admin";
}

const validatePasswordStrength = (password: string): string | null => {
	if (password.length < 8) {
		return "Password must be at least 8 characters";
	}
	if (!/[a-z]/.test(password)) {
		return "Password must contain at least one lowercase letter";
	}
	if (!/[A-Z]/.test(password)) {
		return "Password must contain at least one uppercase letter";
	}
	if (!/\d/.test(password)) {
		return "Password must contain at least one number";
	}
	if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
		return "Password must contain at least one special character";
	}
	return null;
};

export const registerUser = async ({
	firstName,
	lastName,
	email,
	password,
	confirmPassword,
	role,
}: RegisterParams) => {
	try {
		const existingUser = await userModel.findOne({ email });
		if (existingUser) {
			if (existingUser.isVerified) {
				throw new Error("User with this email already exists");
			}
			const verificationToken = crypto.randomBytes(32).toString("hex");
			existingUser.verificationToken = verificationToken;
			await existingUser.save();
			const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
			const verificationUrl = `${frontendUrl}/verify-email?token=${verificationToken}`;
			sendVerificationEmail(email, verificationUrl).catch((err) =>
				console.error("❌ Error sending verification email:", err),
			);
			return {
				message:
					"A new verification email has been sent. Please check your inbox.",
			};
		}

		if (password !== confirmPassword) {
			throw new Error("Passwords do not match");
		}

		const strengthError = validatePasswordStrength(password);
		if (strengthError) {
			throw new Error(strengthError);
		}

		const hashedPassword = await bcrypt.hash(password, 10);

		const verificationToken = crypto.randomBytes(32).toString("hex");

		const user = await userModel.create({
			firstName,
			lastName,
			email,
			password: hashedPassword,
			role: role || "user",
			isVerified: false,
			verificationToken,
		});

		const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
		const verificationUrl = `${frontendUrl}/verify-email?token=${verificationToken}`;

		sendVerificationEmail(email, verificationUrl).catch((err) =>
			console.error("❌ Error sending verification email:", err),
		);

		const userWithoutPassword = await userModel
			.findById(user._id)
			.select("-password");

		return userWithoutPassword;
	} catch (error: any) {
		throw new Error(error.message);
	}
};

interface LoginParams {
	email: string;
	password: string;
}

export const loginUser = async ({ email, password }: LoginParams) => {
	try {
		const existingUser = await userModel.findOne({ email });
		if (!existingUser) {
			throw new Error("Invalid email or password");
		}

		const isPasswordValid = await bcrypt.compare(
			password,
			existingUser.password,
		);
		if (!isPasswordValid) {
			throw new Error("Invalid email or password");
		}

		if (!existingUser.isVerified) {
			throw new Error(
				"Please verify your email address before logging in",
			);
		}

		const token = jwt.sign(
			{ id: existingUser._id, role: existingUser.role },
			process.env.JWT_SECRET || "",
			{ expiresIn: "1h" },
		);

		const userWithoutPassword = await userModel
			.findById(existingUser._id)
			.select("-password");

		return { message: "Login successful", user: userWithoutPassword, token };
	} catch (error: any) {
		throw new Error(error.message);
	}
};

export const verifyEmail = async (token: string) => {
	try {
		if (!token) {
			throw new Error("Verification token is required");
		}

		const user = await userModel.findOne({
			verificationToken: token,
		});

		if (!user) {
			throw new Error("Invalid or expired verification token");
		}

		user.isVerified = true;
		user.verificationToken = undefined;
		await user.save();

		return {
			message:
				"Email verified successfully. You can now log in.",
		};
	} catch (error: any) {
		throw new Error(error.message);
	}
};

// Get the authenticated user's profile
export const getProfile = async (userId: string) => {
	try {
		const user = await userModel.findById(userId).select("-password");
		if (!user) {
			throw new Error("User not found");
		}
		return user;
	} catch (error: any) {
		throw new Error(error.message);
	}
};

// Update user profile (own data only)
export const updateProfile = async (
	userId: string,
	updateData: {
		firstName?: string;
		lastName?: string;
		email?: string;
		phone?: string;
		address?: string;
	},
) => {
	try {
		const user = await userModel
			.findByIdAndUpdate(userId, updateData, {
				new: true,
				runValidators: true,
			})
			.select("-password");
		if (!user) {
			throw new Error("User not found");
		}
		return user;
	} catch (error: any) {
		throw new Error(error.message);
	}
};

// Get me by token (legacy, used by AuthContext)
export const getmebytoken = async (userId: string) => {
	try {
		const user = await userModel.findById(userId).select("-password");

		if (!user) {
			throw new Error("User not found");
		}

		return user;
	} catch (error: any) {
		throw new Error(error.message);
	}
};

// Update user
export const updateUser = async (
	userId: string,
	updateData: {
		firstName?: string;
		lastName?: string;
		email?: string;
		role?: string;
	},
) => {
	try {
		const user = await userModel
			.findByIdAndUpdate(userId, updateData, {
				new: true,
				runValidators: true,
			})
			.select("-password");
		if (!user) {
			throw new Error("User not found");
		}
		return user;
	} catch (error: any) {
		throw new Error(error.message);
	}
};

// Delete user
export const deleteUser = async (userId: string) => {
	try {
		const user = await userModel.findByIdAndDelete(userId);
		if (!user) {
			throw new Error("User not found");
		}
		return { message: "User deleted successfully" };
	} catch (error: any) {
		throw new Error(error.message);
	}
};

// Toggle user active status
export const toggleUserActive = async (userId: string) => {
	try {
		const user = await userModel.findById(userId);
		if (!user) {
			throw new Error("User not found");
		}
		user.isActive = !user.isActive;
		await user.save();
		return { isActive: user.isActive };
	} catch (error: any) {
		throw new Error(error.message);
	}
};

//Get All Users with Pagination, Search, Filter, Sort
export const getAllUsers = async (
	queryParams: UserQueryParams = {},
): Promise<PaginatedResponse<IUser> & { users: IUser[]; count: number }> => {
	try {
		const { page, limit, skip, sortBy, sortOrder } =
			parsePaginationParams(queryParams);

		const filter: Record<string, any> = {};

		if (queryParams.search && queryParams.search.trim()) {
			const searchRegex = new RegExp(queryParams.search.trim(), "i");
			filter.$or = [
				{ firstName: searchRegex },
				{ lastName: searchRegex },
				{ email: searchRegex },
			];
		}

		if (queryParams.role && ["user", "admin"].includes(queryParams.role)) {
			filter.role = queryParams.role;
		}

		if (
			queryParams.isActive !== undefined &&
			queryParams.isActive !== ""
		) {
			filter.isActive =
				queryParams.isActive === "true" || queryParams.isActive === true;
		}

		if (queryParams.startDate) {
			filter.createdAt = filter.createdAt || {};
			filter.createdAt.$gte = new Date(queryParams.startDate);
		}
		if (queryParams.endDate) {
			filter.createdAt = filter.createdAt || {};
			filter.createdAt.$lte = new Date(queryParams.endDate);
		}

		const allowedSortFields = [
			"createdAt",
			"firstName",
			"lastName",
			"email",
			"role",
		];
		const sortField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";

		const [users, totalItems] = await Promise.all([
			userModel
				.find(filter)
				.select("-password")
				.sort({ [sortField]: sortOrder })
				.skip(skip)
				.limit(limit)
				.lean(),
			userModel.countDocuments(filter),
		]);

		const paginated = buildPaginatedResponse(
			users as IUser[],
			totalItems,
			page,
			limit,
		);

		return {
			...paginated,
			users: paginated.data,
			count: totalItems,
		};
	} catch (error: any) {
		throw new Error(error.message);
	}
};
