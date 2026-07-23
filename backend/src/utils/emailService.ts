import nodemailer from "nodemailer";
import { generatePasswordResetEmailHTML } from "./emailTemplates";

const createTransporter = () => {
	const emailUser = process.env.EMAIL_USER;
	const emailPass = process.env.EMAIL_PASS;

	if (!emailUser || !emailPass) {
		console.warn(
			"⚠️ EMAIL_USER or EMAIL_PASS not set in .env. Password reset emails will be logged to console instead.",
		);
		return null;
	}

	const transporter = nodemailer.createTransport({
		service: "gmail",
		auth: {
			user: emailUser,
			pass: emailPass,
		},
	});
	return transporter;
};

export const sendPasswordResetEmail = async (
	email: string,
	resetUrl: string,
) => {
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

		const htmlContent = generatePasswordResetEmailHTML(resetUrl);

		const mailOptions = {
			from: `"Luxe Store" <${process.env.EMAIL_USER}>`,
			to: email,
			subject: "Reset Your Luxe Store Password",
			html: htmlContent,
		};

		await transporter.sendMail(mailOptions);
		console.log(`✅ Password reset email sent to ${email}`);
	} catch (error) {
		console.error("❌ Error sending password reset email:", error);
		// Don't throw - we still return generic response to user
	}
};
