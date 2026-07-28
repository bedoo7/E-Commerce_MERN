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
import {
	luxeSurface,
	luxeStickySummary,
	luxeDialogPaper,
} from "../theme/luxeStyles";
import toast from "react-hot-toast";

type CouponValidationResponse = {
	valid: boolean;
	discount: number;
	discountPercent: number;
	discountValue?: number;
	code: string;
	finalTotal?: number;
};

export const Cart: React.FC = () => {
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const [checkoutOpen, setCheckoutOpen] = useState(false);
	const [address, setAddress] = useState("");
	const [couponCode, setCouponCode] = useState("");
	const [couponApplied, setCouponApplied] = useState<{
		code: string;
		discount: number;
		discountPercent: number;
	} | null>(null);
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

	const validateCouponMutation = useMutation({
		mutationFn: async (code: string) => {
			const res = await api.post<CouponValidationResponse>("/coupon/validate", {
				code,
				orderAmount: cart?.totalAmount ?? 0,
			});
			return res.data;
		},
		onSuccess: (data) => {
			setCouponApplied({
				code: data.code,
				discount: data.discount,
				discountPercent: data.discountPercent,
			});
			toast.success(`Coupon ${data.code} applied successfully`);
		},
		onError: (err: any) => {
			setCouponApplied(null);
			toast.error(err.message || "Coupon validation failed");
		},
	});

	// Checkout mutation
	const checkoutMutation = useMutation({
		mutationFn: async (payload: { address: string; couponCode?: string }) => {
			const res = await api.post("/cart/checkout", payload);
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

	const handleCouponApply = () => {
		if (!couponCode.trim()) {
			toast.error("Enter a coupon code first");
			return;
		}
		validateCouponMutation.mutate(couponCode.trim().toUpperCase());
	};

	const handleCheckoutSubmit = () => {
		if (!address.trim()) {
			toast.error("Address is required");
			return;
		}
		checkoutMutation.mutate({
			address,
			couponCode: couponApplied?.code,
		});
	};

	const subtotal = cart?.totalAmount ?? 0;
	const discountAmount = couponApplied?.discount ?? 0;
	const finalTotal = Math.max(subtotal - discountAmount, 0);

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
						#
						{successOrder.orderNumber ||
							successOrder._id.slice(-8).toUpperCase()}
					</Typography>
					<Divider sx={{ my: 2 }} />
					<Stack spacing={1}>
						<Box display="flex" justifyContent="space-between">
							<Typography variant="body2" color="text.secondary">
								Subtotal
							</Typography>
							<Typography variant="body2" fontWeight={600}>
								${successOrder.subtotal ?? successOrder.totalAmount}
							</Typography>
						</Box>
						{successOrder.discount > 0 && (
							<Box display="flex" justifyContent="space-between">
								<Typography variant="body2" color="text.secondary">
									Discount
									{successOrder.couponCode
										? ` (${successOrder.couponCode})`
										: ""}
								</Typography>
								<Typography variant="body2" color="error.main" fontWeight={600}>
									-${successOrder.discount}
								</Typography>
							</Box>
						)}
						<Divider />
						<Box display="flex" justifyContent="space-between">
							<Typography variant="body1" fontWeight={700}>
								Total Paid
							</Typography>
							<Typography variant="h5" color="primary" fontWeight={800}>
								${successOrder.totalAmount}
							</Typography>
						</Box>
					</Stack>
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
											...luxeSurface,
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
								...luxeStickySummary,
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
											${subtotal.toLocaleString()}
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
									{discountAmount > 0 && (
										<Box display="flex" justifyContent="space-between">
											<Typography variant="body1" color="text.secondary">
												Discount
											</Typography>
											<Typography
												variant="body1"
												color="success.main"
												fontWeight={700}
											>
												-{discountAmount.toLocaleString()}
											</Typography>
										</Box>
									)}
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
								<Box sx={{ mb: 2.5 }}>
									<Typography variant="body2" color="text.secondary" mb={1}>
										{couponApplied ? "Coupon applied" : "Apply coupon code"}
									</Typography>
									<Stack direction="row" spacing={1}>
										<TextField
											fullWidth
											size="small"
											placeholder="SAVE10"
											value={couponCode}
											onChange={(e) => setCouponCode(e.target.value)}
											disabled={!!couponApplied}
										/>
										{couponApplied ? (
											<Button
												variant="outlined"
												color="error"
												onClick={() => {
													setCouponApplied(null);
													setCouponCode("");
												}}
											>
												Remove
											</Button>
										) : (
											<Button
												variant="outlined"
												onClick={handleCouponApply}
												disabled={
													validateCouponMutation.isPending || !couponCode.trim()
												}
											>
												{validateCouponMutation.isPending
													? "Checking..."
													: "Apply"}
											</Button>
										)}
									</Stack>
									{couponApplied && (
										<Typography
											variant="caption"
											color="success.main"
											sx={{ mt: 1, display: "block" }}
										>
											{couponApplied.code} applied for{" "}
											{couponApplied.discountPercent}% off
										</Typography>
									)}
								</Box>
								<Box display="flex" justifyContent="space-between" mb={3}>
									<Typography variant="h6" fontWeight={800}>
										Total
									</Typography>
									<Typography variant="h6" color="primary" fontWeight={800}>
										${finalTotal.toLocaleString()}
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

			<Dialog
				open={checkoutOpen}
				onClose={() => setCheckoutOpen(false)}
				fullWidth
				maxWidth="sm"
				PaperProps={{ sx: luxeDialogPaper }}
			>
				<DialogTitle>Complete Your Checkout</DialogTitle>
				<DialogContent>
					<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
						Enter the delivery address for your order.
					</Typography>
					<TextField
						fullWidth
						label="Delivery Address"
						multiline
						minRows={3}
						value={address}
						onChange={(e) => setAddress(e.target.value)}
					/>
				</DialogContent>
				<DialogActions sx={{ px: 3, pb: 2 }}>
					<Button onClick={() => setCheckoutOpen(false)}>Cancel</Button>
					<Button
						variant="contained"
						onClick={handleCheckoutSubmit}
						disabled={checkoutMutation.isPending || !address.trim()}
					>
						{checkoutMutation.isPending ? "Placing Order..." : "Place Order"}
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
};
