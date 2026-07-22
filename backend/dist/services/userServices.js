"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllUsers = exports.getmebytoken = exports.loginUser = exports.registerUser = void 0;
const userModel_1 = require("../models/userModel");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const pagination_1 = require("../utils/pagination");
const registerUser = async ({ firstName, lastName, email, password, role, }) => {
    try {
        const existingUser = await userModel_1.userModel.findOne({ email });
        if (existingUser) {
            throw new Error("User with this email already exists");
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const user = await userModel_1.userModel.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            role: role || "user",
        });
        // نجيب اليوزر تاني من غير الباسورد
        const userWithoutPassword = await userModel_1.userModel
            .findById(user._id)
            .select("-password");
        return userWithoutPassword;
    }
    catch (error) {
        throw new Error(error.message);
    }
};
exports.registerUser = registerUser;
const loginUser = async ({ email, password }) => {
    try {
        const existingUser = await userModel_1.userModel.findOne({ email });
        if (!existingUser) {
            throw new Error("Invalid email or password");
        }
        const isPasswordValid = await bcrypt_1.default.compare(password, existingUser.password);
        if (!isPasswordValid) {
            throw new Error("Invalid email or password");
        }
        const token = jsonwebtoken_1.default.sign({ id: existingUser._id, role: existingUser.role }, process.env.JWT_SECRET || "", { expiresIn: "1h" });
        const userWithoutPassword = await userModel_1.userModel
            .findById(existingUser._id)
            .select("-password");
        // return existingUser;
        return { message: "Login successful", user: userWithoutPassword, token };
    }
    catch (error) {
        throw new Error(error.message);
    }
};
exports.loginUser = loginUser;
// Get the authenticated user's profile
const getmebytoken = async (req, res) => {
    try {
        const id = req.user.id;
        const user = await userModel_1.userModel.findById(id).select("-password"); // Exclude the password field
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
        return user;
    }
    catch (error) {
        throw new Error(error.message);
    }
};
exports.getmebytoken = getmebytoken;
//Get All Users with Pagination, Search, Filter, Sort
const getAllUsers = async (queryParams = {}) => {
    try {
        const { page, limit, skip, sortBy, sortOrder } = (0, pagination_1.parsePaginationParams)(queryParams);
        const filter = {};
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
            userModel_1.userModel
                .find(filter)
                .select("-password")
                .sort({ [sortField]: sortOrder })
                .skip(skip)
                .limit(limit)
                .lean(),
            userModel_1.userModel.countDocuments(filter),
        ]);
        const paginated = (0, pagination_1.buildPaginatedResponse)(users, totalItems, page, limit);
        return {
            ...paginated,
            users: paginated.data,
            count: totalItems,
        };
    }
    catch (error) {
        throw new Error(error.message);
    }
};
exports.getAllUsers = getAllUsers;
