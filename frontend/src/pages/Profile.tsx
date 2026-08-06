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
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Alert,
} from "@mui/material";
import { PersonOutline, Phone, LocationOn, DeleteOutline, LockOutlined } from "@mui/icons-material";
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
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [deleteConfirmText, setDeleteConfirmText] = useState("");
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showPasswords, setShowPasswords] = useState(false);

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

	const deleteMutation = useMutation({
		mutationFn: async () => {
			await api.delete("/user/profile");
		},
		onSuccess: () => {
			queryClient.clear();
			toast.success("Account deleted successfully");
			window.location.href = "/";
		},
		onError: (err: any) => {
			toast.error(err.message || "Failed to delete account");
		},
	});

	const changePasswordMutation = useMutation({
		mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
			const res = await api.put("/user/change-password", data);
			return res.data;
		},
		onSuccess: () => {
			toast.success("Password changed successfully!");
			setCurrentPassword("");
			setNewPassword("");
			setConfirmPassword("");
		},
		onError: (err: any) => {
			toast.error(err.message || "Failed to change password");
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

	const handleChangePassword = () => {
		if (!currentPassword || !newPassword || !confirmPassword) {
			toast.error("Please fill in all password fields");
			return;
		}
		if (newPassword !== confirmPassword) {
			toast.error("New passwords do not match");
			return;
		}
		if (newPassword.length < 6) {
			toast.error("Password must be at least 6 characters");
			return;
		}
		changePasswordMutation.mutate({
			currentPassword,
			newPassword,
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

							<Divider sx={{ my: 4 }} />

							<Typography variant="h6" fontWeight={700} gutterBottom>
								Change Password
							</Typography>
							<Grid container spacing={2}>
								<Grid item xs={12}>
									<TextField
										fullWidth
										label="Current Password"
										type={showPasswords ? "text" : "password"}
										value={currentPassword}
										onChange={(e) => setCurrentPassword(e.target.value)}
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">
													<LockOutlined sx={{ color: "text.secondary" }} />
												</InputAdornment>
											),
										}}
									/>
								</Grid>
								<Grid item xs={12} sm={6}>
									<TextField
										fullWidth
										label="New Password"
										type={showPasswords ? "text" : "password"}
										value={newPassword}
										onChange={(e) => setNewPassword(e.target.value)}
									/>
								</Grid>
								<Grid item xs={12} sm={6}>
									<TextField
										fullWidth
										label="Confirm New Password"
										type={showPasswords ? "text" : "password"}
										value={confirmPassword}
										onChange={(e) => setConfirmPassword(e.target.value)}
									/>
								</Grid>
								<Grid item xs={12}>
									<Stack direction="row" spacing={2}>
										<Button
											variant="contained"
											onClick={handleChangePassword}
											disabled={changePasswordMutation.isPending}
											sx={{
												background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
											}}
										>
											{changePasswordMutation.isPending ? "Changing..." : "Change Password"}
										</Button>
										<Button
											variant="text"
											onClick={() => {
												setCurrentPassword("");
												setNewPassword("");
												setConfirmPassword("");
											}}
										>
											Clear
										</Button>
									</Stack>
								</Grid>
							</Grid>

							<Divider sx={{ my: 4 }} />

							<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
								<Box>
									<Typography variant="subtitle1" fontWeight={700} color="error.main">
										Delete Account
									</Typography>
									<Typography variant="body2" color="text.secondary">
										Once you delete your account, there is no going back. Please be certain.
									</Typography>
								</Box>
								<Button
									variant="outlined"
									color="error"
									startIcon={<DeleteOutline />}
									onClick={() => setDeleteDialogOpen(true)}
								>
									Delete Account
								</Button>
							</Box>
						</CardContent>
					</Card>
				</Grid>
			</Grid>

			{/* Delete Account Confirmation Dialog */}
			<Dialog
				open={deleteDialogOpen}
				onClose={() => setDeleteDialogOpen(false)}
				maxWidth="xs"
				fullWidth
			>
				<DialogTitle sx={{ fontWeight: 800, color: "error.main" }}>
					Delete Account
				</DialogTitle>
				<DialogContent>
					<Alert severity="error" sx={{ mb: 2 }}>
						This action is irreversible. All your data will be permanently deleted.
					</Alert>
					<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
						Please type <strong>DELETE</strong> to confirm:
					</Typography>
					<TextField
						fullWidth
						size="small"
						placeholder='Type "DELETE" to confirm'
						value={deleteConfirmText}
						onChange={(e) => setDeleteConfirmText(e.target.value)}
					/>
				</DialogContent>
				<DialogActions sx={{ px: 3, pb: 2 }}>
					<Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
					<Button
						variant="contained"
						color="error"
						onClick={() => deleteMutation.mutate()}
						disabled={deleteConfirmText !== "DELETE" || deleteMutation.isPending}
					>
						{deleteMutation.isPending ? "Deleting..." : "Delete Account"}
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
};
