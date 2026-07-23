import { userModel, IUser } from "../models/userModel";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
	buildPaginatedResponse,
	parsePaginationParams,
	PaginatedResponse,
} from "../utils/pagination";

export interface UserQueryParams {
	page?: string | number;
	limit?: string | number;
	search?: string;
	role?: string;
	sortBy?: string;
	sortOrder?: string;
}

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
	try {
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

		// نجيب اليوزر تاني من غير الباسورد
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

		const token = jwt.sign(
			{ id: existingUser._id, role: existingUser.role },
			process.env.JWT_SECRET || "",
			{ expiresIn: "1h" },
		);

		const userWithoutPassword = await userModel
			.findById(existingUser._id)
			.select("-password");

		// return existingUser;

		return { message: "Login successful", user: userWithoutPassword, token };
	} catch (error: any) {
		throw new Error(error.message);
	}
};

// Get the authenticated user's profile
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
