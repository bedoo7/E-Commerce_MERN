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
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useColorMode } from "../../context/ColorModeContext";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../api/axios";
import { ICart } from "../../types";
import { luxeFadeIn, luxeIconButton, luxeNavLinkActive } from "../../theme/luxeStyles";

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const { user, logout, isAuthenticated } = useAuth();
	const { mode, toggleColorMode } = useColorMode();
	const location = useLocation();
	const navigate = useNavigate();
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const isMenuOpen = Boolean(anchorEl);

	const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) =>
		setAnchorEl(event.currentTarget);
	const handleMenuClose = () => setAnchorEl(null);
	const handleLogout = () => {
		handleMenuClose();
		logout();
		navigate("/login");
	};

	const { data: cart } = useQuery<ICart>({
		queryKey: ["cart"],
		queryFn: async () => {
			const res = await api.get<ICart>("/cart");
			return res.data;
		},
		enabled: isAuthenticated,
		staleTime: 1000 * 60 * 5,
	});

	const cartItemsCount =
		cart?.items.reduce((acc, item) => acc + item.quantity, 0) || 0;

	const navActive = (path: string) =>
		path === "/"
			? location.pathname === "/"
			: location.pathname.startsWith(path);

	return (
		<Box display="flex" flexDirection="column" minHeight="100vh">
			<AppBar
				position="sticky"
				elevation={0}
				sx={{
					bgcolor:
						mode === "light"
							? "rgba(255,255,255,0.82)"
							: "rgba(11, 16, 32, 0.82)",
					backdropFilter: "blur(16px)",
					borderBottom: "1px solid",
					borderColor:
						mode === "light"
							? "rgba(226,232,240,0.85)"
							: "rgba(129, 140, 248, 0.12)",
					color: "text.primary",
				}}
			>
				<Container maxWidth="xl">
					<Toolbar disableGutters sx={{ minHeight: { xs: 64, md: 72 }, gap: 1 }}>
						<Box
							component={Link}
							to="/"
							sx={{
								display: "flex",
								alignItems: "center",
								gap: 1.5,
								textDecoration: "none",
								color: "inherit",
								mr: { xs: 1, md: 4 },
								flexShrink: 0,
								transition: "opacity 0.2s ease",
								"&:hover": { opacity: 0.9 },
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
									boxShadow: "0 8px 20px -6px rgba(79,70,229,0.55)",
								}}
							>
								<StorefrontIcon fontSize="small" />
							</Box>
							<Typography
								variant="h6"
								sx={{
									fontWeight: 800,
									letterSpacing: "-0.02em",
									display: { xs: "none", sm: "block" },
									background:
										mode === "light"
											? "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)"
											: "linear-gradient(135deg, #c4b5fd 0%, #e9d5ff 100%)",
									WebkitBackgroundClip: "text",
									WebkitTextFillColor: "transparent",
								}}
							>
								LUXE STORE
							</Typography>
						</Box>

						<Box sx={{ flexGrow: 1, display: "flex", gap: 0.5 }}>
							<Button
								component={Link}
								to="/"
								color={navActive("/") ? "primary" : "inherit"}
								sx={luxeNavLinkActive(navActive("/"), mode)}
							>
								Shop
							</Button>
							{isAuthenticated && (
								<Button
									component={Link}
									to="/wishlist"
									color={navActive("/wishlist") ? "primary" : "inherit"}
									sx={luxeNavLinkActive(navActive("/wishlist"), mode)}
								>
									Wishlist
								</Button>
							)}
						</Box>

						<Box display="flex" alignItems="center" gap={1}>
							<Tooltip
								title={`Switch to ${mode === "dark" ? "Light" : "Dark"} Mode`}
							>
								<IconButton
									onClick={toggleColorMode}
									color="inherit"
									size="small"
									sx={luxeIconButton}
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
											size="small"
											sx={{
												...luxeIconButton,
												...(navActive("/cart")
													? luxeNavLinkActive(true, mode)
													: {}),
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

									<IconButton
										onClick={handleProfileMenuOpen}
										size="small"
										sx={{
											p: 0.5,
											ml: 0.5,
											border: "2px solid",
											borderColor: "primary.main",
											boxShadow: "0 0 0 4px rgba(129, 140, 248, 0.15)",
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
											elevation: 0,
											sx: { mt: 1.5, minWidth: 220, borderRadius: 3, p: 1 },
										}}
										transformOrigin={{ horizontal: "right", vertical: "top" }}
										anchorOrigin={{
											horizontal: "right",
											vertical: "bottom",
										}}
									>
										<Box sx={{ px: 2, py: 1.25 }}>
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
												<DashboardOutlinedIcon fontSize="small" color="primary" />
												<Typography variant="body2" fontWeight={600}>
													Admin Dashboard
												</Typography>
											</MenuItem>
										)}
										<MenuItem
											component={Link}
											to="/wishlist"
											onClick={handleMenuClose}
											sx={{ borderRadius: 2, gap: 1.5, my: 0.5 }}
										>
											<FavoriteBorderIcon fontSize="small" color="error" />
											<Typography variant="body2">My Wishlist</Typography>
										</MenuItem>
										<MenuItem
											component={Link}
											to="/cart"
											onClick={handleMenuClose}
											sx={{ borderRadius: 2, gap: 1.5, my: 0.5 }}
										>
											<ShoppingBagOutlinedIcon fontSize="small" color="action" />
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
								</>
							) : (
								<Box display="flex" gap={1}>
									<Button
										variant="text"
										component={Link}
										to="/login"
										startIcon={<PersonOutlineIcon />}
										sx={{ display: { xs: "none", sm: "inline-flex" } }}
									>
										Sign In
									</Button>
									<Button
										variant="contained"
										component={Link}
										to="/register"
										sx={{
											borderRadius: 2.5,
											px: 2.5,
											background:
												"linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
										}}
									>
										Register
									</Button>
								</Box>
							)}
						</Box>
					</Toolbar>
				</Container>
			</AppBar>

			<Box component="main" sx={{ flexGrow: 1, py: { xs: 3, md: 4 } }}>
				<Container maxWidth="xl" sx={luxeFadeIn}>
					{children}
				</Container>
			</Box>

			<Box
				component="footer"
				sx={{
					py: { xs: 5, md: 6 },
					mt: "auto",
					position: "relative",
					overflow: "hidden",
					bgcolor: mode === "light" ? "#eef2ff" : "#070712",
					borderTop: "1px solid",
					borderColor:
						mode === "light"
							? "rgba(199, 210, 254, 0.5)"
							: "rgba(129, 140, 248, 0.12)",
					"&::before": {
						content: '""',
						position: "absolute",
						inset: 0,
						background:
							mode === "dark"
								? "radial-gradient(ellipse 60% 80% at 10% 100%, rgba(79, 70, 229, 0.15) 0%, transparent 55%)"
								: "radial-gradient(ellipse 60% 80% at 90% 0%, rgba(79, 70, 229, 0.08) 0%, transparent 55%)",
						pointerEvents: "none",
					},
				}}
			>
				<Container maxWidth="xl" sx={{ position: "relative", zIndex: 1 }}>
					<Box
						display="flex"
						flexDirection={{ xs: "column", md: "row" }}
						justifyContent="space-between"
						alignItems={{ xs: "center", md: "flex-start" }}
						gap={4}
						textAlign={{ xs: "center", md: "left" }}
					>
						<Box maxWidth={380}>
							<Box
								display="flex"
								alignItems="center"
								gap={1.5}
								justifyContent={{ xs: "center", md: "flex-start" }}
								mb={1.5}
							>
								<Box
									sx={{
										width: 36,
										height: 36,
										borderRadius: "10px",
										background:
											"linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										color: "#fff",
										boxShadow: "0 6px 16px -4px rgba(79,70,229,0.5)",
									}}
								>
									<StorefrontIcon fontSize="small" />
								</Box>
								<Typography variant="h6" fontWeight={800} letterSpacing="-0.02em">
									LUXE STORE
								</Typography>
							</Box>
							<Typography variant="body2" color="text.secondary" lineHeight={1.7}>
								Your premier destination for high-end electronics, gadgets, and
								tech accessories with seamless fast delivery.
							</Typography>
						</Box>
						<Box
							display="flex"
							gap={{ xs: 4, md: 8 }}
							flexWrap="wrap"
							justifyContent="center"
						>
							<Box>
								<Typography variant="subtitle2" fontWeight={700} mb={1.5}>
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
										mb: 1,
										transition: "color 0.2s ease",
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
										mb: 1,
										transition: "color 0.2s ease",
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
										mb: 1,
										transition: "color 0.2s ease",
										"&:hover": { color: "primary.main" },
									}}
								>
									Laptops
								</Typography>
							</Box>
							<Box>
								<Typography variant="subtitle2" fontWeight={700} mb={1.5}>
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
										mb: 1,
										transition: "color 0.2s ease",
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
										mb: 1,
										transition: "color 0.2s ease",
										"&:hover": { color: "primary.main" },
									}}
								>
									Sign In
								</Typography>
							</Box>
						</Box>
					</Box>
					<Divider sx={{ my: 4, borderColor: "divider" }} />
					<Typography variant="body2" color="text.secondary" textAlign="center">
						&copy; {new Date().getFullYear()} Luxe Store. Engineered with React,
						Node.js & MongoDB. All rights reserved.
					</Typography>
				</Container>
			</Box>
		</Box>
	);
};
