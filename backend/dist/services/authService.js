"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgotPassword = void 0;
const crypto_1 = __importDefault(require("crypto"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const userModel_1 = require("../models/userModel");
const emailService_1 = require("../utils/emailService");
const forgotPassword = async (email) => {
    // Generic response to prevent email enumeration
    const genericResponse = {
        message: "If an account with that email exists, a password reset link has been sent.",
    };
    try {
        const user = await userModel_1.userModel.findOne({ email });
        // Always return generic response regardless of whether user exists
        if (!user) {
            return genericResponse;
        }
        // Generate a secure random token
        const resetToken = crypto_1.default.randomBytes(32).toString("hex");
        // Hash the token before storing in DB
        const hashedToken = crypto_1.default
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");
        // Store hashed token with 15-minute expiration
        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        await user.save();
        // Send email with the raw token (not hashed)
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;
        (0, emailService_1.sendPasswordResetEmail)(email, resetUrl).catch((err) => console.error("❌ Error sending password reset email:", err));
        return genericResponse;
    }
    catch (error) {
        console.error("Forgot password error:", error);
        return genericResponse;
    }
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (token, newPassword) => {
    try {
        if (!token) {
            throw new Error("Invalid or expired reset token");
        }
        // Validate password strength
        if (newPassword.length < 6) {
            throw new Error("Password must be at least 6 characters long");
        }
        // Hash the provided token to compare with stored hash
        const hashedToken = crypto_1.default.createHash("sha256").update(token).digest("hex");
        // Find user with valid token that hasn't expired
        const user = await userModel_1.userModel.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: new Date() },
        });
        if (!user) {
            throw new Error("Invalid or expired reset token");
        }
        // Hash the new password
        const hashedPassword = await bcrypt_1.default.hash(newPassword, 10);
        // Update password and clear reset fields
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        return {
            message: "Password has been successfully reset. You can now log in with your new password.",
        };
    }
    catch (error) {
        throw new Error(error.message);
    }
};
exports.resetPassword = resetPassword;
