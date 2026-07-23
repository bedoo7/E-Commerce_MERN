import React, { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
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
	InputAdornment,
	IconButton,
} from "@mui/material";
import LockResetIcon from "@mui/icons-material/LockReset";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { api } from "../api/axios";
import toast from "react-hot-toast";

export const ResetPassword: React.FC = () => {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const token = searchParams.get("token");

	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirm, setShowConfirm] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);

	if (!token) {
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
					<Card sx={{ width: "100%", p: 2, borderRadius: 4 }}>
						<CardContent sx={{ textAlign: "center", py: 4 }}>
							<VpnKeyIcon sx={{ fontSize: 64, color: "error.main", mb: 2 }} />
							<Typography variant="h5" fontWeight={800} gutterBottom>
								Invalid Reset Link
							</Typography>
							<Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
								This password reset link is invalid or has expired. Please
								request a new one.
							</Typography>
							<Button
								variant="contained"
								component={Link}
								to="/forgot-password"
								sx={{ borderRadius: 2.5 }}
							>
								Request New Link
							</Button>
						</CardContent>
					</Card>
				</Box>
			</Container>
		);
	}

	const validatePassword = (pass: string): string | null => {
		if (pass.length < 6) {
			return "Password must be at least 6 characters";
		}
		return null;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const passwordError = validatePassword(password);
		if (passwordError) {
			toast.error(passwordError);
			return;
		}

		if (password !== confirmPassword) {
			toast.error("Passwords do not match");
			return;
		}

		setIsSubmitting(true);
		try {
			await api.post("/auth/reset-password", {
				token,
				password,
			});
			setIsSuccess(true);
			toast.success("Password has been reset successfully!");
		} catch (error: any) {
			toast.error(
				error.message || "Failed to reset password. The link may have expired.",
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	if (isSuccess) {
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
							<Box
								sx={{
									position: "absolute",
									top: -12,
									left: "50%",
									transform: "translateX(-50%)",
									width: 64,
									height: 64,
									borderRadius: 3,
									background:
										"linear-gradient(135deg, #10b981 0%, #059669 100%)",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									boxShadow: "0 8px 24px rgba(16, 185, 129, 0.3)",
									zIndex: 1,
								}}
							>
								<CheckCircleOutlineIcon sx={{ color: "#fff", fontSize: 36 }} />
							</Box>

							<CardContent sx={{ pt: 5, px: 3, pb: 3, textAlign: "center" }}>
								<Typography variant="h5" fontWeight={800} gutterBottom>
									Password Reset Successful!
								</Typography>
								<Typography
									variant="body2"
									color="text.secondary"
									sx={{ mb: 4 }}
								>
									Your password has been successfully updated. You can now log
									in with your new password.
								</Typography>
								<Button
									variant="contained"
									size="large"
									onClick={() => navigate("/login")}
									sx={{
										py: 1.5,
										px: 4,
										borderRadius: 2.5,
										fontWeight: 700,
										background:
											"linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
									}}
								>
									Sign In with New Password
								</Button>
							</CardContent>
						</Card>
					</Fade>
				</Box>
			</Container>
		);
	}

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
							<LockResetIcon sx={{ color: "#fff", fontSize: 32 }} />
						</Box>

						<CardContent sx={{ pt: 5, px: 3, pb: 3 }}>
							<Typography
								variant="h4"
								align="center"
								gutterBottom
								fontWeight={800}
							>
								Set New Password
							</Typography>
							<Typography
								variant="body2"
								align="center"
								color="text.secondary"
								sx={{ mb: 4 }}
							>
								Enter your new password below.
							</Typography>

							<form onSubmit={handleSubmit}>
								<TextField
									fullWidth
									label="New Password"
									type={showPassword ? "text" : "password"}
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									placeholder="••••••••"
									InputProps={{
										startAdornment: (
											<VpnKeyIcon
												sx={{ mr: 1, color: "text.secondary", fontSize: 20 }}
											/>
										),
										endAdornment: (
											<InputAdornment position="end">
												<IconButton
													onClick={() => setShowPassword(!showPassword)}
													edge="end"
													size="small"
												>
													{showPassword ? (
														<VisibilityOff fontSize="small" />
													) : (
														<Visibility fontSize="small" />
													)}
												</IconButton>
											</InputAdornment>
										),
									}}
									sx={{ mb: 2.5 }}
								/>

								<TextField
									fullWidth
									label="Confirm Password"
									type={showConfirm ? "text" : "password"}
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
									placeholder="••••••••"
									error={
										confirmPassword.length > 0 && password !== confirmPassword
									}
									helperText={
										confirmPassword.length > 0 && password !== confirmPassword
											? "Passwords do not match"
											: ""
									}
									InputProps={{
										startAdornment: (
											<VpnKeyIcon
												sx={{ mr: 1, color: "text.secondary", fontSize: 20 }}
											/>
										),
										endAdornment: (
											<InputAdornment position="end">
												<IconButton
													onClick={() => setShowConfirm(!showConfirm)}
													edge="end"
													size="small"
												>
													{showConfirm ? (
														<VisibilityOff fontSize="small" />
													) : (
														<Visibility fontSize="small" />
													)}
												</IconButton>
											</InputAdornment>
										),
									}}
									sx={{ mb: 1 }}
								/>

								<Typography
									variant="caption"
									color="text.secondary"
									sx={{ display: "block", mb: 3, mt: 1 }}
								>
									Password must be at least 6 characters long.
								</Typography>

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
										"Reset Password"
									)}
								</Button>
							</form>

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
