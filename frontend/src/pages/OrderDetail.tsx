import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	MenuItem,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import CancelIcon from "@mui/icons-material/Cancel";
import { api } from "../api/axios";
import { IOrder, OrderStatus } from "../types";
import {
	luxeTableContainer,
	luxeSurface,
	luxeDialogPaper,
} from "../theme/luxeStyles";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

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

const PRESET_REASONS = [
	"Changed my mind",
	"Found a better price",
	"Ordered by mistake",
	"Shipping takes too long",
	"Product no longer needed",
	"Other",
];

export const OrderDetail: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
	const [cancelReason, setCancelReason] = useState("");
	const [customReason, setCustomReason] = useState("");

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

	const cancelMutation = useMutation({
		mutationFn: async (reason: string) => {
			const res = await api.post(`/order/${id}/cancel`, {
				cancelReason: reason,
			});
			return res.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["order", id] });
			queryClient.invalidateQueries({ queryKey: ["my-orders"] });
			setCancelDialogOpen(false);
			setCancelReason("");
			setCustomReason("");
			toast.success("Order cancelled successfully");
		},
		onError: (err: any) => {
			toast.error(err.message || "Failed to cancel order");
		},
	});

	const handleCancelSubmit = () => {
		const reason =
			cancelReason === "Other" ? customReason.trim() : cancelReason;
		if (!reason) {
			toast.error("Please provide a cancellation reason");
			return;
		}
		cancelMutation.mutate(reason);
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

	const isCancelled = order.status === "cancelled";

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
								Order #{order.orderNumber}
							</Typography>
							<Typography variant="body2" color="text.secondary">
								Placed on{" "}
								{order.createdAt
									? new Date(order.createdAt).toLocaleDateString("en-US", {
											year: "numeric",
											month: "long",
											day: "numeric",
											hour: "2-digit",
											minute: "2-digit",
										})
									: "Date unavailable"}
							</Typography>
							{isCancelled && order.cancelledAt && (
								<Typography variant="body2" color="error.main" sx={{ mt: 1 }}>
									Cancelled on{" "}
									{new Date(order.cancelledAt).toLocaleDateString("en-US", {
										year: "numeric",
										month: "long",
										day: "numeric",
									})}
								</Typography>
							)}
						</Box>
						<Stack direction="row" spacing={1} alignItems="center">
							<Chip
								label={(order.status || "pending").toUpperCase()}
								color={statusColors[order.status || "pending"]}
								sx={{ fontWeight: 700, px: 1 }}
							/>
							{order.status === "pending" && (
								<Button
									variant="outlined"
									color="error"
									size="small"
									startIcon={<CancelIcon />}
									onClick={() => setCancelDialogOpen(true)}
									sx={{ borderRadius: 2.5, fontWeight: 600 }}
								>
									Cancel
								</Button>
							)}
						</Stack>
					</Stack>
				</CardContent>
			</Card>

			{/* Cancellation Info */}
			{isCancelled && order.cancelReason && (
				<Card
					sx={{
						mb: 4,
						borderRadius: 4,
						border: "1px solid",
						borderColor: "error.main",
						borderStyle: "dashed",
					}}
				>
					<CardContent sx={{ p: 3 }}>
						<Stack direction="row" spacing={1.5} alignItems="flex-start">
							<CancelIcon color="error" sx={{ mt: 0.25 }} />
							<Box>
								<Typography
									variant="subtitle1"
									fontWeight={700}
									color="error.main"
									gutterBottom
								>
									Order Cancelled
								</Typography>
								<Typography variant="body2" color="text.secondary">
									<strong>Reason:</strong> {order.cancelReason}
								</Typography>
								{order.cancelledAt && (
									<Typography variant="body2" color="text.secondary">
										<strong>Cancelled on:</strong>{" "}
										{new Date(order.cancelledAt).toLocaleDateString("en-US", {
											year: "numeric",
											month: "long",
											day: "numeric",
											hour: "2-digit",
											minute: "2-digit",
										})}
									</Typography>
								)}
							</Box>
						</Stack>
					</CardContent>
				</Card>
			)}

			<Grid container spacing={4}>
				<Grid item xs={12} md={8}>
					<Typography variant="h6" fontWeight={700} mb={2}>
						Order Items
					</Typography>
					<TableContainer component={Paper} sx={{ ...luxeTableContainer }}>
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
										${order.subtotal ?? order.totalAmount}
									</Typography>
								</Box>
								{order.discount > 0 && (
									<Box display="flex" justifyContent="space-between">
										<Typography variant="body2" color="text.secondary">
											Discount{order.couponCode ? ` (${order.couponCode})` : ""}
										</Typography>
										<Typography
											variant="body2"
											color="error.main"
											fontWeight={600}
										>
											-${order.discount}
										</Typography>
									</Box>
								)}
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
									<Typography fontWeight={700}>Total Paid</Typography>
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

			{/* Cancel Order Dialog */}
			<Dialog
				open={cancelDialogOpen}
				onClose={() => setCancelDialogOpen(false)}
				fullWidth
				maxWidth="sm"
				PaperProps={{ sx: { ...luxeDialogPaper } }}
			>
				<DialogTitle fontWeight={800} letterSpacing="-0.02em">
					Cancel Order
				</DialogTitle>
				<DialogContent>
					<Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
						Please tell us why you'd like to cancel this order. This helps us
						improve our service.
					</Typography>
					<TextField
						fullWidth
						select
						label="Reason for cancellation"
						value={cancelReason}
						onChange={(e) => {
							setCancelReason(e.target.value);
							if (e.target.value !== "Other") setCustomReason("");
						}}
						sx={{ mb: 2 }}
					>
						{PRESET_REASONS.map((reason) => (
							<MenuItem key={reason} value={reason}>
								{reason}
							</MenuItem>
						))}
					</TextField>
					{cancelReason === "Other" && (
						<TextField
							fullWidth
							multiline
							rows={3}
							label="Describe your reason"
							value={customReason}
							onChange={(e) => setCustomReason(e.target.value)}
							placeholder="Please provide details..."
						/>
					)}
				</DialogContent>
				<DialogActions sx={{ p: 3, pt: 0 }}>
					<Button
						onClick={() => {
							setCancelDialogOpen(false);
							setCancelReason("");
							setCustomReason("");
						}}
						color="inherit"
						disabled={cancelMutation.isPending}
						sx={{ borderRadius: 2.5 }}
					>
						Keep Order
					</Button>
					<Button
						variant="contained"
						color="error"
						onClick={handleCancelSubmit}
						disabled={
							cancelMutation.isPending ||
							!cancelReason ||
							(cancelReason === "Other" && !customReason.trim())
						}
						sx={{ borderRadius: 2.5, fontWeight: 700 }}
					>
						{cancelMutation.isPending ? "Cancelling..." : "Cancel Order"}
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
};
