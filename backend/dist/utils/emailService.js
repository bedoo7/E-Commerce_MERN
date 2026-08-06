"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendVerificationEmail = exports.sendPasswordResetEmail = void 0;
const mail_1 = __importDefault(require("@sendgrid/mail"));
const emailTemplates_1 = require("./emailTemplates");
// TODO: Add SENDGRID_API_KEY to Railway Environment Variables
// Get your API key from https://app.sendgrid.com/settings/api-keys
mail_1.default.setApiKey(process.env.SENDGRID_API_KEY);
const sendPasswordResetEmail = async (email, resetUrl) => {
    try {
        const htmlContent = (0, emailTemplates_1.generatePasswordResetEmailHTML)(resetUrl);
        await mail_1.default.send({
            to: email,
            from: "abdelrahmanhassan3190@gmail.com",
            subject: "Reset Your Luxe Store Password",
            html: htmlContent,
        });
        console.log(`✅ Password reset email sent to ${email}`);
    }
    catch (error) {
        console.error("❌ Error sending password reset email:", error);
    }
};
exports.sendPasswordResetEmail = sendPasswordResetEmail;
const sendVerificationEmail = async (email, verificationUrl) => {
    try {
        const htmlContent = (0, emailTemplates_1.generateVerificationEmailHTML)(verificationUrl);
        await mail_1.default.send({
            to: email,
            from: "abdelrahmanhassan3190@gmail.com",
            subject: "Verify Your Luxe Store Email Address",
            html: htmlContent,
        });
        console.log(`✅ Verification email sent to ${email}`);
    }
    catch (error) {
        console.error("❌ Error sending verification email:", error);
    }
};
exports.sendVerificationEmail = sendVerificationEmail;
