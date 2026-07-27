import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
	Box,
	Typography,
	Button,
	Card,
	CardMedia,
	CardContent,
	CardActions,
	Grid,
	Chip,
	CircularProgress,
	Stack,
	IconButton,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import DeleteIcon from "@mui/icons-material/Delete";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import { api } from "../api/axios";
import { IProduct, IWishlist, IWishlistItem } from "../types";
import { EmptyState } from "../components/common/EmptyState";
import { ProductSkeletonGrid } from "../components/common/LoadingSkeletons";
import toast from "react-hot-toast";

const isProductWithId = (value: unknown): value is IProduct => {
	return (
		typeof value === "object" &&
		value !== null &&
		"_id" in value &&
		typeof (value as { _id?: unknown })._id === "string"
	);
};

export const Wishlist: React.FC = () => {
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const { data: wishlist, isLoading } = useQuery<IWishlist>({
		queryKey: ["wishlist"],
		queryFn: async () => {
			const res = await api.get<IWishlist>("/wishlist");
			return res.data;
		},
	});

	const removeMutation = useMutation({
		mutationFn: async (productId: string) => {
			const res = await api.delete(`/wishlist/${productId}`);
			return res.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["wishlist"] });
			toast.success("Removed from wishlist");
		},
		onError: (err: any) => {
			toast.error(err.message || "Failed to remove");
		},
	});

	const addToCartMutation = useMutation({
		mutationFn: async (productId: string) => {
			const res = await api.post("/cart/items", {
				productId,
				quantity: 1,
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

	if (isLoading) {
		return (
			<Box>
				<Typography variant="h4" fontWeight={800} gutterBottom>
					My Wishlist
				</Typography>
				<ProductSkeletonGrid count={4} />
			</Box>
		);
	}

	const items = (wishlist?.items ?? []).filter(
		(item): item is IWishlistItem & { product: IProduct } =>
			isProductWithId(item.product),
	);

	return (
		<Box>
			<Box
				display="flex"
				alignItems="center"
				justifyContent="space-between"
				mb={4}
			>
				<Box>
					<Typography variant="h4" fontWeight={800} gutterBottom>
						My Wishlist
					</Typography>
					<Typography variant="body1" color="text.secondary">
						{items.length} item{items.length !== 1 ? "s" : ""} saved
					</Typography>
				</Box>
				<Button
					variant="contained"
					startIcon={<ShoppingBagIcon />}
					onClick={() => navigate("/")}
				>
					Browse Products
				</Button>
			</Box>

			{items.length === 0 ? (
				<EmptyState
					icon={
						<FavoriteIcon
							sx={{ fontSize: 64, color: "text.secondary", opacity: 0.5 }}
						/>
					}
					title="Your wishlist is empty"
					description="Save items you love by tapping the heart icon on any product."
					actionText="Start Shopping"
					onAction={() => navigate("/")}
				/>
			) : (
				<Grid container spacing={3}>
					{items.map((item) => (
						<Grid item xs={12} sm={6} md={4} lg={3} key={item._id}>
							<Card
								sx={{
									height: "100%",
									display: "flex",
									flexDirection: "column",
									borderRadius: 4,
									overflow: "hidden",
									cursor: "pointer",
									transition: "transform 0.3s ease, box-shadow 0.3s ease",
									"&:hover": {
										transform: "translateY(-4px)",
										boxShadow: 6,
									},
								}}
							>
								<Box
									sx={{
										position: "relative",
										pt: "75%",
										overflow: "hidden",
										bgcolor: (t) =>
											t.palette.mode === "light" ? "#f8fafc" : "#0f172a",
									}}
									onClick={() => navigate(`/product/${item.product._id}`)}
								>
									<CardMedia
										component="img"
										image={item.product.imageUrl}
										alt={item.product.name}
										sx={{
											position: "absolute",
											top: 0,
											left: 0,
											width: "100%",
											height: "100%",
											objectFit: "cover",
										}}
										onError={(e: any) => {
											e.target.src =
												"https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80";
										}}
									/>
									<IconButton
										sx={{
											position: "absolute",
											top: 16,
											right: 20,
											bgcolor: "rgba(255,255,255,0.9)",
											"&:hover": { bgcolor: "#fff" },
										}}
										onClick={(e) => {
											e.stopPropagation();
											removeMutation.mutate(item.product._id);
										}}
									>
										<FavoriteIcon color="error" />
									</IconButton>
								</Box>

								<CardContent
									sx={{ flexGrow: 1, p: 2.5 }}
									onClick={() => navigate(`/product/${item.product._id}`)}
								>
									<Stack direction="row" justifyContent="space-between" mb={1}>
										<Chip
											label={item.product.brand}
											size="small"
											variant="outlined"
										/>
										<Chip
											label={item.product.category}
											size="small"
											variant="outlined"
										/>
									</Stack>
									<Typography
										variant="h6"
										fontWeight={700}
										sx={{
											display: "-webkit-box",
											WebkitLineClamp: 1,
											WebkitBoxOrient: "vertical",
											overflow: "hidden",
											mb: 1,
										}}
									>
										{item.product.name}
									</Typography>
									<Typography variant="h5" fontWeight={800} color="primary">
										${item.product.price.toLocaleString()}
									</Typography>
								</CardContent>

								<CardActions sx={{ p: 2.5, pt: 0 }}>
									<Button
										fullWidth
										variant="contained"
										startIcon={<AddShoppingCartIcon />}
										disabled={
											addToCartMutation.isPending || item.product.stock <= 0
										}
										onClick={(e) => {
											e.stopPropagation();
											addToCartMutation.mutate(item.product._id);
										}}
										sx={{ borderRadius: 2.5 }}
									>
										{item.product.stock > 0 ? "Add to Cart" : "Out of Stock"}
									</Button>
								</CardActions>
							</Card>
						</Grid>
					))}
				</Grid>
			)}
		</Box>
	);
};
