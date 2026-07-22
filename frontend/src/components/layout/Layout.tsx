import React, { useState } from "react";
import {
	AppBar,
	Toolbar,
	Typography,
	Button,
	IconButton,
	Box,
	Badge,
	Container,
	Menu,
	MenuItem,
	Avatar,
	Divider,
	Tooltip,
} from "@mui/material";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import StorefrontIcon from "@mui/icons-material/Storefront";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import { Link, useNavigate, useLocation } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { useColorMode } from "../../context/ColorModeContext";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../api/axios";
import { ICart } from "../../types";

export const Layout: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const { user, logout, isAuthenticated } = useAuth();
	const { mode, toggleColorMode } = useColorMode();
	const location = useLocation();

	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const isMenuOpen = Boolean(anchorEl);
	const navigate = useNavigate();
	const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleMenuClose = () => {
		setAnchorEl(null);
	};

	const handleLogout = () => {
		handleMenuClose();
		logout();
		navigate("/login");
	};

	// Fetch active cart to show badge count
	const { data: cart } = useQuery<ICart>({
		queryKey: ["cart"],
		queryFn: async () => {
			const res = await api.get<ICart>("/cart");
			return res.data;
		},
		enabled: isAuthenticated,
		staleTime: 1000 * 60 * 5, // 5 mins cache
	});

	const cartItemsCount =
		cart?.items.reduce((acc, item) => acc + item.quantity, 0) || 0;

	return (
		<Box display="flex" flexDirection="column" minHeight="100vh">
			{/* Modern Glassmorphic Top Navbar */}
			<AppBar
				position="sticky"
				elevation={0}
				sx={{
					bgcolor:
						mode === "light"
							? "rgba(255, 255, 255, 0.85)"
							: "rgba(15, 23, 42, 0.85)",
					backdropFilter: "blur(12px)",
					borderBottom: "1px solid",
					borderColor:
						mode === "light"
							? "rgba(226, 232, 240, 0.8)"
							: "rgba(51, 65, 85, 0.8)",
					color: "text.primary",
					transition: "all 0.3s ease",
				}}
			>
				<Container maxWidth="xl">
					<Toolbar disableGutters sx={{ minHeight: 70 }}>
						{/* Logo */}
						<Box
							component={Link}
							to="/"
							sx={{
								display: "flex",
								alignItems: "center",
								gap: 1.5,
								textDecoration: "none",
								color: "inherit",
								mr: 4,
							}}
						>
							<Box
								sx={{
									width: 40,
									height: 40,
									borderRadius: "12px",
									background:
										"linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									color: "#fff",
									boxShadow: "0 4px 12px rgba(79, 70, 229, 0.3)",
								}}
							>
								<StorefrontIcon />
							</Box>
							<Typography
								variant="h6"
								sx={{
									fontWeight: 800,
									letterSpacing: "-0.02em",
									background:
										"linear-gradient(135deg, #4f46e5 0%, #ec4899 100%)",
									WebkitBackgroundClip: "text",
									WebkitTextFillColor:
										mode === "light" ? "transparent" : "inherit",
								}}
							>
								LUXE STORE
							</Typography>
						</Box>

						{/* Nav Links */}
						<Box sx={{ flexGrow: 1, display: "flex", gap: 1 }}>
							<Button
								component={Link}
								to="/"
								color={location.pathname === "/" ? "primary" : "inherit"}
								sx={{
									fontWeight: location.pathname === "/" ? 700 : 500,
									bgcolor:
										location.pathname === "/"
											? mode === "light"
												? "rgba(79, 70, 229, 0.08)"
												: "rgba(129, 140, 248, 0.15)"
											: "transparent",
								}}
							>
								Shop
							</Button>
						</Box>

						{/* Right Actions */}
						<Box display="flex" alignItems="center" gap={1.5}>
							<Tooltip
								title={`Switch to ${mode === "dark" ? "Light" : "Dark"} Mode`}
							>
								<IconButton
									onClick={toggleColorMode}
									color="inherit"
									sx={{ border: "1px solid", borderColor: "divider" }}
								>
									{mode === "dark" ? (
										<Brightness7Icon fontSize="small" />
									) : (
										<Brightness4Icon fontSize="small" />
									)}
								</IconButton>
							</Tooltip>

							{isAuthenticated ? (
								<>
									<Tooltip title="Shopping Cart">
										<IconButton
											component={Link}
											to="/cart"
											color="inherit"
											sx={{
												border: "1px solid",
												borderColor: "divider",
												bgcolor:
													location.pathname === "/cart"
														? mode === "light"
															? "rgba(79, 70, 229, 0.08)"
															: "rgba(129, 140, 248, 0.15)"
														: "transparent",
											}}
										>
											<Badge
												badgeContent={cartItemsCount}
												color="error"
												overlap="circular"
											>
												<ShoppingBagOutlinedIcon fontSize="small" />
											</Badge>
										</IconButton>
									</Tooltip>

									{/* User Profile Menu */}
									<Box sx={{ ml: 1 }}>
										<IconButton
											onClick={handleProfileMenuOpen}
											size="small"
											sx={{
												p: 0.5,
												border: "2px solid",
												borderColor: "primary.main",
											}}
										>
											<Avatar
												sx={{
													width: 34,
													height: 34,
													bgcolor: "primary.main",
													fontSize: "0.9rem",
													fontWeight: 700,
												}}
											>
												{user?.firstName
													? user.firstName[0].toUpperCase()
													: "U"}
											</Avatar>
										</IconButton>

										<Menu
											anchorEl={anchorEl}
											open={isMenuOpen}
											onClose={handleMenuClose}
											PaperProps={{
												elevation: 4,
												sx: {
													mt: 1.5,
													minWidth: 200,
													borderRadius: 3,
													p: 1,
												},
											}}
											transformOrigin={{ horizontal: "right", vertical: "top" }}
											anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
										>
											<Box sx={{ px: 2, py: 1 }}>
												<Typography variant="subtitle2" fontWeight={700}>
													{user?.firstName} {user?.lastName}
												</Typography>
												<Typography variant="caption" color="text.secondary">
													{user?.email}
												</Typography>
											</Box>

											<Divider sx={{ my: 1 }} />

											{user?.role === "admin" && (
												<MenuItem
													component={Link}
													to="/admin"
													onClick={handleMenuClose}
													sx={{ borderRadius: 2, gap: 1.5, my: 0.5 }}
												>
													<DashboardOutlinedIcon
														fontSize="small"
														color="primary"
													/>
													<Typography variant="body2" fontWeight={600}>
														Admin Dashboard
													</Typography>
												</MenuItem>
											)}

											<MenuItem
												component={Link}
												to="/cart"
												onClick={handleMenuClose}
												sx={{ borderRadius: 2, gap: 1.5, my: 0.5 }}
											>
												<ShoppingBagOutlinedIcon
													fontSize="small"
													color="action"
												/>
												<Typography variant="body2">My Cart</Typography>
											</MenuItem>
											<MenuItem
												component={Link}
												to="/orders"
												onClick={handleMenuClose}
												sx={{ borderRadius: 2, gap: 1.5, my: 0.5 }}
											>
												<ReceiptLongIcon fontSize="small" color="action" />
												<Typography variant="body2">My Orders</Typography>
											</MenuItem>

											<Divider sx={{ my: 1 }} />

											<MenuItem
												onClick={handleLogout}
												sx={{ borderRadius: 2, gap: 1.5, color: "error.main" }}
											>
												<LogoutIcon fontSize="small" />
												<Typography variant="body2" fontWeight={600}>
													Logout
												</Typography>
											</MenuItem>
										</Menu>
									</Box>
								</>
							) : (
								<Box display="flex" gap={1}>
									<Button
										variant="text"
										component={Link}
										to="/login"
										startIcon={<PersonOutlineIcon />}
									>
										Sign In
									</Button>
									<Button
										variant="contained"
										component={Link}
										to="/register"
										sx={{ borderRadius: 2.5 }}
									>
										Register
									</Button>
								</Box>
							)}
						</Box>
					</Toolbar>
				</Container>
			</AppBar>

			{/* Main Content */}
			<Box component="main" sx={{ flexGrow: 1, py: 4 }}>
				<Container maxWidth="xl">{children}</Container>
			</Box>

			{/* Modern Footer */}
			<Box
				component="footer"
				sx={{
					py: 6,
					mt: "auto",
					bgcolor: mode === "light" ? "#f1f5f9" : "#020617",
					borderTop: "1px solid",
					borderColor: "divider",
				}}
			>
				<Container maxWidth="xl">
					<Box
						display="flex"
						flexDirection={{ xs: "column", md: "row" }}
						justifyContent="space-between"
						alignItems={{ xs: "center", md: "flex-start" }}
						gap={4}
						textAlign={{ xs: "center", md: "left" }}
					>
						<Box maxWidth={360}>
							<Box
								display="flex"
								alignItems="center"
								gap={1.5}
								justifyContent={{ xs: "center", md: "flex-start" }}
								mb={1.5}
							>
								<Box
									sx={{
										width: 32,
										height: 32,
										borderRadius: "8px",
										background:
											"linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										color: "#fff",
									}}
								>
									<StorefrontIcon fontSize="small" />
								</Box>
								<Typography variant="h6" fontWeight={800}>
									LUXE STORE
								</Typography>
							</Box>
							<Typography variant="body2" color="text.secondary">
								Your premier destination for high-end electronics, gadgets, and
								tech accessories with seamless fast delivery.
							</Typography>
						</Box>

						<Box display="flex" gap={6} flexWrap="wrap" justifyContent="center">
							<Box>
								<Typography variant="subtitle2" fontWeight={700} mb={1}>
									Shop
								</Typography>
								<Typography
									variant="body2"
									color="text.secondary"
									component={Link}
									to="/"
									sx={{
										textDecoration: "none",
										display: "block",
										mb: 0.8,
										"&:hover": { color: "primary.main" },
									}}
								>
									All Products
								</Typography>
								<Typography
									variant="body2"
									color="text.secondary"
									component={Link}
									to="/?category=Phones"
									sx={{
										textDecoration: "none",
										display: "block",
										mb: 0.8,
										"&:hover": { color: "primary.main" },
									}}
								>
									Smartphones
								</Typography>
								<Typography
									variant="body2"
									color="text.secondary"
									component={Link}
									to="/?category=Laptops"
									sx={{
										textDecoration: "none",
										display: "block",
										mb: 0.8,
										"&:hover": { color: "primary.main" },
									}}
								>
									Laptops
								</Typography>
							</Box>

							<Box>
								<Typography variant="subtitle2" fontWeight={700} mb={1}>
									Account
								</Typography>
								<Typography
									variant="body2"
									color="text.secondary"
									component={Link}
									to="/cart"
									sx={{
										textDecoration: "none",
										display: "block",
										mb: 0.8,
										"&:hover": { color: "primary.main" },
									}}
								>
									My Cart
								</Typography>
								<Typography
									variant="body2"
									color="text.secondary"
									component={Link}
									to="/login"
									sx={{
										textDecoration: "none",
										display: "block",
										mb: 0.8,
										"&:hover": { color: "primary.main" },
									}}
								>
									Sign In
								</Typography>
							</Box>
						</Box>
					</Box>

					<Divider sx={{ my: 4 }} />

					<Typography variant="body2" color="text.secondary" textAlign="center">
						© {new Date().getFullYear()} Luxe Store. Engineered with React,
						Node.js & MongoDB. All rights reserved.
					</Typography>
				</Container>
			</Box>
		</Box>
	);
};
