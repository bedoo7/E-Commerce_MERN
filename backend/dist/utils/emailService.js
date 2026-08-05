"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendVerificationEmail = exports.sendPasswordResetEmail = void 0;
const resend_1 = require("resend");
const emailTemplates_1 = require("./emailTemplates");
// TODO: Add RESEND_API_KEY to Railway Environment Variables
// Get your API key from https://resend.com after creating a free account
const resend = new resend_1.Resend(process.env.RESEND_API_KEY);
const sendPasswordResetEmail = async (email, resetUrl) => {
    try {
        const htmlContent = (0, emailTemplates_1.generatePasswordResetEmailHTML)(resetUrl);
        await resend.emails.send({
            from: "onboarding@resend.dev",
            to: email,
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
        await resend.emails.send({
            from: "onboarding@resend.dev",
            to: email,
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
