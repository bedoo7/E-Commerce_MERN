import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
	Box,
	Typography,
	Card,
	CardContent,
	Tabs,
	Tab,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	Chip,
	CircularProgress,
	Button,
	Stack,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	MenuItem,
	IconButton,
	Tooltip,
	Grid,
	Divider,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import InventoryIcon from "@mui/icons-material/Inventory";
import PeopleIcon from "@mui/icons-material/People";
import { api } from "../api/axios";
import {
	IProduct,
	IUser,
	IOrder,
	IPaginatedResponse,
	IUsersResponse,
	OrderStatus,
} from "../types";
import {
	ProductSkeletonGrid,
	TableSkeletonRows,
} from "../components/common/LoadingSkeletons";
import { PaginationComponent } from "../components/common/PaginationComponent";
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

interface TabPanelProps {
	children: React.ReactNode;
	value: number;
	index: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
	<Box role="tabpanel" hidden={value !== index} sx={{ mt: 3 }}>
		{value === index && children}
	</Box>
);

export const AdminDashboard: React.FC = () => {
	const queryClient = useQueryClient();
	const [tabIndex, setTabIndex] = useState(0);
	const [productPage, setProductPage] = useState(1);
	const [orderPage, setOrderPage] = useState(1);
	const limit = 12;

	// Product management state
	const [productDialogOpen, setProductDialogOpen] = useState(false);
	const [editingProduct, setEditingProduct] =
		useState<Partial<IProduct> | null>(null);
	const [productForm, setProductForm] = useState({
		name: "",
		description: "",
		price: 0,
		category: "",
		brand: "",
		stock: 0,
		imageUrl: "",
	});

	// Order management state
	const [statusDialogOpen, setStatusDialogOpen] = useState(false);
	const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);
	const [newStatus, setNewStatus] = useState<OrderStatus>("pending");

	// Fetch users
	const { data: usersData, isLoading: usersLoading } = useQuery<IUsersResponse>(
		{
			queryKey: ["admin-users"],
			queryFn: async () => {
				const res = await api.get<IUsersResponse>("/user/getAllUsers");
				return res.data;
			},
		},
	);

	// Fetch all orders
	const { data: ordersData, isLoading: ordersLoading } = useQuery<
		IPaginatedResponse<IOrder>
	>({
		queryKey: ["admin-orders", orderPage],
		queryFn: async () => {
			const res = await api.get<IPaginatedResponse<IOrder>>(
				`/order/admin/all?page=${orderPage}&limit=${limit}`,
			);
			return res.data;
		},
	});

	// Fetch all products
	const { data: productsData, isLoading: productsLoading } = useQuery<
		IPaginatedResponse<IProduct>
	>({
		queryKey: ["admin-products", productPage],
		queryFn: async () => {
			const res = await api.get<IPaginatedResponse<IProduct>>(
				`/product?page=${productPage}&limit=${limit}`,
			);
			return res.data;
		},
	});

	// Create/Update product mutation
	const saveProductMutation = useMutation({
		mutationFn: async (data: Partial<IProduct>) => {
			if (editingProduct?._id) {
				const res = await api.put(`/product/${editingProduct._id}`, data);
				return res.data;
			} else {
				const res = await api.post("/product", data);
				return res.data;
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin-products"] });
			queryClient.invalidateQueries({ queryKey: ["products"] });
			toast.success(editingProduct ? "Product updated!" : "Product created!");
			setProductDialogOpen(false);
			resetProductForm();
		},
		onError: (err: any) => {
			toast.error(err.message || "Failed to save product");
		},
	});

	// Delete product mutation
	const deleteProductMutation = useMutation({
		mutationFn: async (productId: string) => {
			await api.delete(`/product/${productId}`);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin-products"] });
			queryClient.invalidateQueries({ queryKey: ["products"] });
			toast.success("Product deleted!");
		},
		onError: (err: any) => {
			toast.error(err.message || "Failed to delete product");
		},
	});

	// Update order status mutation
	const updateStatusMutation = useMutation({
		mutationFn: async ({
			orderId,
			status,
		}: {
			orderId: string;
			status: string;
		}) => {
			const res = await api.put(`/order/admin/${orderId}/status`, { status });
			return res.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
			toast.success("Order status updated!");
			setStatusDialogOpen(false);
		},
		onError: (err: any) => {
			toast.error(err.message || "Failed to update status");
		},
	});

	const resetProductForm = () => {
		setProductForm({
			name: "",
			description: "",
			price: 0,
			category: "",
			brand: "",
			stock: 0,
			imageUrl: "",
		});
		setEditingProduct(null);
	};

	const openEditProduct = (product: IProduct) => {
		setEditingProduct(product);
		setProductForm({
			name: product.name,
			description: product.description,
			price: product.price,
			category: product.category,
			brand: product.brand,
			stock: product.stock,
			imageUrl: product.imageUrl,
		});
		setProductDialogOpen(true);
	};

	const openCreateProduct = () => {
		resetProductForm();
		setProductDialogOpen(true);
	};

	const handleSaveProduct = () => {
		if (!productForm.name || !productForm.price) {
			toast.error("Name and price are required");
			return;
		}
		saveProductMutation.mutate(productForm);
	};

	const handleDeleteProduct = (productId: string) => {
		if (window.confirm("Are you sure you want to delete this product?")) {
			deleteProductMutation.mutate(productId);
		}
	};

	const handleOpenStatus = (order: IOrder) => {
		setSelectedOrder(order);
		setNewStatus(order.status || "pending");
		setStatusDialogOpen(true);
	};

	const orders = ordersData?.data ?? [];
	const ordersPagination = ordersData?.pagination;
	const products = productsData?.data ?? [];
	const productsPagination = productsData?.pagination;

	return (
		<Box>
			<Typography variant="h4" fontWeight={800} gutterBottom>
				Admin Dashboard
			</Typography>
			<Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
				Manage products, orders, and users
			</Typography>

			{/* Stats Cards */}
			<Grid container spacing={3} mb={4}>
				<Grid item xs={12} sm={4}>
					<Card
						sx={{
							borderRadius: 3,
							border: "1px solid",
							borderColor: "divider",
						}}
					>
						<CardContent>
							<Stack direction="row" alignItems="center" spacing={2}>
								<PeopleIcon color="primary" sx={{ fontSize: 40 }} />
								<Box>
									<Typography
										variant="overline"
										color="text.secondary"
										fontWeight={700}
									>
										Total Users
									</Typography>
									<Typography variant="h4" fontWeight={800}>
										{usersData?.count || 0}
									</Typography>
								</Box>
							</Stack>
						</CardContent>
					</Card>
				</Grid>
				<Grid item xs={12} sm={4}>
					<Card
						sx={{
							borderRadius: 3,
							border: "1px solid",
							borderColor: "divider",
						}}
					>
						<CardContent>
							<Stack direction="row" alignItems="center" spacing={2}>
								<InventoryIcon color="secondary" sx={{ fontSize: 40 }} />
								<Box>
									<Typography
										variant="overline"
										color="text.secondary"
										fontWeight={700}
									>
										Total Products
									</Typography>
									<Typography variant="h4" fontWeight={800}>
										{productsData?.pagination?.totalItems || 0}
									</Typography>
								</Box>
							</Stack>
						</CardContent>
					</Card>
				</Grid>
				<Grid item xs={12} sm={4}>
					<Card
						sx={{
							borderRadius: 3,
							border: "1px solid",
							borderColor: "divider",
						}}
					>
						<CardContent>
							<Stack direction="row" alignItems="center" spacing={2}>
								<LocalShippingIcon color="success" sx={{ fontSize: 40 }} />
								<Box>
									<Typography
										variant="overline"
										color="text.secondary"
										fontWeight={700}
									>
										Total Orders
									</Typography>
									<Typography variant="h4" fontWeight={800}>
										{ordersData?.pagination?.totalItems || 0}
									</Typography>
								</Box>
							</Stack>
						</CardContent>
					</Card>
				</Grid>
			</Grid>

			{/* Tab Navigation */}
			<Card sx={{ borderRadius: 3, overflow: "hidden" }}>
				<Tabs
					value={tabIndex}
					onChange={(_, newValue) => setTabIndex(newValue)}
					sx={{
						px: 2,
						pt: 1,
						borderBottom: "1px solid",
						borderColor: "divider",
					}}
				>
					<Tab label="Products" />
					<Tab label="Orders" />
					<Tab label="Users" />
				</Tabs>

				{/* Products Tab */}
				<TabPanel value={tabIndex} index={0}>
					<Box
						display="flex"
						justifyContent="space-between"
						alignItems="center"
						mb={3}
						px={3}
					>
						<Typography variant="h6" fontWeight={700}>
							All Products
						</Typography>
						<Button
							variant="contained"
							startIcon={<AddIcon />}
							onClick={openCreateProduct}
						>
							Add Product
						</Button>
					</Box>

					{productsLoading ? (
						<ProductSkeletonGrid count={4} />
					) : (
						<>
							<TableContainer>
								<Table>
									<TableHead sx={{ bgcolor: "action.hover" }}>
										<TableRow>
											<TableCell sx={{ fontWeight: 700 }}>Image</TableCell>
											<TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
											<TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
											<TableCell sx={{ fontWeight: 700 }}>Price</TableCell>
											<TableCell sx={{ fontWeight: 700 }}>Stock</TableCell>
											<TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{products.map((product) => (
											<TableRow key={product._id} hover>
												<TableCell>
													<Box
														component="img"
														src={product.imageUrl}
														alt={product.name}
														sx={{
															width: 50,
															height: 50,
															objectFit: "contain",
															borderRadius: 2,
															bgcolor: "#fafafa",
														}}
													/>
												</TableCell>
												<TableCell>
													<Typography fontWeight={600}>
														{product.name}
													</Typography>
												</TableCell>
												<TableCell>{product.category}</TableCell>
												<TableCell>
													<Typography fontWeight={600}>
														${product.price}
													</Typography>
												</TableCell>
												<TableCell>
													<Chip
														label={product.stock}
														size="small"
														color={product.stock > 0 ? "success" : "error"}
													/>
												</TableCell>
												<TableCell>
													<Stack direction="row" spacing={1}>
														<Tooltip title="Edit">
															<IconButton
																size="small"
																color="primary"
																onClick={() => openEditProduct(product)}
															>
																<EditIcon />
															</IconButton>
														</Tooltip>
														<Tooltip title="Delete">
															<IconButton
																size="small"
																color="error"
																onClick={() => handleDeleteProduct(product._id)}
															>
																<DeleteIcon />
															</IconButton>
														</Tooltip>
													</Stack>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</TableContainer>
							{productsPagination && (
								<Box px={3} pb={2}>
									<PaginationComponent
										pagination={productsPagination}
										onPageChange={setProductPage}
									/>
								</Box>
							)}
						</>
					)}
				</TabPanel>

				{/* Orders Tab */}
				<TabPanel value={tabIndex} index={1}>
					<Box px={3}>
						<Typography variant="h6" fontWeight={700} mb={3}>
							All Orders
						</Typography>
						{ordersLoading ? (
							<TableContainer component={Paper}>
								<Table>
									<TableBody>
										<TableSkeletonRows rows={5} cols={6} />
									</TableBody>
								</Table>
							</TableContainer>
						) : (
							<>
								<TableContainer component={Paper} sx={{ borderRadius: 2 }}>
									<Table>
										<TableHead sx={{ bgcolor: "action.hover" }}>
											<TableRow>
												<TableCell sx={{ fontWeight: 700 }}>Order ID</TableCell>
												<TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>
												<TableCell sx={{ fontWeight: 700 }}>Items</TableCell>
												<TableCell sx={{ fontWeight: 700 }}>Total</TableCell>
												<TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
												<TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
												<TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
											</TableRow>
										</TableHead>
										<TableBody>
											{orders.map((order) => {
												const user = order.userId as IUser;
												return (
													<TableRow key={order._id} hover>
														<TableCell>
															<Typography
																variant="body2"
																fontWeight={600}
																sx={{ fontFamily: "monospace" }}
															>
																#{order._id.slice(-8).toUpperCase()}
															</Typography>
														</TableCell>
														<TableCell>
															{user?.firstName} {user?.lastName}
															<Typography
																variant="caption"
																display="block"
																color="text.secondary"
															>
																{user?.email}
															</Typography>
														</TableCell>
														<TableCell>{order.orderItems.length}</TableCell>
														<TableCell>
															<Typography fontWeight={700}>
																${order.totalAmount}
															</Typography>
														</TableCell>
														<TableCell>
															<Chip
																label={(
																	order.status || "pending"
																).toUpperCase()}
																color={statusColors[order.status || "pending"]}
																size="small"
																sx={{ fontWeight: 700 }}
															/>
														</TableCell>
														<TableCell>
															{new Date(order.createdAt!).toLocaleDateString()}
														</TableCell>
														<TableCell>
															<Button
																size="small"
																variant="outlined"
																onClick={() => handleOpenStatus(order)}
															>
																Update
															</Button>
														</TableCell>
													</TableRow>
												);
											})}
										</TableBody>
									</Table>
								</TableContainer>
								{ordersPagination && (
									<Box mt={2}>
										<PaginationComponent
											pagination={ordersPagination}
											onPageChange={setOrderPage}
										/>
									</Box>
								)}
							</>
						)}
					</Box>
				</TabPanel>

				{/* Users Tab */}
				<TabPanel value={tabIndex} index={2}>
					<Box px={3}>
						<Typography variant="h6" fontWeight={700} mb={3}>
							Registered Users
						</Typography>
						{usersLoading ? (
							<TableContainer component={Paper}>
								<Table>
									<TableBody>
										<TableSkeletonRows rows={8} cols={4} />
									</TableBody>
								</Table>
							</TableContainer>
						) : (
							<TableContainer component={Paper} sx={{ borderRadius: 2 }}>
								<Table>
									<TableHead sx={{ bgcolor: "action.hover" }}>
										<TableRow>
											<TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
											<TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
											<TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
											<TableCell sx={{ fontWeight: 700 }}>Joined</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{usersData?.users.map((user) => (
											<TableRow key={user._id} hover>
												<TableCell>
													<Typography fontWeight={600}>
														{user.firstName} {user.lastName}
													</Typography>
												</TableCell>
												<TableCell>{user.email}</TableCell>
												<TableCell>
													<Chip
														label={(user.role || "user").toUpperCase()}
														color={
															user.role === "admin" ? "secondary" : "default"
														}
														size="small"
														sx={{ fontWeight: 700 }}
													/>
												</TableCell>
												<TableCell>
													{user.createdAt
														? new Date(user.createdAt).toLocaleDateString()
														: "N/A"}
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</TableContainer>
						)}
					</Box>
				</TabPanel>
			</Card>

			{/* Product Dialog */}
			<Dialog
				open={productDialogOpen}
				onClose={() => setProductDialogOpen(false)}
				fullWidth
				maxWidth="sm"
			>
				<DialogTitle fontWeight={700}>
					{editingProduct ? "Edit Product" : "Add New Product"}
				</DialogTitle>
				<DialogContent>
					<Stack spacing={2} mt={1}>
						<TextField
							fullWidth
							label="Product Name"
							value={productForm.name}
							onChange={(e) =>
								setProductForm({ ...productForm, name: e.target.value })
							}
						/>
						<TextField
							fullWidth
							label="Description"
							multiline
							rows={3}
							value={productForm.description}
							onChange={(e) =>
								setProductForm({ ...productForm, description: e.target.value })
							}
						/>
						<Grid container spacing={2}>
							<Grid item xs={6}>
								<TextField
									fullWidth
									label="Price"
									type="number"
									value={productForm.price}
									onChange={(e) =>
										setProductForm({
											...productForm,
											price: Number(e.target.value),
										})
									}
								/>
							</Grid>
							<Grid item xs={6}>
								<TextField
									fullWidth
									label="Stock"
									type="number"
									value={productForm.stock}
									onChange={(e) =>
										setProductForm({
											...productForm,
											stock: Number(e.target.value),
										})
									}
								/>
							</Grid>
						</Grid>
						<Grid container spacing={2}>
							<Grid item xs={6}>
								<TextField
									fullWidth
									label="Category"
									value={productForm.category}
									onChange={(e) =>
										setProductForm({
											...productForm,
											category: e.target.value,
										})
									}
								/>
							</Grid>
							<Grid item xs={6}>
								<TextField
									fullWidth
									label="Brand"
									value={productForm.brand}
									onChange={(e) =>
										setProductForm({ ...productForm, brand: e.target.value })
									}
								/>
							</Grid>
						</Grid>
						<TextField
							fullWidth
							label="Image URL"
							value={productForm.imageUrl}
							onChange={(e) =>
								setProductForm({ ...productForm, imageUrl: e.target.value })
							}
						/>
					</Stack>
				</DialogContent>
				<DialogActions sx={{ p: 3 }}>
					<Button onClick={() => setProductDialogOpen(false)} color="inherit">
						Cancel
					</Button>
					<Button
						onClick={handleSaveProduct}
						variant="contained"
						disabled={saveProductMutation.isPending}
					>
						{saveProductMutation.isPending ? "Saving..." : "Save"}
					</Button>
				</DialogActions>
			</Dialog>

			{/* Order Status Dialog */}
			<Dialog
				open={statusDialogOpen}
				onClose={() => setStatusDialogOpen(false)}
				fullWidth
				maxWidth="xs"
			>
				<DialogTitle fontWeight={700}>Update Order Status</DialogTitle>
				<DialogContent>
					{selectedOrder && (
						<Box mt={1}>
							<Typography variant="body2" color="text.secondary" mb={2}>
								Order #{selectedOrder._id.slice(-8).toUpperCase()}
							</Typography>
							<TextField
								fullWidth
								select
								label="Status"
								value={newStatus}
								onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
							>
								{(
									[
										"pending",
										"processing",
										"shipped",
										"delivered",
										"cancelled",
									] as OrderStatus[]
								).map((status) => (
									<MenuItem key={status} value={status}>
										{status.charAt(0).toUpperCase() + status.slice(1)}
									</MenuItem>
								))}
							</TextField>
						</Box>
					)}
				</DialogContent>
				<DialogActions sx={{ p: 3 }}>
					<Button onClick={() => setStatusDialogOpen(false)} color="inherit">
						Cancel
					</Button>
					<Button
						onClick={() =>
							selectedOrder &&
							updateStatusMutation.mutate({
								orderId: selectedOrder._id,
								status: newStatus,
							})
						}
						variant="contained"
						disabled={updateStatusMutation.isPending}
					>
						{updateStatusMutation.isPending ? "Updating..." : "Update"}
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
};
