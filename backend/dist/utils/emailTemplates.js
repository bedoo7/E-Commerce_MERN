"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateVerificationEmailHTML = exports.generatePasswordResetEmailHTML = void 0;
/**
 * Generate the logo HTML block.
 * Clean text-only "LUXE STORE" wordmark for maximum email client compatibility.
 */
const defaultLogoHtml = () => {
    return `
		<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:16px;">
			<tr>
				<td align="center" style="text-align:center;">
					<div style="
						color:#ffffff;
						font-size:26px;
						font-weight:800;
						letter-spacing:0.5px;
						font-family:Arial,Helvetica,sans-serif;
						margin-top:4px;
					">LUXE STORE</div>
				</td>
			</tr>
		</table>
	`;
};
const generatePasswordResetEmailHTML = (resetUrl) => {
    const logo = defaultLogoHtml();
    return `
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<style>
		* { margin: 0; padding: 0; box-sizing: border-box; }
		body {
			font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
			background-color: #f8fafc;
			color: #1e293b;
			line-height: 1.6;
		}
		.container {
			max-width: 560px;
			margin: 40px auto;
			background: #ffffff;
			border-radius: 20px;
			overflow: hidden;
			box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
		}
		.header {
			background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
			padding: 40px 32px;
			text-align: center;
		}
		.header p {
			color: rgba(255, 255, 255, 0.85);
			font-size: 16px;
			margin-top: 8px;
		}
		.content {
			padding: 32px;
		}
		.content h2 {
			font-size: 20px;
			font-weight: 700;
			margin-bottom: 12px;
			color: #0f172a;
		}
		.content p {
			color: #475569;
			font-size: 15px;
			margin-bottom: 24px;
		}
		.btn-container {
			text-align: center;
			margin: 32px 0;
		}
		.btn {
			display: inline-block;
			padding: 14px 40px;
			background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
			color: #ffffff !important;
			text-decoration: none;
			border-radius: 12px;
			font-size: 16px;
			font-weight: 700;
			transition: all 0.2s;
			box-shadow: 0 4px 14px rgba(79, 70, 229, 0.35);
		}
		.btn:hover {
			transform: translateY(-1px);
			box-shadow: 0 6px 20px rgba(79, 70, 229, 0.45);
		}
		.expiry {
			text-align: center;
			color: #64748b;
			font-size: 14px;
			margin: 20px 0 32px;
			padding: 12px;
			background: #f1f5f9;
			border-radius: 10px;
		}
		.divider {
			height: 1px;
			background: #e2e8f0;
			margin: 24px 0;
		}
		.footer {
			padding: 0 32px 32px;
			text-align: center;
		}
		.footer p {
			color: #64748b;
			font-size: 13px;
			margin-bottom: 8px;
		}
		.footer a {
			color: #4f46e5;
			text-decoration: none;
		}
		.ignore-msg {
			background: #fef2f2;
			color: #dc2626;
			padding: 12px 16px;
			border-radius: 10px;
			font-size: 13px;
			margin-top: 24px;
			text-align: center;
		}
		@media (max-width: 600px) {
			.container { margin: 16px; }
			.header { padding: 32px 20px; }
			.content { padding: 24px; }
			.footer { padding: 0 24px 24px; }
		}
	</style>
</head>
<body>
	<div class="container">
		<div class="header">
			${logo}
			<p>Premium Electronics & Gadgets</p>
		</div>

		<div class="content">
			<h2>Reset Your Password</h2>
			<p>
				We received a request to reset the password for your Luxe Store account.
				Click the button below to create a new password.
			</p>

			<div class="btn-container">
				<a href="${resetUrl}" class="btn" target="_blank">
					Reset Password
				</a>
			</div>

			<div class="expiry">
				⏰ This link expires in <strong>15 minutes</strong>
			</div>

			<p style="font-size: 14px; color: #475569;">
				If you didn't request a password reset, you can safely ignore this email.
				Your account is secure and no changes have been made.
			</p>

			<div class="ignore-msg">
				Didn't request this? No action needed — your password won't change.
			</div>

		<div class="divider"></div>

		<div class="footer">
			<p>
				<strong>Luxe Store</strong> — Premium Electronics & Gadgets
			</p>
			<p>
				Need help? Contact us at
				<a href="mailto:support@luxestore.com">support@luxestore.com</a>
			</p>
			<p style="margin-top: 16px; font-size: 11px; color: #64748b;">
				© ${new Date().getFullYear()} Luxe Store. All rights reserved.
			</p>
		</div>
</body>
</html>`;
};
exports.generatePasswordResetEmailHTML = generatePasswordResetEmailHTML;
const generateVerificationEmailHTML = (verificationUrl) => {
    const logo = defaultLogoHtml();
    return `
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<style>
		* { margin: 0; padding: 0; box-sizing: border-box; }
		body {
			font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
			background-color: #f8fafc;
			color: #1e293b;
			line-height: 1.6;
		}
		.container {
			max-width: 560px;
			margin: 40px auto;
			background: #ffffff;
			border-radius: 20px;
			overflow: hidden;
			box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
		}
		.header {
			background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
			padding: 40px 32px;
			text-align: center;
		}
		.header p {
			color: rgba(255, 255, 255, 0.85);
			font-size: 16px;
			margin-top: 8px;
		}
		.content {
			padding: 32px;
		}
		.content h2 {
			font-size: 20px;
			font-weight: 700;
			margin-bottom: 12px;
			color: #0f172a;
		}
		.content p {
			color: #475569;
			font-size: 15px;
			margin-bottom: 24px;
		}
		.btn-container {
			text-align: center;
			margin: 32px 0;
		}
		.btn {
			display: inline-block;
			padding: 14px 40px;
			background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
			color: #ffffff !important;
			text-decoration: none;
			border-radius: 12px;
			font-size: 16px;
			font-weight: 700;
			transition: all 0.2s;
			box-shadow: 0 4px 14px rgba(79, 70, 229, 0.35);
		}
		.btn:hover {
			transform: translateY(-1px);
			box-shadow: 0 6px 20px rgba(79, 70, 229, 0.45);
		}
		.expiry {
			text-align: center;
			color: #64748b;
			font-size: 14px;
			margin: 20px 0 32px;
			padding: 12px;
			background: #f1f5f9;
			border-radius: 10px;
		}
		.divider {
			height: 1px;
			background: #e2e8f0;
			margin: 24px 0;
		}
		.footer {
			padding: 0 32px 32px;
			text-align: center;
		}
		.footer p {
			color: #64748b;
			font-size: 13px;
			margin-bottom: 8px;
		}
		.footer a {
			color: #4f46e5;
			text-decoration: none;
		}
		.verify-msg {
			background: #f0fdf4;
			color: #16a34a;
			padding: 12px 16px;
			border-radius: 10px;
			font-size: 13px;
			margin-top: 24px;
			text-align: center;
		}
		@media (max-width: 600px) {
			.container { margin: 16px; }
			.header { padding: 32px 20px; }
			.content { padding: 24px; }
			.footer { padding: 0 24px 24px; }
		}
	</style>
</head>
<body>
	<div class="container">
		<div class="header">
			${logo}
			<p>Welcome to Luxe Store!</p>
		</div>

		<div class="content">
			<h2>Verify Your Email Address</h2>
			<p>
				Thank you for creating a Luxe Store account. Please verify your email
				address by clicking the button below. This helps us keep your account
				secure.
			</p>

			<div class="btn-container">
				<a href="${verificationUrl}" class="btn" target="_blank">
					Verify Email Address
				</a>
			</div>

			<div class="expiry">
				⏰ This link expires in <strong>24 hours</strong>
			</div>

			<p style="font-size: 14px; color: #475569;">
				If you didn't create an account with Luxe Store, you can safely ignore
				this email.
			</p>

			<div class="verify-msg">
				Already verified? You can safely ignore this email.
			</div>

		<div class="divider"></div>

		<div class="footer">
			<p>
				<strong>Luxe Store</strong> — Premium Electronics & Gadgets
			</p>
			<p>
				Need help? Contact us at
				<a href="mailto:support@luxestore.com">support@luxestore.com</a>
			</p>
			<p style="margin-top: 16px; font-size: 11px; color: #64748b;">
				© ${new Date().getFullYear()} Luxe Store. All rights reserved.
			</p>
		</div>
</body>
</html>`;
};
exports.generateVerificationEmailHTML = generateVerificationEmailHTML;
