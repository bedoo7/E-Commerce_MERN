import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
	Box,
	Typography,
	Card,
	CardContent,
	Grid,
	TextField,
	Button,
	Divider,
	Avatar,
	Stack,
	Paper,
	InputAdornment,
	Chip,
} from "@mui/material";
import { PersonOutline, Phone, LocationOn } from "@mui/icons-material";
import { api } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { luxeSurface, luxeFadeIn } from "../theme/luxeStyles";

export const Profile: React.FC = () => {
	const { user, isAuthenticated } = useAuth();
	const queryClient = useQueryClient();
	const [firstName, setFirstName] = useState(user?.firstName || "");
	const [lastName, setLastName] = useState(user?.lastName || "");
	const [phone, setPhone] = useState(user?.phone || "");
	const [address, setAddress] = useState(user?.address || "");

	const { data: profile, isLoading } = useQuery({
		queryKey: ["profile"],
		queryFn: async () => {
			const res = await api.get("/user/profile");
			return res.data;
		},
		enabled: isAuthenticated,
	});

	const updateMutation = useMutation({
		mutationFn: async (data: {
			firstName?: string;
			lastName?: string;
			phone?: string;
			address?: string;
		}) => {
			const res = await api.put("/user/profile", data);
			return res.data;
		},
		onSuccess: (data) => {
			queryClient.setQueryData(["profile"], data);
			queryClient.invalidateQueries({ queryKey: ["profile"] });
			toast.success("Profile updated successfully!");
		},
		onError: (err: any) => {
			toast.error(err.message || "Failed to update profile");
		},
	});

	React.useEffect(() => {
		if (profile) {
			setFirstName(profile.firstName || "");
			setLastName(profile.lastName || "");
			setPhone(profile.phone || "");
			setAddress(profile.address || "");
		}
	}, [profile]);

	const handleSubmit = () => {
		updateMutation.mutate({
			firstName,
			lastName,
			phone,
			address,
		});
	};

	if (!isAuthenticated) {
		return (
			<Box sx={{ textAlign: "center", py: 8 }}>
				<Typography variant="h5" color="text.secondary">
					Please log in to view your profile
				</Typography>
			</Box>
		);
	}

	if (isLoading) {
		return (
			<Box
				sx={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					minHeight: "60vh",
				}}
			>
				<Box sx={{ textAlign: "center" }}>
					<Typography variant="body2" color="text.secondary">
						Loading profile...
					</Typography>
				</Box>
			</Box>
		);
	}

	return (
		<Box sx={luxeFadeIn}>
			<Box sx={{ mb: 4 }}>
				<Typography variant="h4" fontWeight={800} gutterBottom>
					My Profile
				</Typography>
				<Typography variant="body2" color="text.secondary">
					Manage your personal information and preferences
				</Typography>
			</Box>

			<Grid container spacing={3}>
				{/* Profile Header Card */}
				<Grid item xs={12} md={4}>
					<Card
						sx={{
							borderRadius: 4,
							border: "1px solid",
							borderColor: "divider",
							textAlign: "center",
						}}
					>
						<CardContent sx={{ p: 4 }}>
							<Avatar
								sx={{
									width: 80,
									height: 80,
									bgcolor: "primary.main",
									fontSize: "2rem",
									fontWeight: 700,
									mx: "auto",
									mb: 2,
								}}
							>
								{user?.firstName
									? user.firstName[0].toUpperCase()
									: "U"}
							</Avatar>
							<Typography variant="h5" fontWeight={700} gutterBottom>
								{profile?.firstName} {profile?.lastName}
							</Typography>
							<Typography variant="body2" color="text.secondary" gutterBottom>
								{profile?.email}
							</Typography>
							<Chip
								label={profile?.role === "admin" ? "Administrator" : "Customer"}
								size="small"
								color={profile?.role === "admin" ? "secondary" : "primary"}
								sx={{ mt: 1 }}
							/>
						</CardContent>
					</Card>
				</Grid>

				{/* Profile Details Form */}
				<Grid item xs={12} md={8}>
					<Card
						sx={{
							borderRadius: 4,
							border: "1px solid",
							borderColor: "divider",
						}}
					>
						<CardContent sx={{ p: { xs: 3, md: 4 } }}>
							<Typography variant="h6" fontWeight={700} gutterBottom>
								Personal Information
							</Typography>
							<Divider sx={{ mb: 3 }} />
							<Grid container spacing={2.5}>
								<Grid item xs={12} sm={6}>
									<TextField
										fullWidth
										label="First Name"
										value={firstName}
										onChange={(e) => setFirstName(e.target.value)}
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">
													<PersonOutline sx={{ color: "text.secondary" }} />
												</InputAdornment>
											),
										}}
									/>
								</Grid>
								<Grid item xs={12} sm={6}>
									<TextField
										fullWidth
										label="Last Name"
										value={lastName}
										onChange={(e) => setLastName(e.target.value)}
									/>
								</Grid>
								<Grid item xs={12}>
									<TextField
										fullWidth
										label="Email"
										value={profile?.email || ""}
										disabled
										helperText="Email cannot be changed"
									/>
								</Grid>
								<Grid item xs={12} sm={6}>
									<TextField
										fullWidth
										label="Phone Number"
										value={phone}
										onChange={(e) => setPhone(e.target.value)}
										placeholder="+1 234 567 8900"
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">
													<Phone sx={{ color: "text.secondary" }} />
												</InputAdornment>
											),
										}}
									/>
								</Grid>
								<Grid item xs={12}>
									<TextField
										fullWidth
										label="Default Address"
										value={address}
										onChange={(e) => setAddress(e.target.value)}
										multiline
										rows={3}
										placeholder="Enter your default shipping address"
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">
													<LocationOn sx={{ color: "text.secondary" }} />
												</InputAdornment>
											),
										}}
									/>
								</Grid>
							</Grid>
							<Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
								<Button
									variant="contained"
									size="large"
									onClick={handleSubmit}
									disabled={updateMutation.isPending}
									sx={{
										px: 4,
										py: 1.5,
										borderRadius: 3,
										background:
											"linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
									}}
								>
									{updateMutation.isPending ? "Saving..." : "Save Changes"}
								</Button>
							</Box>
						</CardContent>
					</Card>
				</Grid>
			</Grid>
		</Box>
	);
};
