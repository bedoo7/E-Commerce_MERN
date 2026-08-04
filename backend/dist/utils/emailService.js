"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendVerificationEmail = exports.sendPasswordResetEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const emailTemplates_1 = require("./emailTemplates");
const createTransporter = () => {
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    if (!emailUser || !emailPass) {
        console.warn("⚠️ EMAIL_USER or EMAIL_PASS not set in .env. Password reset emails will be logged to console instead.");
        return null;
    }
    const transporter = nodemailer_1.default.createTransport({
        service: "gmail",
        auth: {
            user: emailUser,
            pass: emailPass,
        },
    });
    return transporter;
};
const sendPasswordResetEmail = async (email, resetUrl) => {
    try {
        const transporter = createTransporter();
        // Fallback: log the reset URL to console if email is not configured
        if (!transporter) {
            console.log("\n============================================");
            console.log("📧 PASSWORD RESET EMAIL (not sent - no config)");
            console.log(`   To: ${email}`);
            console.log(`   Reset URL: ${resetUrl}`);
            console.log("============================================\n");
            return;
        }
        const htmlContent = (0, emailTemplates_1.generatePasswordResetEmailHTML)(resetUrl);
        const mailOptions = {
            from: `"Luxe Store" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Reset Your Luxe Store Password",
            html: htmlContent,
        };
        await transporter.sendMail(mailOptions);
        console.log(`✅ Password reset email sent to ${email}`);
    }
    catch (error) {
        console.error("❌ Error sending password reset email:", error);
        // Don't throw - we still return generic response to user
    }
};
exports.sendPasswordResetEmail = sendPasswordResetEmail;
const sendVerificationEmail = async (email, verificationUrl) => {
    try {
        const transporter = createTransporter();
        if (!transporter) {
            console.log("\n============================================");
            console.log("📧 VERIFICATION EMAIL (not sent - no config)");
            console.log(`   To: ${email}`);
            console.log(`   Verification URL: ${verificationUrl}`);
            console.log("============================================\n");
            return;
        }
        const htmlContent = (0, emailTemplates_1.generateVerificationEmailHTML)(verificationUrl);
        const mailOptions = {
            from: `"Luxe Store" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Verify Your Luxe Store Email Address",
            html: htmlContent,
        };
        await transporter.sendMail(mailOptions);
        console.log(`✅ Verification email sent to ${email}`);
    }
    catch (error) {
        console.error("❌ Error sending verification email:", error);
        throw error;
    }
};
exports.sendVerificationEmail = sendVerificationEmail;
