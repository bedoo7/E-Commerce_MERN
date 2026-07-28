import nodemailer from "nodemailer";
import {
	generatePasswordResetEmailHTML,
	generateVerificationEmailHTML,
} from "./emailTemplates";
import fs from "fs";
import path from "path";

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

/**
 * Load the logo as a base64 data URI.
 * This is the most reliable method — avoids all path/CID/hosting issues.
 */
const getLogoBase64 = (): string => {
	try {
		// Try multiple possible paths to handle different run/deploy contexts
		const possiblePaths = [
			path.join(__dirname, "../../../frontend/public/logo-email.png"),
			path.join(__dirname, "../public/logo-email.png"),
			path.join(process.cwd(), "frontend", "public", "logo-email.png"),
		];
		for (const p of possiblePaths) {
			if (fs.existsSync(p)) {
				const buffer = fs.readFileSync(p);
				return `data:image/png;base64,${buffer.toString("base64")}`;
			}
		}
		console.warn("⚠️ Logo file not found at any expected path");
		return "";
	} catch (err) {
		console.warn("⚠️ Could not load logo file:", err);
		return "";
	}
};

/**
 * Base64-embedded logo HTML (reliable, no external dependency).
 * Inlined as a data URI so it always renders.
 */
const LOGO_BASE64: string = (() => {
	const b64 = getLogoBase64();
	if (b64) {
		return b64;
	}
	return "";
})();

const buildLogoHtml = (): string => {
	if (!LOGO_BASE64) {
		// Fallback: styled placeholder
		return `<div style="width:44px;height:44px;border-radius:12px;background:rgba(255,255,255,0.2);display:inline-flex;align-items:center;justify-content:center;">
			<svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5z" fill="white" opacity="0.9"/><path d="M2 17l10 5 10-5" stroke="white" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M2 12l10 5 10-5" stroke="white" stroke-width="2" fill="none" stroke-linecap="round"/></svg>
		</div>`;
	}
	return `<img src="${LOGO_BASE64}" alt="Luxe Store" width="28" height="28" style="display:block;" />`;
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

		const htmlContent = generatePasswordResetEmailHTML(resetUrl, buildLogoHtml);

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

		const htmlContent = generateVerificationEmailHTML(
			verificationUrl,
			buildLogoHtml,
		);

		const mailOptions = {
			from: `"Luxe Store" <${process.env.EMAIL_USER}>`,
			to: email,
			subject: "Verify Your Luxe Store Email Address",
			html: htmlContent,
		};

		await transporter.sendMail(mailOptions);
		console.log(`✅ Verification email sent to ${email}`);
	} catch (error) {
		console.error("❌ Error sending verification email:", error);
		throw error;
	}
};
