import sgMail from "@sendgrid/mail";
import {
	generatePasswordResetEmailHTML,
	generateVerificationEmailHTML,
} from "./emailTemplates";

// TODO: Add SENDGRID_API_KEY to Railway Environment Variables
// Get your API key from https://app.sendgrid.com/settings/api-keys
sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

export const sendPasswordResetEmail = async (
	email: string,
	resetUrl: string,
) => {
	try {
		const htmlContent = generatePasswordResetEmailHTML(resetUrl);

		await sgMail.send({
			to: email,
			from: "abdelrahmanhassan3190@gmail.com",
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

		await sgMail.send({
			to: email,
			from: "abdelrahmanhassan3190@gmail.com",
			subject: "Verify Your Luxe Store Email Address",
			html: htmlContent,
		});

		console.log(`✅ Verification email sent to ${email}`);
	} catch (error) {
		console.error("❌ Error sending verification email:", error);
	}
};
