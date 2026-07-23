import React, { useState } from "react";
import {
	Container,
	Box,
	Typography,
	TextField,
	Button,
	Card,
	CardContent,
	CircularProgress,
	Link as MuiLink,
	Fade,
} from "@mui/material";
import LockResetIcon from "@mui/icons-material/LockReset";
import EmailIcon from "@mui/icons-material/Email";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import { Link } from "react-router-dom";
import { api } from "../api/axios";
import toast from "react-hot-toast";

export const ForgotPassword: React.FC = () => {
	const [email, setEmail] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isSent, setIsSent] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!email.trim()) {
			toast.error("Please enter your email address");
			return;
		}

		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			toast.error("Please enter a valid email address");
			return;
		}

		setIsSubmitting(true);
		try {
			await api.post("/auth/forgot-password", { email });
			setIsSent(true);
			toast.success("Password reset link sent if the email exists");
		} catch (error: any) {
			toast.error(error.message || "Something went wrong. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Container maxWidth="sm">
			<Box
				sx={{
					mt: 8,
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
				}}
			>
				<Fade in timeout={500}>
					<Card
						sx={{
							width: "100%",
							p: 2,
							borderRadius: 4,
							overflow: "visible",
							position: "relative",
						}}
					>
						{/* Decorative gradient top */}
						<Box
							sx={{
								position: "absolute",
								top: -12,
								left: "50%",
								transform: "translateX(-50%)",
								width: 64,
								height: 64,
								borderRadius: 3,
								background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								boxShadow: "0 8px 24px rgba(79, 70, 229, 0.3)",
								zIndex: 1,
							}}
						>
							{isSent ? (
								<MarkEmailReadIcon sx={{ color: "#fff", fontSize: 32 }} />
							) : (
								<LockResetIcon sx={{ color: "#fff", fontSize: 32 }} />
							)}
						</Box>

						<CardContent sx={{ pt: 5, px: 3, pb: 3 }}>
							{!isSent ? (
								<>
									<Typography
										variant="h4"
										align="center"
										gutterBottom
										fontWeight={800}
									>
										Forgot Password?
									</Typography>
									<Typography
										variant="body2"
										align="center"
										color="text.secondary"
										sx={{ mb: 4, maxWidth: 360, mx: "auto" }}
									>
										No worries! Enter your email address and we'll send you a
										reset link.
									</Typography>

									<form onSubmit={handleSubmit}>
										<TextField
											fullWidth
											label="Email Address"
											type="email"
											placeholder="you@example.com"
											value={email}
											onChange={(e) => setEmail(e.target.value)}
											InputProps={{
												startAdornment: (
													<EmailIcon sx={{ mr: 1, color: "text.secondary" }} />
												),
											}}
											sx={{ mb: 3 }}
										/>

										<Button
											type="submit"
											fullWidth
											variant="contained"
											size="large"
											disabled={isSubmitting}
											sx={{
												py: 1.5,
												borderRadius: 2.5,
												fontWeight: 700,
												fontSize: "1rem",
												background:
													"linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
											}}
										>
											{isSubmitting ? (
												<CircularProgress size={24} sx={{ color: "#fff" }} />
											) : (
												"Send Reset Link"
											)}
										</Button>
									</form>
								</>
							) : (
								<Box textAlign="center" py={2}>
									<MarkEmailReadIcon
										sx={{
											fontSize: 72,
											color: "success.main",
											mb: 2,
											opacity: 0.9,
										}}
									/>
									<Typography variant="h5" fontWeight={800} gutterBottom>
										Check Your Email
									</Typography>
									<Typography
										variant="body2"
										color="text.secondary"
										sx={{ mb: 3, maxWidth: 400, mx: "auto" }}
									>
										If an account with <strong>{email}</strong> exists, we've
										sent a password reset link. Please check your inbox and spam
										folder.
									</Typography>
									<Typography
										variant="caption"
										color="text.secondary"
										sx={{ display: "block", mb: 3 }}
									>
										The link expires in 15 minutes for security.
									</Typography>
									<Button
										variant="outlined"
										onClick={() => {
											setIsSent(false);
											setEmail("");
										}}
										sx={{ borderRadius: 2.5 }}
									>
										Send Again
									</Button>
								</Box>
							)}

							<Box display="flex" justifyContent="center" sx={{ mt: 3 }}>
								<MuiLink
									component={Link}
									to="/login"
									variant="body2"
									sx={{
										display: "flex",
										alignItems: "center",
										gap: 0.5,
										fontWeight: 600,
										textDecoration: "none",
										"&:hover": { textDecoration: "underline" },
									}}
								>
									<ArrowBackIcon fontSize="small" />
									Back to Sign In
								</MuiLink>
							</Box>
						</CardContent>
					</Card>
				</Fade>
			</Box>
		</Container>
	);
};
