import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
	Grid,
	Typography,
	Box,
	Button,
	TextField,
	MenuItem,
	InputAdornment,
	Collapse,
	IconButton,
	Stack,
	Select,
	FormControl,
	InputLabel,
	Paper,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import CloseIcon from "@mui/icons-material/Close";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import HeadphonesIcon from "@mui/icons-material/Headphones";
import WatchIcon from "@mui/icons-material/Watch";
import SmartphoneIcon from "@mui/icons-material/Smartphone";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import SupportAgentOutlinedIcon from "@mui/icons-material/SupportAgentOutlined";
import { api } from "../api/axios";
import { IProduct, IPaginatedResponse, ICart, IWishlist } from "../types";
import { ProductCard } from "../components/product/ProductCard";
import { PaginationComponent } from "../components/common/PaginationComponent";
import { ProductSkeletonGrid } from "../components/common/LoadingSkeletons";
import { EmptyState } from "../components/common/EmptyState";
import { useAuth } from "../context/AuthContext";
import { useSearchParams, Link } from "react-router-dom";
import { useDebounce } from "../hooks/useDebounce";
import {
	luxeFilterPanel,
	luxeGlassPanel,
	luxeIconButton,
} from "../theme/luxeStyles";
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
	const searchBarRef = React.useRef<HTMLDivElement>(null);

	const scrollToSearchBar = React.useCallback(() => {
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				searchBarRef.current?.scrollIntoView({
					behavior: "smooth",
					block: "start",
				});
			});
		});
	}, []);

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

	const handlePageChange = (p: number) => {
		setPage(p);
	};

	useEffect(() => {
		if (productsData?.data && productsData.data.length > 0) {
			scrollToSearchBar();
		}
	}, [page, productsData]);

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
				id="home-hero"
				sx={{
					position: "relative",
					overflow: "hidden",
					borderRadius: { xs: 3, md: 5 },
					mb: 4,
					border: "1px solid",
					borderColor: (t) =>
						t.palette.mode === "dark"
							? "rgba(129, 140, 248, 0.22)"
							: "rgba(255, 255, 255, 0.18)",
					background: (t) =>
						t.palette.mode === "light"
							? "linear-gradient(152deg, #1e1b4b 0%, #4338ca 38%, #6d28d9 72%, #581c87 100%)"
							: "linear-gradient(152deg, #070712 0%, #12102a 22%, #1e1b4b 48%, #312e81 78%, #3b0764 100%)",
					boxShadow: (t) =>
						t.palette.mode === "dark"
							? "0 28px 90px -24px rgba(79, 70, 229, 0.55), inset 0 1px 0 rgba(255,255,255,0.07)"
							: "0 28px 70px -20px rgba(67, 56, 202, 0.45), inset 0 1px 0 rgba(255,255,255,0.12)",
					"@keyframes heroFadeUp": {
						from: { opacity: 0, transform: "translateY(22px)" },
						to: { opacity: 1, transform: "translateY(0)" },
					},
					"@keyframes heroFadeIn": {
						from: { opacity: 0 },
						to: { opacity: 1 },
					},
					"@keyframes heroFloat": {
						"0%, 100%": { transform: "translateY(0)" },
						"50%": { transform: "translateY(-12px)" },
					},
					"@keyframes heroFloatDelayed": {
						"0%, 100%": { transform: "translateY(0) rotate(-2deg)" },
						"50%": { transform: "translateY(-8px) rotate(-2deg)" },
					},
					"&::before": {
						content: "''",
						position: "absolute",
						inset: 0,
						background:
							"radial-gradient(ellipse 80% 60% at 12% 40%, rgba(167, 139, 250, 0.35) 0%, transparent 55%), radial-gradient(ellipse 70% 50% at 88% 18%, rgba(236, 72, 153, 0.2) 0%, transparent 50%), radial-gradient(circle at 50% 100%, rgba(99, 102, 241, 0.25) 0%, transparent 45%)",
						pointerEvents: "none",
					},
					"&::after": {
						content: "''",
						position: "absolute",
						inset: 0,
						opacity: 0.35,
						backgroundImage:
							"linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
						backgroundSize: "48px 48px",
						maskImage:
							"radial-gradient(ellipse 85% 75% at 50% 45%, black 20%, transparent 72%)",
						pointerEvents: "none",
					},
				}}
			>
				<Box
					sx={{
						position: "absolute",
						width: { xs: 220, md: 320 },
						height: { xs: 220, md: 320 },
						borderRadius: "50%",
						top: { xs: -80, md: -100 },
						right: { xs: -60, md: -40 },
						background:
							"radial-gradient(circle, rgba(129, 140, 248, 0.45) 0%, transparent 68%)",
						filter: "blur(2px)",
						animation: "heroFadeIn 1.2s ease-out both",
						pointerEvents: "none",
					}}
				/>
				<Box
					sx={{
						position: "absolute",
						width: { xs: 160, md: 240 },
						height: { xs: 160, md: 240 },
						borderRadius: "50%",
						bottom: { xs: -40, md: -60 },
						left: { xs: -30, md: "8%" },
						background:
							"radial-gradient(circle, rgba(192, 132, 252, 0.35) 0%, transparent 70%)",
						filter: "blur(4px)",
						pointerEvents: "none",
					}}
				/>

				<Grid
					container
					spacing={{ xs: 4, md: 3, lg: 4 }}
					alignItems="center"
					sx={{
						position: "relative",
						zIndex: 1,
						py: { xs: 5, sm: 6, md: 7, lg: 8 },
						px: { xs: 2.5, sm: 3.5, md: 5, lg: 6 },
					}}
				>
					<Grid
						item
						xs={12}
						md={6}
						lg={6}
						sx={{
							textAlign: { xs: "center", md: "left" },
							animation: "heroFadeUp 0.75s cubic-bezier(0.22, 1, 0.36, 1) both",
						}}
					>
						<Typography
							component="p"
							variant="overline"
							sx={{
								display: "inline-block",
								mb: 2,
								px: 1.75,
								py: 0.65,
								borderRadius: 999,
								fontSize: "0.68rem",
								fontWeight: 700,
								letterSpacing: "0.14em",
								color: "rgba(255,255,255,0.92)",
								bgcolor: "rgba(255,255,255,0.08)",
								border: "1px solid rgba(255,255,255,0.14)",
								backdropFilter: "blur(12px)",
							}}
						>
							LUXE STORE · CURATED TECH
						</Typography>

						<Typography
							component="h1"
							variant="h2"
							sx={{
								fontWeight: 800,
								color: "#fff",
								fontSize: {
									xs: "clamp(1.85rem, 5.5vw, 2.25rem)",
									sm: "clamp(2.25rem, 4vw, 2.75rem)",
									md: "clamp(2.35rem, 3.2vw, 3.15rem)",
									lg: "3.35rem",
								},
								lineHeight: { xs: 1.12, md: 1.08 },
								letterSpacing: "-0.04em",
								mb: 2,
								maxWidth: { md: "14ch", lg: "13ch" },
								mx: { xs: "auto", md: 0 },
							}}
						>
							Discover{" "}
							<Box
								component="span"
								sx={{
									background:
										"linear-gradient(135deg, #e9d5ff 0%, #c4b5fd 45%, #f9a8d4 100%)",
									WebkitBackgroundClip: "text",
									WebkitTextFillColor: "transparent",
									backgroundClip: "text",
								}}
							>
								Premium Tech
							</Box>
						</Typography>

						<Typography
							variant="body1"
							sx={{
								color: "rgba(255,255,255,0.78)",
								maxWidth: { xs: 480, md: 440, lg: 480 },
								mx: { xs: "auto", md: 0 },
								mb: 3.5,
								fontSize: { xs: "1rem", md: "1.0625rem" },
								lineHeight: 1.65,
								fontWeight: 400,
							}}
						>
							Curated selection of the finest electronics, gadgets, and
							accessories — crafted for a refined, modern lifestyle.
						</Typography>

						<Stack
							direction={{ xs: "column", sm: "row" }}
							spacing={1.5}
							justifyContent={{ xs: "center", md: "flex-start" }}
							alignItems={{ xs: "stretch", sm: "center" }}
							sx={{ mb: { xs: 3.5, md: 4 } }}
						>
							<Button
								variant="contained"
								size="large"
								endIcon={<ArrowForwardIcon />}
								onClick={() => {
									document
										.getElementById("home-hero")
										?.nextElementSibling?.scrollIntoView({
											behavior: "smooth",
											block: "start",
										});
								}}
								sx={{
									py: 1.35,
									px: 3,
									borderRadius: 2.5,
									fontSize: "0.95rem",
									fontWeight: 700,
									bgcolor: "#fff",
									color: "#312e81",
									boxShadow:
										"0 12px 32px -8px rgba(15, 23, 42, 0.45), 0 0 0 1px rgba(255,255,255,0.5) inset",
									"&:hover": {
										bgcolor: "#f8fafc",
										boxShadow:
											"0 16px 40px -10px rgba(15, 23, 42, 0.5), 0 0 0 1px rgba(255,255,255,0.6) inset",
										transform: "translateY(-2px)",
									},
									transition:
										"transform 0.25s ease, box-shadow 0.25s ease, background-color 0.2s ease",
								}}
							>
								Explore Collection
							</Button>
							<Button
								variant="outlined"
								size="large"
								component={Link}
								to="/cart"
								sx={{
									py: 1.35,
									px: 3,
									borderRadius: 2.5,
									fontSize: "0.95rem",
									fontWeight: 600,
									color: "#fff",
									borderColor: "rgba(255,255,255,0.35)",
									bgcolor: "rgba(255,255,255,0.06)",
									backdropFilter: "blur(10px)",
									"&:hover": {
										borderColor: "rgba(255,255,255,0.55)",
										bgcolor: "rgba(255,255,255,0.12)",
										transform: "translateY(-2px)",
									},
									transition:
										"transform 0.25s ease, border-color 0.25s ease, background-color 0.2s ease",
								}}
							>
								View Cart
							</Button>
						</Stack>

						<Stack
							direction={{ xs: "column", sm: "row" }}
							spacing={1.25}
							justifyContent={{ xs: "center", md: "flex-start" }}
							flexWrap="wrap"
							useFlexGap
						>
							{[
								{
									label: "Free Shipping",
									desc: "On orders $50+",
									Icon: LocalShippingOutlinedIcon,
								},
								{
									label: "2-Year Warranty",
									desc: "On all products",
									Icon: VerifiedOutlinedIcon,
								},
								{
									label: "24/7 Support",
									desc: "Dedicated team",
									Icon: SupportAgentOutlinedIcon,
								},
							].map((item, index) => (
								<Box
									key={item.label}
									sx={{
										display: "flex",
										alignItems: "center",
										gap: 1.25,
										px: 2,
										py: 1.25,
										borderRadius: 2.5,
										bgcolor: "rgba(255,255,255,0.07)",
										backdropFilter: "blur(14px)",
										border: "1px solid rgba(255,255,255,0.12)",
										boxShadow: "0 8px 24px -12px rgba(0,0,0,0.35)",
										transition:
											"transform 0.25s ease, background-color 0.25s ease, border-color 0.25s ease",
										animation: `heroFadeUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${0.15 + index * 0.08}s both`,
										"&:hover": {
											transform: "translateY(-3px)",
											bgcolor: "rgba(255,255,255,0.11)",
											borderColor: "rgba(255,255,255,0.22)",
										},
									}}
								>
									<Box
										sx={{
											width: 36,
											height: 36,
											borderRadius: 2,
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											bgcolor: "rgba(129, 140, 248, 0.25)",
											color: "#e0e7ff",
											flexShrink: 0,
										}}
									>
										<item.Icon sx={{ fontSize: 20 }} />
									</Box>
									<Box sx={{ textAlign: "left", minWidth: 0 }}>
										<Typography
											variant="subtitle2"
											fontWeight={700}
											color="#fff"
											fontSize="0.8125rem"
											lineHeight={1.3}
										>
											{item.label}
										</Typography>
										<Typography
											variant="caption"
											color="rgba(255,255,255,0.65)"
											fontSize="0.72rem"
											lineHeight={1.35}
										>
											{item.desc}
										</Typography>
									</Box>
								</Box>
							))}
						</Stack>
					</Grid>

					<Grid
						item
						xs={12}
						md={6}
						lg={6}
						sx={{
							display: "flex",
							justifyContent: { xs: "center", md: "flex-end" },
							animation:
								"heroFadeUp 0.85s cubic-bezier(0.22, 1, 0.36, 1) 0.12s both",
						}}
					>
						<Box
							sx={{
								position: "relative",
								width: "100%",
								maxWidth: { xs: 340, sm: 380, md: 420 },
								minHeight: { xs: 300, sm: 340, md: 380 },
								mx: { xs: "auto", md: 0 },
							}}
						>
							<Box
								sx={{
									position: "absolute",
									inset: "8% 5%",
									borderRadius: 4,
									background:
										"linear-gradient(145deg, rgba(129, 140, 248, 0.35) 0%, rgba(168, 85, 247, 0.15) 100%)",
									filter: "blur(40px)",
									opacity: 0.9,
									pointerEvents: "none",
								}}
							/>

							<Box
								sx={{
									position: "relative",
									borderRadius: 4,
									p: { xs: 2.5, sm: 3 },
									background:
										"linear-gradient(160deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.04) 100%)",
									border: "1px solid rgba(255,255,255,0.18)",
									backdropFilter: "blur(20px)",
									boxShadow:
										"0 24px 48px -16px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255,255,255,0.2)",
									animation: "heroFloat 5.5s ease-in-out infinite",
									transition: "transform 0.35s ease, box-shadow 0.35s ease",
									"&:hover": {
										transform: "translateY(-4px) scale(1.01)",
										boxShadow:
											"0 32px 56px -18px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.25)",
									},
								}}
							>
								<Typography
									variant="overline"
									sx={{
										color: "rgba(255,255,255,0.55)",
										letterSpacing: "0.12em",
										fontSize: "0.65rem",
										fontWeight: 700,
									}}
								>
									Featured picks
								</Typography>
								<Typography
									variant="h6"
									sx={{
										color: "#fff",
										fontWeight: 700,
										letterSpacing: "-0.02em",
										mb: 2.5,
										fontSize: { xs: "1.1rem", sm: "1.25rem" },
									}}
								>
									The Luxe Edit
								</Typography>

								<Stack spacing={1.5}>
									{[
										{
											Icon: HeadphonesIcon,
											name: "Studio Audio",
											tag: "New",
											gradient:
												"linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
										},
										{
											Icon: WatchIcon,
											name: "Wearables",
											tag: "Trending",
											gradient:
												"linear-gradient(135deg, #7c3aed 0%, #c026d3 100%)",
										},
										{
											Icon: SmartphoneIcon,
											name: "Smart Devices",
											tag: "Essentials",
											gradient:
												"linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
										},
									].map((product) => (
										<Box
											key={product.name}
											sx={{
												display: "flex",
												alignItems: "center",
												gap: 1.75,
												p: 1.5,
												borderRadius: 2.5,
												bgcolor: "rgba(15, 23, 42, 0.35)",
												border: "1px solid rgba(255,255,255,0.08)",
												transition:
													"background-color 0.25s ease, border-color 0.25s ease, transform 0.25s ease",
												"&:hover": {
													bgcolor: "rgba(15, 23, 42, 0.5)",
													borderColor: "rgba(255,255,255,0.16)",
													transform: "translateX(4px)",
												},
											}}
										>
											<Box
												sx={{
													width: 48,
													height: 48,
													borderRadius: 2,
													background: product.gradient,
													display: "flex",
													alignItems: "center",
													justifyContent: "center",
													color: "#fff",
													boxShadow: "0 8px 20px -6px rgba(79, 70, 229, 0.65)",
													flexShrink: 0,
												}}
											>
												<product.Icon sx={{ fontSize: 26 }} />
											</Box>
											<Box sx={{ flex: 1, minWidth: 0 }}>
												<Typography
													variant="subtitle2"
													fontWeight={700}
													color="#fff"
													fontSize="0.875rem"
												>
													{product.name}
												</Typography>
												<Typography
													variant="caption"
													sx={{ color: "rgba(255,255,255,0.55)" }}
												>
													Premium selection
												</Typography>
											</Box>
											<Typography
												variant="caption"
												sx={{
													px: 1.25,
													py: 0.35,
													borderRadius: 999,
													fontWeight: 700,
													fontSize: "0.65rem",
													letterSpacing: "0.04em",
													color: "#e9d5ff",
													bgcolor: "rgba(129, 140, 248, 0.2)",
													border: "1px solid rgba(167, 139, 250, 0.35)",
													flexShrink: 0,
												}}
											>
												{product.tag}
											</Typography>
										</Box>
									))}
								</Stack>
							</Box>

							<Box
								sx={{
									display: { xs: "none", sm: "block" },
									position: "absolute",
									top: -8,
									right: -4,
									px: 1.75,
									py: 1,
									borderRadius: 2,
									bgcolor: "rgba(255,255,255,0.95)",
									color: "#312e81",
									boxShadow: "0 12px 28px -8px rgba(0,0,0,0.35)",
									animation: "heroFloatDelayed 4.5s ease-in-out infinite",
								}}
							>
								<Typography
									variant="caption"
									fontWeight={800}
									fontSize="0.7rem"
								>
									★ 4.9
								</Typography>
								<Typography
									variant="caption"
									display="block"
									color="text.secondary"
									fontSize="0.65rem"
								>
									Luxe rated
								</Typography>
							</Box>
						</Box>
					</Grid>
				</Grid>
			</Box>

			{/* Search & Filter */}
			<Box ref={searchBarRef} sx={{ mb: 4 }}>
				<Paper
					elevation={0}
					sx={{
						...luxeGlassPanel,
						p: { xs: 1.5, sm: 2 },
						borderRadius: 4,
					}}
				>
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
							sx={{
								"& .MuiOutlinedInput-root": {
									bgcolor: "background.paper",
									minHeight: 48,
								},
							}}
						/>
						<Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
							<IconButton
								onClick={() => setShowFilters(!showFilters)}
								color={showFilters ? "primary" : "default"}
								size="small"
								sx={{
									...luxeIconButton,
									...(showFilters
										? {
												borderColor: "primary.main",
												bgcolor: (t: any) =>
													t.palette.mode === "dark"
														? "rgba(129, 140, 248, 0.12)"
														: "rgba(79, 70, 229, 0.08)",
											}
										: {}),
								}}
							>
								<FilterListIcon />
							</IconButton>
							{hasActiveFilters && (
								<IconButton
									onClick={resetFilters}
									color="error"
									size="small"
									sx={luxeIconButton}
								>
									<CloseIcon />
								</IconButton>
							)}
						</Stack>
					</Stack>

					<Collapse in={showFilters}>
						<Box sx={luxeFilterPanel}>
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
				</Paper>
			</Box>

			{/* Products */}
			{isLoading ? (
				<ProductSkeletonGrid count={6} />
			) : products.length > 0 ? (
				<>
					<Grid container spacing={2.5}>
						{products.map((product) => (
							<Grid
								item
								xs={12}
								sm={6}
								md={4}
								lg={3}
								key={product._id}
							>
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
							onPageChange={handlePageChange}
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
