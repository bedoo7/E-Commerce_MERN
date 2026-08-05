import { Resend } from "resend";
import {
	generatePasswordResetEmailHTML,
	generateVerificationEmailHTML,
} from "./emailTemplates";

// TODO: Add RESEND_API_KEY to Railway Environment Variables
// Get your API key from https://resend.com after creating a free account
const resend = new Resend(process.env.RESEND_API_KEY);

export const sendPasswordResetEmail = async (
	email: string,
	resetUrl: string,
) => {
	try {
		const htmlContent = generatePasswordResetEmailHTML(resetUrl);

		await resend.emails.send({
			from: "onboarding@resend.dev",
			to: email,
			subject: "Reset Your Luxe Store Password",
			html: htmlContent,
		});

		console.log(`✅ Password reset email sent to ${email}`);
	} catch (error) {
		console.error("❌ Error sending password reset email:", error);
	}
};

export const sendVerificationEmail = async (
	email: string,
	verificationUrl: string,
) => {
	try {
		const htmlContent = generateVerificationEmailHTML(verificationUrl);

		await resend.emails.send({
			from: "onboarding@resend.dev",
			to: email,
			subject: "Verify Your Luxe Store Email Address",
			html: htmlContent,
		});

		console.log(`✅ Verification email sent to ${email}`);
	} catch (error) {
		console.error("❌ Error sending verification email:", error);
	}
};
