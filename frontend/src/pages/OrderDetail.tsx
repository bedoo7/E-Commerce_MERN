import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
	Box,
	Typography,
	Button,
	Card,
	CardContent,
	Grid,
	Chip,
	CircularProgress,
	Divider,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import { api } from "../api/axios";
import { IOrder, OrderStatus } from "../types";

const statusColors: Record<
	OrderStatus,
	"warning" | "info" | "primary" | "success" | "error"
> = {
	pending: "warning",
	processing: "info",
	shipped: "primary",
	delivered: "success",
	cancelled: "error",
};

export const OrderDetail: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();

	const {
		data: order,
		isLoading,
		error,
	} = useQuery<IOrder>({
		queryKey: ["order", id],
		queryFn: async () => {
			const res = await api.get<IOrder>(`/order/my-orders/${id}`);
			return res.data;
		},
		enabled: !!id,
	});

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

	if (error || !order) {
		return (
			<Box textAlign="center" py={8}>
				<Typography color="error" variant="h5">
					Order not found
				</Typography>
				<Button
					startIcon={<ArrowBackIcon />}
					onClick={() => navigate("/orders")}
					sx={{ mt: 2 }}
				>
					Back to Orders
				</Button>
			</Box>
		);
	}

	return (
		<Box>
			<Button
				startIcon={<ArrowBackIcon />}
				onClick={() => navigate("/orders")}
				sx={{ mb: 3, fontWeight: 600 }}
			>
				Back to Orders
			</Button>

			<Card sx={{ borderRadius: 4, mb: 4 }}>
				<CardContent sx={{ p: 4 }}>
					<Stack
						direction={{ xs: "column", sm: "row" }}
						justifyContent="space-between"
						alignItems={{ xs: "flex-start", sm: "center" }}
						gap={2}
					>
						<Box>
							<Typography variant="h5" fontWeight={800} gutterBottom>
								Order #{order._id.slice(-8).toUpperCase()}
							</Typography>
							<Typography variant="body2" color="text.secondary">
								Placed on{" "}
								{new Date(order.createdAt!).toLocaleDateString("en-US", {
									year: "numeric",
									month: "long",
									day: "numeric",
									hour: "2-digit",
									minute: "2-digit",
								})}
							</Typography>
						</Box>
						<Chip
							label={(order.status || "pending").toUpperCase()}
							color={statusColors[order.status || "pending"]}
							sx={{ fontWeight: 700, px: 1 }}
						/>
					</Stack>
				</CardContent>
			</Card>

			<Grid container spacing={4}>
				{/* Order Items */}
				<Grid item xs={12} md={8}>
					<Typography variant="h6" fontWeight={700} mb={2}>
						Order Items
					</Typography>
					<TableContainer
						component={Paper}
						sx={{ borderRadius: 3, overflow: "hidden" }}
					>
						<Table>
							<TableHead sx={{ bgcolor: "action.hover" }}>
								<TableRow>
									<TableCell sx={{ fontWeight: 700 }}>Product</TableCell>
									<TableCell sx={{ fontWeight: 700 }}>Price</TableCell>
									<TableCell sx={{ fontWeight: 700 }}>Qty</TableCell>
									<TableCell sx={{ fontWeight: 700 }}>Subtotal</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{order.orderItems.map((item, index) => (
									<TableRow key={index}>
										<TableCell>
											<Stack direction="row" spacing={2} alignItems="center">
												<Box
													component="img"
													src={item.productImage}
													alt={item.productTitle}
													sx={{
														width: 60,
														height: 60,
														objectFit: "contain",
														borderRadius: 2,
														bgcolor: "#fafafa",
														p: 0.5,
													}}
												/>
												<Typography variant="body2" fontWeight={600}>
													{item.productTitle}
												</Typography>
											</Stack>
										</TableCell>
										<TableCell>${item.unitPrice}</TableCell>
										<TableCell>{item.quantity}</TableCell>
										<TableCell>
											<Typography fontWeight={700}>
												${item.unitPrice * item.quantity}
											</Typography>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</TableContainer>
				</Grid>

				{/* Order Summary */}
				<Grid item xs={12} md={4}>
					<Card sx={{ borderRadius: 3 }}>
						<CardContent sx={{ p: 3 }}>
							<Typography variant="h6" fontWeight={700} gutterBottom>
								Order Summary
							</Typography>
							<Divider sx={{ my: 2 }} />
							<Stack spacing={1.5}>
								<Box display="flex" justifyContent="space-between">
									<Typography variant="body2" color="text.secondary">
										Subtotal
									</Typography>
									<Typography variant="body2" fontWeight={600}>
										${order.totalAmount}
									</Typography>
								</Box>
								<Box display="flex" justifyContent="space-between">
									<Typography variant="body2" color="text.secondary">
										Shipping
									</Typography>
									<Typography
										variant="body2"
										color="success.main"
										fontWeight={600}
									>
										FREE
									</Typography>
								</Box>
								<Divider />
								<Box display="flex" justifyContent="space-between">
									<Typography fontWeight={700}>Total</Typography>
									<Typography fontWeight={800} color="primary">
										${order.totalAmount}
									</Typography>
								</Box>
							</Stack>

							<Divider sx={{ my: 2 }} />

							<Box>
								<Typography variant="subtitle2" fontWeight={700} gutterBottom>
									Shipping Address
								</Typography>
								<Typography variant="body2" color="text.secondary">
									{order.address}
								</Typography>
							</Box>

							<Divider sx={{ my: 2 }} />

							<Stack direction="row" spacing={1} alignItems="center">
								<LocalShippingIcon color="primary" fontSize="small" />
								<Typography variant="caption" color="text.secondary">
									{(order.status || "pending") === "delivered"
										? "Delivered"
										: (order.status || "pending") === "shipped"
											? "Out for delivery"
											: "Processing"}
								</Typography>
							</Stack>
						</CardContent>
					</Card>
				</Grid>
			</Grid>
		</Box>
	);
};
