import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
	Box,
	Typography,
	Chip,
	Button,
	CircularProgress,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
} from "@mui/material";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import { api } from "../api/axios";
import { IOrder, IPaginatedResponse, OrderStatus } from "../types";
import { PaginationComponent } from "../components/common/PaginationComponent";
import { EmptyState } from "../components/common/EmptyState";
import { luxeTableContainer } from "../theme/luxeStyles";
import { usePaginationScroll } from "../hooks/usePaginationScroll";
import { useState } from "react";

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

export const MyOrders: React.FC = () => {
	const navigate = useNavigate();
	const limit = 10;
	const { firstItemRef, scrollToFirstItem } = usePaginationScroll<HTMLTableRowElement>();
	const [page, setPage] = useState(1);

	const handlePageChange = (p: number) => {
		setPage(p);
	};

	const { data, isLoading, error } = useQuery<IPaginatedResponse<IOrder>>({
		queryKey: ["my-orders", page],
		queryFn: async () => {
			const res = await api.get<IPaginatedResponse<IOrder>>(
				`/order/my-orders?page=${page}&limit=${limit}`,
			);
			return res.data;
		},
	});

	useEffect(() => {
		if (data?.data && data.data.length > 0) {
			scrollToFirstItem();
		}
	}, [page, data]);

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

	if (error) {
		return (
			<Box textAlign="center" py={5}>
				<Typography color="error" variant="h6">
					Failed to load orders. Please try again later.
				</Typography>
			</Box>
		);
	}

	const orders = data?.data ?? [];
	const pagination = data?.pagination;

	return (
		<Box>
			<Box
				display="flex"
				alignItems="center"
				justifyContent="space-between"
				mb={4}
				flexWrap="wrap"
				gap={2}
			>
				<Box>
					<Typography variant="h4" fontWeight={800} gutterBottom>
						My Orders
					</Typography>
					<Typography variant="body1" color="text.secondary">
						Track and manage your order history
					</Typography>
				</Box>
				<Button
					variant="contained"
					startIcon={<ShoppingBagIcon />}
					onClick={() => navigate("/")}
				>
					Continue Shopping
				</Button>
			</Box>

			{orders.length === 0 ? (
				<EmptyState
					icon={
						<ReceiptLongIcon
							sx={{ fontSize: 64, color: "text.secondary", opacity: 0.6 }}
						/>
					}
					title="No orders yet"
					description="You haven't placed any orders yet. Start shopping to see your orders here."
					actionText="Browse Products"
					onAction={() => navigate("/")}
				/>
			) : (
				<>
					<TableContainer
						component={Paper}
						sx={{ ...luxeTableContainer, maxHeight: "none" }}
					>
						<Table>
							<TableHead>
								<TableRow>
									<TableCell sx={{ fontWeight: 700, whiteSpace: "nowrap" }}>
										Order ID
									</TableCell>
									<TableCell sx={{ fontWeight: 700 }}>Items</TableCell>
									<TableCell sx={{ fontWeight: 700 }}>Total</TableCell>
									<TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
									<TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
									<TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
								</TableRow>
							</TableHead>
					<TableBody>
						{orders.map((order, index) => (
							<TableRow
								key={order._id}
								hover
								ref={index === 0 ? firstItemRef : undefined}
							>
										<TableCell sx={{ pl: 3 }}>
											<Typography
												variant="body2"
												fontWeight={600}
												sx={{
													fontFamily: "monospace",
													maxWidth: 140,
													overflow: "hidden",
													textOverflow: "ellipsis",
													whiteSpace: "nowrap",
												}}
											>
												#{order.orderNumber}
											</Typography>
										</TableCell>
										<TableCell>
											{order.orderItems.length} item
											{order.orderItems.length > 1 ? "s" : ""}
										</TableCell>
										<TableCell>
											<Typography fontWeight={700} color="primary">
												${order.totalAmount.toLocaleString()}
											</Typography>
										</TableCell>
										<TableCell>
											<Chip
												label={(order.status || "pending").toUpperCase()}
												color={statusColors[order.status || "pending"]}
												size="small"
												sx={{ fontWeight: 700, minWidth: 90 }}
											/>
										</TableCell>
										<TableCell>
											<Typography
												variant="body2"
												color="text.secondary"
												sx={{ whiteSpace: "nowrap" }}
											>
												{order.createdAt
													? new Date(order.createdAt).toLocaleDateString(
															"en-US",
															{
																year: "numeric",
																month: "short",
																day: "numeric",
															},
														)
													: "Date N/A"}
											</Typography>
										</TableCell>
										<TableCell>
											<Button
												size="small"
												variant="outlined"
												onClick={() => navigate(`/orders/${order._id}`)}
											>
												View
											</Button>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</TableContainer>

					{pagination && (
						<PaginationComponent
							pagination={pagination}
							onPageChange={handlePageChange}
							onLimitChange={() => {}}
						/>
					)}
				</>
			)}
		</Box>
	);
};
