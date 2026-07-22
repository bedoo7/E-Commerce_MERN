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
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/axios";
import { LoginResponse } from "../types";
import toast from "react-hot-toast";
import StorefrontIcon from "@mui/icons-material/Storefront";

const loginSchema = z.object({
	email: z.string().email("Invalid email address"),
	password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
	const { login } = useAuth();
	const navigate = useNavigate();
	const [isSubmitting, setIsSubmitting] = React.useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<LoginFormInputs>({
		resolver: zodResolver(loginSchema),
	});

	const onSubmit = async (data: LoginFormInputs) => {
		setIsSubmitting(true);
		try {
			const response = await api.post<LoginResponse>("/user/login", data);
			login(response.data);
			navigate("/");
		} catch (err: any) {
			toast.error(err.message || "Login failed");
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
				<Box
					sx={{
						width: 56,
						height: 56,
						borderRadius: "16px",
						background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						color: "#fff",
						mb: 2,
						boxShadow: "0 8px 24px rgba(79, 70, 229, 0.3)",
					}}
				>
					<StorefrontIcon />
				</Box>
				<Typography variant="h4" fontWeight={800} gutterBottom>
					Welcome Back
				</Typography>
				<Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
					Sign in to your Luxe Store account
				</Typography>

				<Card
					sx={{
						width: "100%",
						borderRadius: 4,
						border: "1px solid",
						borderColor: "divider",
					}}
				>
					<CardContent sx={{ p: { xs: 3, sm: 4 } }}>
						<form onSubmit={handleSubmit(onSubmit)}>
							<Stack spacing={2.5}>
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
									type="password"
									{...register("password")}
									error={!!errors.password}
									helperText={errors.password?.message}
								/>

								<Button
									type="submit"
									fullWidth
									variant="contained"
									size="large"
									disabled={isSubmitting}
									sx={{ py: 1.5, borderRadius: 3, fontSize: "1rem" }}
								>
									{isSubmitting ? (
										<CircularProgress size={24} color="inherit" />
									) : (
										"Sign In"
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
								Don't have an account?{" "}
								<MuiLink
									component={Link}
									to="/register"
									fontWeight={700}
									color="primary"
								>
									Create one
								</MuiLink>
							</Typography>
						</Box>
					</CardContent>
				</Card>
			</Box>
		</Container>
	);
};
