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
import { api } from "../api/axios";
import toast from "react-hot-toast";
import StorefrontIcon from "@mui/icons-material/Storefront";

const registerSchema = z.object({
	firstName: z.string().min(2, "First name must be at least 2 characters"),
	lastName: z.string().min(2, "Last name must be at least 2 characters"),
	email: z.string().email("Invalid email address"),
	password: z.string().min(6, "Password must be at least 6 characters"),
});

type RegisterFormInputs = z.infer<typeof registerSchema>;

export const Register: React.FC = () => {
	const navigate = useNavigate();
	const [isSubmitting, setIsSubmitting] = React.useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<RegisterFormInputs>({
		resolver: zodResolver(registerSchema),
	});

	const onSubmit = async (data: RegisterFormInputs) => {
		setIsSubmitting(true);
		try {
			await api.post("/user/register", { ...data, role: "user" });
			toast.success("Account created successfully! Please sign in.");
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
					Create Account
				</Typography>
				<Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
					Join Luxe Store today
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
			</Box>
		</Container>
	);
};
