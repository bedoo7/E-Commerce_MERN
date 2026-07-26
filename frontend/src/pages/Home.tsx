import React, { useState, useEffect } from "react";
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
import { IProduct, IPaginatedResponse, ICart, IWishlist } from "../types";
import { ProductCard } from "../components/product/ProductCard";
import { PaginationComponent } from "../components/common/PaginationComponent";
import { ProductSkeletonGrid } from "../components/common/LoadingSkeletons";
import { EmptyState } from "../components/common/EmptyState";
import { useAuth } from "../context/AuthContext";
import { useSearchParams } from "react-router-dom";
import { useDebounce } from "../hooks/useDebounce";
import toast from "react-hot-toast";

const isProductWithId = (value: unknown): value is { _id: string } => {
	return (
		typeof value === "object" &&
		value !== null &&
		"_id" in value &&
		typeof (value as { _id?: unknown })._id === "string"
	);
};

const getProductId = (
	product: IProduct | string | null | undefined,
): string | null => {
	if (typeof product === "string") {
		return product;
	}

	if (isProductWithId(product)) {
		return product._id;
	}

	return null;
};

export const Home: React.FC = () => {
	const [searchParams] = useSearchParams();
	const { isAuthenticated } = useAuth();
	const queryClient = useQueryClient();
	const [search, setSearch] = useState("");
	const [category, setCategory] = useState("All");
	const [brand, setBrand] = useState("All");
	const [sortBy, setSortBy] = useState("createdAt");
	const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
	const [minPrice, setMinPrice] = useState("");
	const [maxPrice, setMaxPrice] = useState("");
	const [inStock, setInStock] = useState(false);
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(12);
	const [showFilters, setShowFilters] = useState(false);
	const debouncedSearch = useDebounce(search, 400);

	// Keep the local filter state in sync with footer navigation links
	useEffect(() => {
		const cat = searchParams.get("category");
		const brandParam = searchParams.get("brand");

		setCategory(cat && cat !== "All" ? cat : "All");
		setBrand(brandParam && brandParam !== "All" ? brandParam : "All");
		setPage(1);
		setShowFilters(Boolean(cat || brandParam));
	}, [searchParams]);

	const {
		data: productsData,
		isLoading,
		error,
	} = useQuery<IPaginatedResponse<IProduct>>({
		queryKey: [
			"products",
			page,
			limit,
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
				"/product?" + params.toString(),
			);
			return res.data;
		},
	});

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

	const addToCartMutation = useMutation({
		mutationFn: async (input: { productId: string; quantity: number }) => {
			const res = await api.post("/cart/items", {
				productId: input.productId,
				quantity: input.quantity,
			});
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

	const updateQuantityMutation = useMutation({
		mutationFn: async (input: { productId: string; quantity: number }) => {
			const res = await api.put("/cart/items", {
				productId: input.productId,
				quantity: input.quantity,
			});
			return res.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["cart"] });
		},
		onError: (err: any) => {
			toast.error(err.message || "Failed to update quantity");
		},
	});

	const removeItemMutation = useMutation({
		mutationFn: async (productId: string) => {
			const res = await api.delete("/cart/items/" + productId);
			return res.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["cart"] });
			toast.success("Item removed");
		},
		onError: (err: any) => {
			toast.error(err.message || "Failed to remove item");
		},
	});

	const { data: cart } = useQuery<ICart>({
		queryKey: ["cart"],
		queryFn: async () => {
			const res = await api.get<ICart>("/cart");
			return res.data;
		},
		enabled: isAuthenticated,
		staleTime: 1000 * 30,
	});

	const { data: wishlistData } = useQuery<IWishlist>({
		queryKey: ["wishlist"],
		queryFn: async () => {
			const res = await api.get<IWishlist>("/wishlist");
			return res.data;
		},
		enabled: isAuthenticated,
		staleTime: 1000 * 30,
	});

	const wishlistProductIds = new Set<string>();
	for (const item of wishlistData?.items ?? []) {
		const productId = getProductId(item.product);
		if (productId) {
			wishlistProductIds.add(productId);
		}
	}

	const handleAddToCart = (productId: string) => {
		if (!isAuthenticated) {
			toast.error("Please log in first");
			return;
		}
		addToCartMutation.mutate({ productId, quantity: 1 });
	};
	const handleUpdateQuantity = (productId: string, quantity: number) =>
		updateQuantityMutation.mutate({ productId, quantity });
	const handleRemoveItem = (productId: string) =>
		removeItemMutation.mutate(productId);

	const products = productsData?.data ?? [];
	const pagination = productsData?.pagination;

	const cartItemMap: Record<string, number> = {};
	if (cart?.items) {
		for (const item of cart.items) {
			const pid = getProductId(item.product);
			if (pid) {
				cartItemMap[pid] = item.quantity;
			}
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
					Failed to load products.
				</Typography>
			</Box>
		);
	}

	return (
		<Box>
			{/* Hero */}
			<Box
				sx={{
					position: "relative",
					overflow: "hidden",
					borderRadius: 4,
					mb: 4,
					background: (t: any) =>
						t.palette.mode === "light"
							? "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #ec4899 100%)"
							: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #831843 100%)",
					"&::before": {
						content: "''",
						position: "absolute",
						inset: 0,
						background:
							"radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.08) 0%, transparent 50%)",
					},
				}}
			>
				<Box
					sx={{
						position: "relative",
						zIndex: 1,
						py: { xs: 5, md: 7 },
						px: { xs: 3, md: 6 },
						textAlign: "center",
					}}
				>
					<Typography
						variant="h2"
						fontWeight={800}
						color="#fff"
						sx={{
							fontSize: { xs: "1.8rem", md: "3rem" },
							mb: 1.5,
							letterSpacing: "-0.03em",
						}}
					>
						Discover Premium Tech
					</Typography>
					<Typography
						variant="h6"
						sx={{
							color: "rgba(255,255,255,0.85)",
							maxWidth: 560,
							mx: "auto",
							mb: 3,
							fontWeight: 400,
						}}
					>
						Curated selection of the finest electronics, gadgets, and
						accessories.
					</Typography>
					<Stack
						direction="row"
						spacing={1.5}
						justifyContent="center"
						flexWrap="wrap"
					>
						{[
							{ label: "Free Shipping", desc: "On orders $50+" },
							{ label: "2-Year Warranty", desc: "On all products" },
							{ label: "24/7 Support", desc: "Dedicated team" },
						].map((item) => (
							<Box
								key={item.label}
								sx={{
									px: 2.5,
									py: 1.2,
									borderRadius: 2.5,
									bgcolor: "rgba(255,255,255,0.12)",
									backdropFilter: "blur(10px)",
									border: "1px solid rgba(255,255,255,0.2)",
									textAlign: "center",
								}}
							>
								<Typography
									variant="subtitle2"
									fontWeight={700}
									color="#fff"
									fontSize="0.85rem"
								>
									{item.label}
								</Typography>
								<Typography
									variant="caption"
									color="rgba(255,255,255,0.7)"
									fontSize="0.72rem"
								>
									{item.desc}
								</Typography>
							</Box>
						))}
					</Stack>
				</Box>
			</Box>

			{/* Search & Filter */}
			<Box sx={{ mb: 4 }}>
				<Stack
					direction={{ xs: "column", sm: "row" }}
					spacing={2}
					alignItems="center"
				>
					<TextField
						fullWidth
						placeholder="Search products..."
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
						size="small"
						sx={{ "& .MuiOutlinedInput-root": { bgcolor: "background.paper" } }}
					/>
					<Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
						<IconButton
							onClick={() => setShowFilters(!showFilters)}
							color={showFilters ? "primary" : "default"}
							size="small"
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
								size="small"
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
							p: 2.5,
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
									<MenuItem value="All">All</MenuItem>
									{categories.map((c) => (
										<MenuItem key={c} value={c}>
											{c}
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
									<MenuItem value="All">All</MenuItem>
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
									label="Min $"
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
									label="Max $"
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
									<InputLabel>Sort</InputLabel>
									<Select
										value={sortBy}
										label="Sort"
										onChange={(e) => {
											setSortBy(e.target.value);
											setPage(1);
										}}
									>
										<MenuItem value="createdAt">Newest</MenuItem>
										<MenuItem value="price">Price</MenuItem>
										<MenuItem value="name">Name</MenuItem>
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
										<MenuItem value="desc">High-Low</MenuItem>
										<MenuItem value="asc">Low-High</MenuItem>
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

			{/* Products */}
			{isLoading ? (
				<ProductSkeletonGrid count={6} />
			) : products.length > 0 ? (
				<>
					<Grid container spacing={2.5}>
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
									inWishlist={wishlistProductIds.has(product._id)}
								/>
							</Grid>
						))}
					</Grid>
					{pagination && (
						<PaginationComponent
							pagination={pagination}
							onPageChange={setPage}
							onLimitChange={(l) => {
								setLimit(l);
								setPage(1);
							}}
						/>
					)}
				</>
			) : (
				<EmptyState
					title="No products found"
					description={
						hasActiveFilters
							? "Try adjusting filters."
							: "No products available."
					}
				/>
			)}
		</Box>
	);
};
