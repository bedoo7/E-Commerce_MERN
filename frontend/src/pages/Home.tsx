import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
	Grid,
	Typography,
	Box,
	TextField,
	MenuItem,
	InputAdornment,
	Collapse,
	IconButton,
	Stack,
	Select,
	FormControl,
	InputLabel,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import CloseIcon from "@mui/icons-material/Close";
import { api } from "../api/axios";
import { IProduct, IPaginatedResponse, ICart } from "../types";
import { ProductCard } from "../components/product/ProductCard";
import { PaginationComponent } from "../components/common/PaginationComponent";
import { ProductSkeletonGrid } from "../components/common/LoadingSkeletons";
import { EmptyState } from "../components/common/EmptyState";
import { useAuth } from "../context/AuthContext";
import { useDebounce } from "../hooks/useDebounce";
import toast from "react-hot-toast";

export const Home: React.FC = () => {
	const { isAuthenticated } = useAuth();
	const queryClient = useQueryClient();

	// Filter states
	const [search, setSearch] = useState("");
	const [category, setCategory] = useState("All");
	const [brand, setBrand] = useState("All");
	const [sortBy, setSortBy] = useState("createdAt");
	const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
	const [minPrice, setMinPrice] = useState("");
	const [maxPrice, setMaxPrice] = useState("");
	const [inStock, setInStock] = useState(false);
	const [page, setPage] = useState(1);
	const [showFilters, setShowFilters] = useState(false);
	const limit = 12;

	const debouncedSearch = useDebounce(search, 400);

	// Fetch products with server-side pagination & filters
	const {
		data: productsData,
		isLoading,
		error,
	} = useQuery<IPaginatedResponse<IProduct>>({
		queryKey: [
			"products",
			page,
			debouncedSearch,
			category,
			brand,
			sortBy,
			sortOrder,
			minPrice,
			maxPrice,
			inStock,
		],
		queryFn: async () => {
			const params = new URLSearchParams();
			params.set("page", String(page));
			params.set("limit", String(limit));
			if (debouncedSearch) params.set("search", debouncedSearch);
			if (category !== "All") params.set("category", category);
			if (brand !== "All") params.set("brand", brand);
			if (minPrice) params.set("minPrice", minPrice);
			if (maxPrice) params.set("maxPrice", maxPrice);
			if (inStock) params.set("inStock", "true");
			params.set("sortBy", sortBy);
			params.set("sortOrder", sortOrder);

			const res = await api.get<IPaginatedResponse<IProduct>>(
				`/product?${params.toString()}`,
			);
			return res.data;
		},
	});

	// Fetch categories & brands for filter dropdowns
	const { data: categories = [] } = useQuery<string[]>({
		queryKey: ["categories"],
		queryFn: async () => {
			const res = await api.get<string[]>("/product/categories");
			return res.data;
		},
		staleTime: 1000 * 60 * 10,
	});

	const { data: brands = [] } = useQuery<string[]>({
		queryKey: ["brands"],
		queryFn: async () => {
			const res = await api.get<string[]>("/product/brands");
			return res.data;
		},
		staleTime: 1000 * 60 * 10,
	});

	// Add to cart mutation
	const addToCartMutation = useMutation({
		mutationFn: async ({
			productId,
			quantity,
		}: {
			productId: string;
			quantity: number;
		}) => {
			const res = await api.post("/cart/items", { productId, quantity });
			return res.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["cart"] });
			toast.success("Added to cart!");
		},
		onError: (err: any) => {
			toast.error(err.message || "Failed to add to cart");
		},
	});

	// Update quantity mutation
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

	// Remove item mutation
	const removeItemMutation = useMutation({
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

	// Fetch active cart for inline quantity controls
	const { data: cart } = useQuery<ICart>({
		queryKey: ["cart"],
		queryFn: async () => {
			const res = await api.get<ICart>("/cart");
			return res.data;
		},
		enabled: isAuthenticated,
		staleTime: 1000 * 30,
	});

	const handleAddToCart = (productId: string) => {
		if (!isAuthenticated) {
			toast.error("Please log in to add items to your cart");
			return;
		}
		addToCartMutation.mutate({ productId, quantity: 1 });
	};

	const handleUpdateQuantity = (productId: string, quantity: number) => {
		updateQuantityMutation.mutate({ productId, quantity });
	};

	const handleRemoveItem = (productId: string) => {
		removeItemMutation.mutate(productId);
	};

	const products = productsData?.data ?? [];
	const pagination = productsData?.pagination;

	// Build a map of productId -> quantity from cart for inline controls
	const cartItemMap: Record<string, number> = {};
	if (cart?.items) {
		for (const item of cart.items) {
			const productId =
				typeof item.product === "string" ? item.product : item.product._id;
			cartItemMap[productId] = item.quantity;
		}
	}

	const resetFilters = () => {
		setSearch("");
		setCategory("All");
		setBrand("All");
		setSortBy("createdAt");
		setSortOrder("desc");
		setMinPrice("");
		setMaxPrice("");
		setInStock(false);
		setPage(1);
	};

	const hasActiveFilters =
		search ||
		category !== "All" ||
		brand !== "All" ||
		minPrice ||
		maxPrice ||
		inStock;

	if (error) {
		return (
			<Box textAlign="center" py={5}>
				<Typography color="error" variant="h6">
					Failed to load products. Please try again later.
				</Typography>
			</Box>
		);
	}

	return (
		<Box>
			{/* Premium Hero Section */}
			<Box
				sx={{
					position: "relative",
					overflow: "hidden",
					borderRadius: 4,
					mb: 5,
					background: (theme) =>
						theme.palette.mode === "light"
							? "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #ec4899 100%)"
							: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #831843 100%)",
					"&::before": {
						content: '""',
						position: "absolute",
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						background:
							"radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.08) 0%, transparent 50%)",
					},
				}}
			>
				<Box
					sx={{
						position: "relative",
						zIndex: 1,
						py: { xs: 6, md: 8 },
						px: { xs: 3, md: 6 },
						textAlign: "center",
					}}
				>
					<Typography
						variant="h2"
						fontWeight={800}
						color="#fff"
						sx={{
							fontSize: { xs: "2rem", sm: "2.5rem", md: "3.5rem" },
							mb: 2,
							letterSpacing: "-0.03em",
						}}
					>
						Discover Premium Tech
					</Typography>
					<Typography
						variant="h6"
						sx={{
							color: "rgba(255,255,255,0.85)",
							maxWidth: 600,
							mx: "auto",
							mb: 4,
							fontSize: { xs: "1rem", md: "1.2rem" },
							fontWeight: 400,
						}}
					>
						Curated selection of the finest electronics, gadgets, and
						accessories — engineered for excellence.
					</Typography>
					<Box
						sx={{
							display: "flex",
							gap: 2,
							justifyContent: "center",
							flexWrap: "wrap",
						}}
					>
						{[
							{ label: "Free Shipping", desc: "On orders $50+" },
							{ label: "2-Year Warranty", desc: "On all products" },
							{ label: "24/7 Support", desc: "Dedicated team" },
						].map((item) => (
							<Box
								key={item.label}
								sx={{
									px: 3,
									py: 1.5,
									borderRadius: 3,
									bgcolor: "rgba(255,255,255,0.12)",
									backdropFilter: "blur(10px)",
									border: "1px solid rgba(255,255,255,0.2)",
									textAlign: "center",
								}}
							>
								<Typography variant="subtitle2" fontWeight={700} color="#fff">
									{item.label}
								</Typography>
								<Typography variant="caption" color="rgba(255,255,255,0.7)">
									{item.desc}
								</Typography>
							</Box>
						))}
					</Box>
				</Box>
			</Box>

			{/* Search and Filter Controls */}
			<Box mb={4}>
				<Stack
					direction={{ xs: "column", sm: "row" }}
					spacing={2}
					alignItems="center"
				>
					<TextField
						fullWidth
						placeholder="Search products, brands, categories..."
						value={search}
						onChange={(e) => {
							setSearch(e.target.value);
							setPage(1);
						}}
						InputProps={{
							startAdornment: (
								<InputAdornment position="start">
									<SearchIcon />
								</InputAdornment>
							),
						}}
						sx={{
							"& .MuiOutlinedInput-root": {
								bgcolor: "background.paper",
							},
						}}
					/>
					<Stack direction="row" spacing={1}>
						<IconButton
							onClick={() => setShowFilters(!showFilters)}
							color={showFilters ? "primary" : "default"}
							sx={{
								border: "1px solid",
								borderColor: "divider",
								borderRadius: 2,
							}}
						>
							<FilterListIcon />
						</IconButton>
						{hasActiveFilters && (
							<IconButton
								onClick={resetFilters}
								color="error"
								sx={{
									border: "1px solid",
									borderColor: "divider",
									borderRadius: 2,
								}}
							>
								<CloseIcon />
							</IconButton>
						)}
					</Stack>
				</Stack>

				<Collapse in={showFilters}>
					<Box
						sx={{
							mt: 2,
							p: 3,
							borderRadius: 3,
							border: "1px solid",
							borderColor: "divider",
							bgcolor: "background.paper",
						}}
					>
						<Grid container spacing={2}>
							<Grid item xs={6} sm={3}>
								<TextField
									fullWidth
									select
									label="Category"
									value={category}
									onChange={(e) => {
										setCategory(e.target.value);
										setPage(1);
									}}
									size="small"
								>
									<MenuItem value="All">All Categories</MenuItem>
									{categories.map((cat) => (
										<MenuItem key={cat} value={cat}>
											{cat}
										</MenuItem>
									))}
								</TextField>
							</Grid>
							<Grid item xs={6} sm={3}>
								<TextField
									fullWidth
									select
									label="Brand"
									value={brand}
									onChange={(e) => {
										setBrand(e.target.value);
										setPage(1);
									}}
									size="small"
								>
									<MenuItem value="All">All Brands</MenuItem>
									{brands.map((b) => (
										<MenuItem key={b} value={b}>
											{b}
										</MenuItem>
									))}
								</TextField>
							</Grid>
							<Grid item xs={6} sm={2}>
								<TextField
									fullWidth
									label="Min Price"
									value={minPrice}
									onChange={(e) => {
										setMinPrice(e.target.value);
										setPage(1);
									}}
									size="small"
									type="number"
								/>
							</Grid>
							<Grid item xs={6} sm={2}>
								<TextField
									fullWidth
									label="Max Price"
									value={maxPrice}
									onChange={(e) => {
										setMaxPrice(e.target.value);
										setPage(1);
									}}
									size="small"
									type="number"
								/>
							</Grid>
							<Grid item xs={6} sm={2}>
								<FormControl fullWidth size="small">
									<InputLabel>Sort By</InputLabel>
									<Select
										value={sortBy}
										label="Sort By"
										onChange={(e) => {
											setSortBy(e.target.value);
											setPage(1);
										}}
									>
										<MenuItem value="createdAt">Newest</MenuItem>
										<MenuItem value="price">Price</MenuItem>
										<MenuItem value="name">Name</MenuItem>
										<MenuItem value="stock">Stock</MenuItem>
									</Select>
								</FormControl>
							</Grid>
							<Grid item xs={6} sm={2}>
								<FormControl fullWidth size="small">
									<InputLabel>Order</InputLabel>
									<Select
										value={sortOrder}
										label="Order"
										onChange={(e) => {
											setSortOrder(e.target.value as "asc" | "desc");
											setPage(1);
										}}
									>
										<MenuItem value="desc">High to Low</MenuItem>
										<MenuItem value="asc">Low to High</MenuItem>
									</Select>
								</FormControl>
							</Grid>
							<Grid item xs={12} sm={6}>
								<FormControl fullWidth size="small">
									<InputLabel>Stock</InputLabel>
									<Select
										value={inStock ? "instock" : "all"}
										label="Stock"
										onChange={(e) => {
											setInStock(e.target.value === "instock");
											setPage(1);
										}}
									>
										<MenuItem value="all">All Items</MenuItem>
										<MenuItem value="instock">In Stock Only</MenuItem>
									</Select>
								</FormControl>
							</Grid>
						</Grid>
					</Box>
				</Collapse>
			</Box>

			{/* Products Grid */}
			{isLoading ? (
				<ProductSkeletonGrid count={6} />
			) : products.length > 0 ? (
				<>
					<Grid container spacing={3}>
						{products.map((product) => (
							<Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
								<ProductCard
									product={product}
									onAddToCart={handleAddToCart}
									onUpdateQuantity={handleUpdateQuantity}
									onRemoveItem={handleRemoveItem}
									cartQuantity={cartItemMap[product._id]}
									isAddToCartPending={addToCartMutation.isPending}
									isUpdatePending={
										updateQuantityMutation.isPending ||
										removeItemMutation.isPending
									}
								/>
							</Grid>
						))}
					</Grid>

					{pagination && (
						<PaginationComponent
							pagination={pagination}
							onPageChange={setPage}
							onLimitChange={() => {}}
						/>
					)}
				</>
			) : (
				<EmptyState
					title="No products found"
					description={
						hasActiveFilters
							? "Try adjusting your filters or search criteria."
							: "No products are available at the moment."
					}
					actionText={hasActiveFilters ? "Clear Filters" : undefined}
					onAction={hasActiveFilters ? resetFilters : undefined}
				/>
			)}
		</Box>
	);
};
