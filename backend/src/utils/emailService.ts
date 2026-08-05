import nodemailer from "nodemailer";
import {
	generatePasswordResetEmailHTML,
	generateVerificationEmailHTML,
} from "./emailTemplates";

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
		host: "smtp.gmail.com",
		port: Number(process.env.EMAIL_PORT) || 587,
		secure: false,
		auth: {
			user: emailUser,
			pass: emailPass,
		},
		connectionTimeout: 10000,
		socketTimeout: 10000,
		tls: {
			rejectUnauthorized: false,
		},
	});

	transporter.on("token", () => {
		console.log("XOAUTH2 authentication token generated");
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

		transporter.sendMail(mailOptions).then(() => {
			console.log(`✅ Password reset email sent to ${email}`);
		}).catch((error) => {
			console.error("❌ Error sending password reset email:", error);
		});
	} catch (error) {
		console.error("❌ Error sending password reset email:", error);
	}
};

export const sendVerificationEmail = async (
	email: string,
	verificationUrl: string,
) => {
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

		const htmlContent = generateVerificationEmailHTML(verificationUrl);

		const mailOptions = {
			from: `"Luxe Store" <${process.env.EMAIL_USER}>`,
			to: email,
			subject: "Verify Your Luxe Store Email Address",
			html: htmlContent,
		};

		transporter.sendMail(mailOptions).then(() => {
			console.log(`✅ Verification email sent to ${email}`);
		}).catch((error) => {
			console.error("❌ Error sending verification email:", error);
		});
	} catch (error) {
		console.error("❌ Error sending verification email:", error);
	}
};
