import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
	Box,
	Typography,
	Card,
	CardContent,
	Grid,
	IconButton,
	Button,
	Divider,
	TextField,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	CircularProgress,
	Stack,
	Paper,
} from "@mui/material";
import Add from "@mui/icons-material/Add";
import Remove from "@mui/icons-material/Remove";
import Delete from "@mui/icons-material/Delete";
import ShoppingBag from "@mui/icons-material/ShoppingBag";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { api } from "../api/axios";
import { ICart, IProduct, IOrder } from "../types";
import toast from "react-hot-toast";

export const Cart: React.FC = () => {
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const [checkoutOpen, setCheckoutOpen] = useState(false);
	const [address, setAddress] = useState("");
	const [successOrder, setSuccessOrder] = useState<IOrder | null>(null);

	// Fetch active cart
	const { data: cart, isLoading } = useQuery<ICart>({
		queryKey: ["cart"],
		queryFn: async () => {
			const res = await api.get<ICart>("/cart");
			return res.data;
		},
	});

	// Update item quantity mutation
	const updateQuantityMutation = useMutation({
		mutationFn: async ({
			productId,
			quantity,
		}: {
			productId: string;
			quantity: number;
		}) => {
			const res = await api.put("/cart/items", { productId, quantity });
			return res.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["cart"] });
		},
		onError: (err: any) => {
			toast.error(err.message || "Failed to update quantity");
		},
	});

	// Delete item mutation
	const deleteItemMutation = useMutation({
		mutationFn: async (productId: string) => {
			const res = await api.delete(`/cart/items/${productId}`);
			return res.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["cart"] });
			toast.success("Item removed from cart");
		},
		onError: (err: any) => {
			toast.error(err.message || "Failed to remove item");
		},
	});

	// Clear cart mutation
	const clearCartMutation = useMutation({
		mutationFn: async () => {
			const res = await api.delete("/cart/clear");
			return res.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["cart"] });
			toast.success("Cart cleared");
		},
		onError: (err: any) => {
			toast.error(err.message || "Failed to clear cart");
		},
	});

	// Checkout mutation
	const checkoutMutation = useMutation({
		mutationFn: async (address: string) => {
			const res = await api.post("/cart/checkout", { address });
			return res.data;
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ["cart"] });
			setSuccessOrder(data);
			setCheckoutOpen(false);
			setAddress("");
			toast.success("Order placed successfully!");
		},
		onError: (err: any) => {
			toast.error(err.message || "Checkout failed");
		},
	});

	const handleQuantityChange = (
		productId: string,
		currentQty: number,
		delta: number,
	) => {
		const newQty = currentQty + delta;
		if (newQty <= 0) {
			deleteItemMutation.mutate(productId);
		} else {
			updateQuantityMutation.mutate({ productId, quantity: newQty });
		}
	};

	const handleCheckoutSubmit = () => {
		if (!address.trim()) {
			toast.error("Address is required");
			return;
		}
		checkoutMutation.mutate(address);
	};

	if (isLoading) {
		return (
			<Box
				display="flex"
				justifyContent="center"
				alignItems="center"
				minHeight="50vh"
			>
				<CircularProgress />
			</Box>
		);
	}

	const hasItems = cart && cart.items && cart.items.length > 0;

	// Success screen
	if (successOrder) {
		return (
			<Box
				sx={{
					textAlign: "center",
					py: 8,
					maxWidth: 500,
					mx: "auto",
				}}
			>
				<CheckCircleIcon sx={{ fontSize: 80, color: "success.main", mb: 3 }} />
				<Typography variant="h4" fontWeight={800} gutterBottom>
					Order Placed! 🎉
				</Typography>
				<Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
					Thank you for your purchase. Your order has been received and is being
					processed.
				</Typography>
				<Paper
					elevation={0}
					sx={{
						p: 3,
						borderRadius: 3,
						border: "1px solid",
						borderColor: "divider",
						mb: 4,
						bgcolor: "background.paper",
					}}
				>
					<Typography variant="subtitle2" color="text.secondary" mb={1}>
						Order ID
					</Typography>
					<Typography
						variant="h6"
						fontWeight={700}
						sx={{ fontFamily: "monospace" }}
					>
						#{successOrder._id.slice(-8).toUpperCase()}
					</Typography>
					<Divider sx={{ my: 2 }} />
					<Typography variant="subtitle2" color="text.secondary" mb={1}>
						Total Paid
					</Typography>
					<Typography variant="h5" color="primary" fontWeight={800}>
						${successOrder.totalAmount}
					</Typography>
				</Paper>
				<Stack direction="row" spacing={2} justifyContent="center">
					<Button
						variant="outlined"
						onClick={() => {
							setSuccessOrder(null);
							navigate("/orders");
						}}
					>
						View Order
					</Button>
					<Button
						variant="contained"
						onClick={() => {
							setSuccessOrder(null);
							navigate("/");
						}}
					>
						Continue Shopping
					</Button>
				</Stack>
			</Box>
		);
	}

	return (
		<Box>
			<Typography variant="h4" fontWeight={800} gutterBottom>
				Your Shopping Cart
			</Typography>

			{!hasItems ? (
				<Card
					sx={{
						p: 6,
						textAlign: "center",
						mt: 4,
						borderRadius: 4,
						border: "1px dashed",
						borderColor: "divider",
					}}
				>
					<CardContent>
						<ShoppingBag
							sx={{
								fontSize: 64,
								color: "text.secondary",
								mb: 2,
								opacity: 0.5,
							}}
						/>
						<Typography variant="h5" fontWeight={700} gutterBottom>
							Your cart is empty
						</Typography>
						<Typography
							variant="body1"
							color="text.secondary"
							sx={{ mb: 3, maxWidth: 400, mx: "auto" }}
						>
							Browse our premium collection and add items you love to your cart.
						</Typography>
						<Button
							variant="contained"
							size="large"
							onClick={() => navigate("/")}
							sx={{ borderRadius: 3, px: 4 }}
						>
							Go Shopping
						</Button>
					</CardContent>
				</Card>
			) : (
				<Grid container spacing={4} sx={{ mt: 1 }}>
					{/* Cart Items List */}
					<Grid item xs={12} md={8}>
						<Stack spacing={2}>
							{cart.items.map((item) => {
								const product = item.product as IProduct;
								return (
									<Card
										key={product._id}
										sx={{
											borderRadius: 3,
											border: "1px solid",
											borderColor: "divider",
											transition: "all 0.2s ease",
											"&:hover": {
												boxShadow: (theme) =>
													theme.palette.mode === "light"
														? "0 4px 20px rgba(0,0,0,0.08)"
														: "0 4px 20px rgba(0,0,0,0.3)",
											},
										}}
									>
										<CardContent
											sx={{
												display: "flex",
												alignItems: "center",
												gap: 2,
												p: { xs: 2, sm: 3 },
											}}
										>
											<Box
												component="img"
												src={product.imageUrl}
												alt={product.name}
												sx={{
													width: { xs: 60, sm: 90 },
													height: { xs: 60, sm: 90 },
													objectFit: "contain",
													borderRadius: 2,
													bgcolor: (theme) =>
														theme.palette.mode === "light"
															? "#f8fafc"
															: "#0f172a",
													p: 1,
													flexShrink: 0,
												}}
												onError={(e: any) => {
													e.target.src =
														"https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80";
												}}
											/>
											<Box sx={{ flexGrow: 1, minWidth: 0 }}>
												<Typography
													variant="subtitle1"
													fontWeight={700}
													sx={{
														display: "-webkit-box",
														WebkitLineClamp: 1,
														WebkitBoxOrient: "vertical",
														overflow: "hidden",
													}}
												>
													{product.name}
												</Typography>
												<Typography
													variant="body2"
													color="text.secondary"
													sx={{ mb: 1 }}
												>
													Brand: {product.brand}
												</Typography>
												<Typography
													variant="body2"
													color="primary"
													fontWeight={600}
													display={{ xs: "block", sm: "none" }}
												>
													${item.unitPrice} each
												</Typography>
											</Box>

											{/* Desktop Price */}
											<Typography
												variant="body2"
												color="text.secondary"
												sx={{ display: { xs: "none", sm: "block" } }}
											>
												${item.unitPrice} each
											</Typography>

											{/* Quantity Controls */}
											<Box
												display="flex"
												alignItems="center"
												gap={0.5}
												sx={{
													border: "1px solid",
													borderColor: "divider",
													borderRadius: 2,
													p: 0.5,
												}}
											>
												<IconButton
													size="small"
													onClick={() =>
														handleQuantityChange(product._id, item.quantity, -1)
													}
													disabled={updateQuantityMutation.isPending}
												>
													<Remove fontSize="small" />
												</IconButton>
												<Typography
													variant="body1"
													fontWeight={700}
													sx={{ minWidth: 28, textAlign: "center" }}
												>
													{item.quantity}
												</Typography>
												<IconButton
													size="small"
													onClick={() =>
														handleQuantityChange(product._id, item.quantity, 1)
													}
													disabled={updateQuantityMutation.isPending}
												>
													<Add fontSize="small" />
												</IconButton>
											</Box>

											<Typography
												variant="h6"
												fontWeight={800}
												color="primary"
												sx={{ minWidth: 80, textAlign: "right" }}
											>
												${(item.unitPrice * item.quantity).toLocaleString()}
											</Typography>

											<IconButton
												color="error"
												onClick={() => deleteItemMutation.mutate(product._id)}
												disabled={deleteItemMutation.isPending}
												size="small"
											>
												<Delete />
											</IconButton>
										</CardContent>
									</Card>
								);
							})}
						</Stack>

						<Box display="flex" justifyContent="space-between" sx={{ mt: 2 }}>
							<Button
								variant="text"
								color="error"
								onClick={() => clearCartMutation.mutate()}
								disabled={clearCartMutation.isPending}
							>
								Clear Cart
							</Button>
							<Button variant="text" onClick={() => navigate("/")}>
								Continue Shopping
							</Button>
						</Box>
					</Grid>

					{/* Order Summary */}
					<Grid item xs={12} md={4}>
						<Card
							sx={{
								borderRadius: 3,
								border: "1px solid",
								borderColor: "divider",
								position: "sticky",
								top: 100,
							}}
						>
							<CardContent sx={{ p: 3 }}>
								<Typography variant="h6" fontWeight={700} gutterBottom>
									Order Summary
								</Typography>
								<Divider sx={{ my: 2 }} />
								<Stack spacing={1.5}>
									<Box display="flex" justifyContent="space-between">
										<Typography variant="body1" color="text.secondary">
											Subtotal ({cart.items.reduce((a, i) => a + i.quantity, 0)}{" "}
											items)
										</Typography>
										<Typography variant="body1" fontWeight={600}>
											${cart.totalAmount.toLocaleString()}
										</Typography>
									</Box>
									<Box display="flex" justifyContent="space-between">
										<Typography variant="body1" color="text.secondary">
											Shipping
										</Typography>
										<Typography
											variant="body1"
											color="success.main"
											fontWeight={600}
										>
											FREE
										</Typography>
									</Box>
									<Box display="flex" justifyContent="space-between">
										<Typography variant="body1" color="text.secondary">
											Tax
										</Typography>
										<Typography variant="body1" color="text.secondary">
											Calculated at checkout
										</Typography>
									</Box>
								</Stack>
								<Divider sx={{ my: 2 }} />
								<Box display="flex" justifyContent="space-between" mb={3}>
									<Typography variant="h6" fontWeight={800}>
										Total
									</Typography>
									<Typography variant="h6" color="primary" fontWeight={800}>
										${cart.totalAmount.toLocaleString()}
									</Typography>
								</Box>

								<Button
									fullWidth
									variant="contained"
									size="large"
									onClick={() => setCheckoutOpen(true)}
									sx={{ py: 1.5, borderRadius: 3, fontSize: "1rem" }}
								>
									Proceed to Checkout
								</Button>
							</CardContent>
						</Card>
					</Grid>
				</Grid>
			)}

			{/* Checkout Dialog */}
			<Dialog
				open={checkoutOpen}
				onClose={() => setCheckoutOpen(false)}
				fullWidth
				maxWidth="sm"
				PaperProps={{
					sx: { borderRadius: 4 },
				}}
			>
				<DialogTitle fontWeight={700} sx={{ pb: 1 }}>
					Checkout
				</DialogTitle>
				<DialogContent>
					<Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
						Enter your shipping address to complete your order of{" "}
						<strong>${cart?.totalAmount.toLocaleString()}</strong>.
					</Typography>
					<TextField
						fullWidth
						multiline
						rows={3}
						label="Shipping Address"
						placeholder="123 Main St, Apartment 4B, New York, NY 10001"
						value={address}
						onChange={(e) => setAddress(e.target.value)}
						required
					/>
				</DialogContent>
				<DialogActions sx={{ p: 3, pt: 0 }}>
					<Button
						onClick={() => setCheckoutOpen(false)}
						color="inherit"
						sx={{ borderRadius: 2 }}
					>
						Cancel
					</Button>
					<Button
						onClick={handleCheckoutSubmit}
						variant="contained"
						disabled={checkoutMutation.isPending || !address.trim()}
						sx={{ borderRadius: 2, px: 4 }}
					>
						{checkoutMutation.isPending ? (
							<CircularProgress size={24} color="inherit" />
						) : (
							`Pay $${cart?.totalAmount.toLocaleString()}`
						)}
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
};
