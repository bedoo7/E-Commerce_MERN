import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
	Container,
	Box,
	Typography,
	TextField,
	Button,
	Card,
	CardContent,
	Link as MuiLink,
	CircularProgress,
	Stack,
	Divider,
	Fade,
	InputAdornment,
	IconButton,
	Checkbox,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/axios";
import toast from "react-hot-toast";
import StorefrontIcon from "@mui/icons-material/Storefront";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { luxeAuthCard } from "../theme/luxeStyles";

const registerSchema = z
	.object({
		firstName: z.string().min(2, "First name must be at least 2 characters"),
		lastName: z.string().min(2, "Last name must be at least 2 characters"),
		email: z.string().email("Invalid email address"),
		password: z
			.string()
			.min(8, "Password must be at least 8 characters")
			.regex(
				/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/,
				"Password must contain uppercase, lowercase, number, and special character",
			),
		confirmPassword: z
			.string()
			.min(8, "Password must be at least 8 characters"),
		terms: z.boolean().refine((val) => val === true, {
			message: "You must agree to the Terms of Service and Privacy Policy",
		}),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

type RegisterFormInputs = z.infer<typeof registerSchema>;

export const Register: React.FC = () => {
	const navigate = useNavigate();
	const [isSubmitting, setIsSubmitting] = React.useState(false);
	const [showPassword, setShowPassword] = React.useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
	const [passwordStrength, setPasswordStrength] = React.useState<
		"weak" | "medium" | "strong" | ""
	>("");

	const {
		register,
		handleSubmit,
		watch,
		formState: { errors },
	} = useForm<RegisterFormInputs>({
		resolver: zodResolver(registerSchema),
	});

	const watchedPassword = watch("password", "");

	React.useEffect(() => {
		const pwd = watchedPassword;
		let score = 0;
		if (pwd.length >= 8) score++;
		if (/[a-z]/.test(pwd)) score++;
		if (/[A-Z]/.test(pwd)) score++;
		if (/\d/.test(pwd)) score++;
		if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) score++;
		if (score <= 2) setPasswordStrength("weak");
		else if (score === 3) setPasswordStrength("medium");
		else if (score >= 4) setPasswordStrength("strong");
		else setPasswordStrength("");
	}, [watchedPassword]);

	const onSubmit = async (data: RegisterFormInputs) => {
		setIsSubmitting(true);
		try {
			await api.post("/user/register", {
				...data,
				role: "user",
			});
			toast.success(
				"Account created! Please check your email to verify your account.",
			);
			navigate("/login");
		} catch (err: any) {
			toast.error(err.message || "Registration failed");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Container maxWidth="sm">
			<Box
				sx={{
					mt: { xs: 4, md: 8 },
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
				}}
			>
				<Fade in timeout={500}>
					<Card sx={{ ...luxeAuthCard, p: 2 }}>
						<Box
							sx={{
								position: "absolute",
								top: -12,
								left: "50%",
								transform: "translateX(-50%)",
								width: 64,
								height: 64,
								borderRadius: 3,
								background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								color: "#fff",
								boxShadow: (t) =>
									t.palette.mode === "dark"
										? "0 0 0 1px rgba(129, 140, 248, 0.15), 0 12px 32px -8px rgba(79, 70, 229, 0.55), 0 0 60px -12px rgba(129, 140, 248, 0.25)"
										: "0 12px 32px -8px rgba(79, 70, 229, 0.55)",
								zIndex: 1,
							}}
						>
							<StorefrontIcon sx={{ fontSize: 32 }} />
						</Box>

						<CardContent sx={{ pt: 5, px: { xs: 3, sm: 4 }, pb: 3 }}>
							<Typography
								variant="h4"
								align="center"
								gutterBottom
								fontWeight={800}
							>
								Create Account
							</Typography>
							<Typography
								variant="body2"
								align="center"
								color="text.secondary"
								sx={{ mb: 4 }}
							>
								Join Luxe Store today
							</Typography>

							<form onSubmit={handleSubmit(onSubmit)}>
								<Stack spacing={2.5}>
									<Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
										<TextField
											fullWidth
											label="First Name"
											{...register("firstName")}
											error={!!errors.firstName}
											helperText={errors.firstName?.message}
										/>
										<TextField
											fullWidth
											label="Last Name"
											{...register("lastName")}
											error={!!errors.lastName}
											helperText={errors.lastName?.message}
										/>
									</Stack>

									<TextField
										fullWidth
										label="Email Address"
										type="email"
										{...register("email")}
										error={!!errors.email}
										helperText={errors.email?.message}
									/>

									<TextField
										fullWidth
										label="Password"
										type={showPassword ? "text" : "password"}
										{...register("password")}
										error={!!errors.password}
										helperText={errors.password?.message}
										InputProps={{
											endAdornment: (
												<InputAdornment position="end">
													<IconButton
														edge="end"
														onClick={() => setShowPassword(!showPassword)}
														tabIndex={-1}
													>
														{showPassword ? <VisibilityOff /> : <Visibility />}
													</IconButton>
												</InputAdornment>
											),
										}}
									/>

									{watchedPassword && (
										<Box sx={{ mt: -1, mb: 1 }}>
											<Stack direction="row" alignItems="center" spacing={1}>
												<Box
													sx={{
														flex: 1,
														height: 4,
														borderRadius: 2,
														backgroundColor:
															passwordStrength === "weak"
																? "#ef4444"
																: passwordStrength === "medium"
																	? "#f59e0b"
																	: passwordStrength === "strong"
																		? "#22c55e"
																		: "#e2e8f0",
													}}
												/>
												<Typography variant="caption" color="text.secondary">
													{passwordStrength
														? passwordStrength.charAt(0).toUpperCase() +
															passwordStrength.slice(1)
														: ""}
												</Typography>
											</Stack>
										</Box>
									)}

									<TextField
										fullWidth
										label="Confirm Password"
										type={showConfirmPassword ? "text" : "password"}
										{...register("confirmPassword")}
										error={!!errors.confirmPassword}
										helperText={errors.confirmPassword?.message}
										InputProps={{
											endAdornment: (
												<InputAdornment position="end">
													<IconButton
														edge="end"
														onClick={() =>
															setShowConfirmPassword(!showConfirmPassword)
														}
														tabIndex={-1}
													>
														{showConfirmPassword ? (
															<VisibilityOff />
														) : (
															<Visibility />
														)}
													</IconButton>
												</InputAdornment>
											),
										}}
									/>

									<Box
										sx={{
											display: "flex",
											alignItems: "flex-start",
											gap: 1.5,
											mt: 1,
											width: "100%",
										}}
									>
										<Checkbox
											{...register("terms")}
											color="primary"
											required
											sx={{ flexShrink: 0, mt: 0.3, p: 0 }}
										/>
										<Typography
											variant="body2"
											color="text.secondary"
											sx={{ lineHeight: 1.5 }}
										>
											I agree to the{" "}
											<MuiLink
												component={Link}
												to="/terms"
												fontWeight={600}
												color="primary"
											>
												Terms of Service
											</MuiLink>{" "}
											and{" "}
											<MuiLink
												component={Link}
												to="/privacy"
												fontWeight={600}
												color="primary"
											>
												Privacy Policy
											</MuiLink>
											<Typography
												component="span"
												color="error.main"
												fontWeight={700}
												sx={{ ml: 0.25 }}
											>
												*
											</Typography>
										</Typography>
									</Box>

									{errors.terms && (
										<Typography variant="caption" color="error">
											{errors.terms.message}
										</Typography>
									)}

									<Button
										type="submit"
										fullWidth
										variant="contained"
										size="large"
										disabled={isSubmitting}
										sx={{
											py: 1.5,
											borderRadius: 2.5,
											fontSize: "1rem",
											fontWeight: 700,
											background:
												"linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
										}}
									>
										{isSubmitting ? (
											<CircularProgress size={24} color="inherit" />
										) : (
											"Create Account"
										)}
									</Button>
								</Stack>
							</form>

							<Divider sx={{ my: 3 }}>
								<Typography variant="caption" color="text.secondary">
									OR
								</Typography>
							</Divider>

							<Box textAlign="center">
								<Typography variant="body2" color="text.secondary">
									Already have an account?{" "}
									<MuiLink
										component={Link}
										to="/login"
										fontWeight={700}
										color="primary"
									>
										Sign in
									</MuiLink>
								</Typography>
							</Box>
						</CardContent>
					</Card>
				</Fade>
			</Box>
		</Container>
	);
};
