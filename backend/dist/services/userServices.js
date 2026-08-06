"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllUsers = exports.toggleUserActive = exports.deleteUser = exports.updateUser = exports.getmebytoken = exports.createUserByAdmin = exports.deleteOwnAccount = exports.updateProfile = exports.getProfile = exports.verifyEmail = exports.loginUser = exports.registerUser = void 0;
const userModel_1 = require("../models/userModel");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const pagination_1 = require("../utils/pagination");
const emailService_1 = require("../utils/emailService");
const validatePasswordStrength = (password) => {
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
const registerUser = async ({ firstName, lastName, email, password, confirmPassword, role, }) => {
    try {
        const existingUser = await userModel_1.userModel.findOne({ email });
        if (existingUser) {
            if (existingUser.isVerified) {
                throw new Error("User with this email already exists");
            }
            const verificationToken = crypto_1.default.randomBytes(32).toString("hex");
            existingUser.verificationToken = verificationToken;
            await existingUser.save();
            const frontendUrl = process.env.FRONTEND_URL || "https://luxeestore.vercel.app";
            const verificationUrl = `${frontendUrl}/verify-email?token=${verificationToken}`;
            (0, emailService_1.sendVerificationEmail)(email, verificationUrl).catch((err) => console.error("❌ Error sending verification email:", err));
            return {
                message: "A new verification email has been sent. Please check your inbox.",
            };
        }
        if (password !== confirmPassword) {
            throw new Error("Passwords do not match");
        }
        const strengthError = validatePasswordStrength(password);
        if (strengthError) {
            throw new Error(strengthError);
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const verificationToken = crypto_1.default.randomBytes(32).toString("hex");
        const user = await userModel_1.userModel.create({
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
        (0, emailService_1.sendVerificationEmail)(email, verificationUrl).catch((err) => console.error("❌ Error sending verification email:", err));
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
        if (!existingUser.isVerified) {
            throw new Error("Please verify your email address before logging in");
        }
        const token = jsonwebtoken_1.default.sign({ id: existingUser._id, role: existingUser.role }, process.env.JWT_SECRET || "", { expiresIn: "1h" });
        const userWithoutPassword = await userModel_1.userModel
            .findById(existingUser._id)
            .select("-password");
        return { message: "Login successful", user: userWithoutPassword, token };
    }
    catch (error) {
        throw new Error(error.message);
    }
};
exports.loginUser = loginUser;
const verifyEmail = async (token) => {
    try {
        if (!token) {
            throw new Error("Verification token is required");
        }
        const user = await userModel_1.userModel.findOne({
            verificationToken: token,
        });
        if (!user) {
            throw new Error("Invalid or expired verification token");
        }
        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();
        return {
            message: "Email verified successfully. You can now log in.",
        };
    }
    catch (error) {
        throw new Error(error.message);
    }
};
exports.verifyEmail = verifyEmail;
// Get the authenticated user's profile
const getProfile = async (userId) => {
    try {
        const user = await userModel_1.userModel.findById(userId).select("-password");
        if (!user) {
            throw new Error("User not found");
        }
        return user;
    }
    catch (error) {
        throw new Error(error.message);
    }
};
exports.getProfile = getProfile;
// Update user profile (own data only)
const updateProfile = async (userId, updateData) => {
    try {
        const user = await userModel_1.userModel
            .findByIdAndUpdate(userId, updateData, {
            new: true,
            runValidators: true,
        })
            .select("-password");
        if (!user) {
            throw new Error("User not found");
        }
        return user;
    }
    catch (error) {
        throw new Error(error.message);
    }
};
exports.updateProfile = updateProfile;
// Delete own account
const deleteOwnAccount = async (userId) => {
    try {
        const user = await userModel_1.userModel.findByIdAndDelete(userId);
        if (!user) {
            throw new Error("User not found");
        }
        return { message: "Account deleted successfully" };
    }
    catch (error) {
        throw new Error(error.message);
    }
};
exports.deleteOwnAccount = deleteOwnAccount;
// Create user by admin (no email verification, account is active immediately)
const createUserByAdmin = async ({ firstName, lastName, email, password, role, }) => {
    try {
        const existingUser = await userModel_1.userModel.findOne({ email });
        if (existingUser) {
            throw new Error("User with this email already exists");
        }
        if (password !== password) {
            throw new Error("Passwords do not match");
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const user = await userModel_1.userModel.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            role: role || "user",
            isVerified: true,
            verificationToken: undefined,
        });
        const userWithoutPassword = await userModel_1.userModel
            .findById(user._id)
            .select("-password");
        return userWithoutPassword;
    }
    catch (error) {
        throw new Error(error.message);
    }
};
exports.createUserByAdmin = createUserByAdmin;
const getmebytoken = async (userId) => {
    try {
        const user = await userModel_1.userModel.findById(userId).select("-password");
        if (!user) {
            throw new Error("User not found");
        }
        return user;
    }
    catch (error) {
        throw new Error(error.message);
    }
};
exports.getmebytoken = getmebytoken;
// Update user
const updateUser = async (userId, updateData) => {
    try {
        const user = await userModel_1.userModel
            .findByIdAndUpdate(userId, updateData, {
            new: true,
            runValidators: true,
        })
            .select("-password");
        if (!user) {
            throw new Error("User not found");
        }
        return user;
    }
    catch (error) {
        throw new Error(error.message);
    }
};
exports.updateUser = updateUser;
// Delete user
const deleteUser = async (userId) => {
    try {
        const user = await userModel_1.userModel.findByIdAndDelete(userId);
        if (!user) {
            throw new Error("User not found");
        }
        return { message: "User deleted successfully" };
    }
    catch (error) {
        throw new Error(error.message);
    }
};
exports.deleteUser = deleteUser;
// Toggle user active status
const toggleUserActive = async (userId) => {
    try {
        const user = await userModel_1.userModel.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }
        user.isActive = !user.isActive;
        await user.save();
        return { isActive: user.isActive };
    }
    catch (error) {
        throw new Error(error.message);
    }
};
exports.toggleUserActive = toggleUserActive;
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
        if (queryParams.isActive !== undefined &&
            queryParams.isActive !== "") {
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
