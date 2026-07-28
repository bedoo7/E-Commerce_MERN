import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
	Box,
	Typography,
	Button,
	Chip,
	Grid,
	CircularProgress,
	Card,
	CardMedia,
	Stack,
	Divider,
	IconButton,
	TextField,
	Rating,
	Paper,
} from "@mui/material";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import { api } from "../api/axios";
import { IProduct, IReviewResponse } from "../types";
import { luxeSurface } from "../theme/luxeStyles";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export const ProductDetail: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const { isAuthenticated, user } = useAuth();
	const queryClient = useQueryClient();
	const [quantity, setQuantity] = useState(1);
	const [reviewRating, setReviewRating] = useState(5);
	const [reviewComment, setReviewComment] = useState("");

	const {
		data: product,
		isLoading,
		error,
	} = useQuery<IProduct>({
		queryKey: ["product", id],
		queryFn: async () => {
			const res = await api.get<IProduct>(`/product/${id}`);
			return res.data;
		},
		enabled: !!id,
	});

	const { data: reviewsData } = useQuery<IReviewResponse>({
		queryKey: ["product-reviews", id],
		queryFn: async () => {
			const res = await api.get<IReviewResponse>(`/review/product/${id}`);
			return res.data;
		},
		enabled: !!id,
	});

	const addToCartMutation = useMutation({
		mutationFn: async ({
			productId,
			quantity: qty,
		}: {
			productId: string;
			quantity: number;
		}) => {
			const res = await api.post("/cart/items", {
				productId,
				quantity: qty,
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

	const reviewMutation = useMutation({
		mutationFn: async () => {
			if (!id || !product) {
				throw new Error("Unable to submit review");
			}
			const res = await api.post("/review", {
				productId: product._id,
				rating: reviewRating,
				comment: reviewComment.trim(),
			});
			return res.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["product-reviews", id] });
			setReviewComment("");
			setReviewRating(5);
			toast.success("Review posted successfully!");
		},
		onError: (err: any) => {
			toast.error(err.message || "Failed to submit review");
		},
	});

	const handleAddToCart = () => {
		if (!isAuthenticated) {
			toast.error("Please log in to add items to your cart");
			return;
		}
		if (!product) return;
		addToCartMutation.mutate({ productId: product._id, quantity });
	};

	const handleReviewSubmit = () => {
		if (!isAuthenticated) {
			toast.error("Please log in to leave a review");
			return;
		}
		if (!reviewComment.trim()) {
			toast.error("Please write a review comment");
			return;
		}
		reviewMutation.mutate();
	};

	if (isLoading) {
		return (
			<Box
				display="flex"
				justifyContent="center"
				alignItems="center"
				minHeight="60vh"
			>
				<CircularProgress size={48} />
			</Box>
		);
	}

	if (error || !product) {
		return (
			<Box textAlign="center" py={8}>
				<Typography color="error" variant="h5">
					Product not found
				</Typography>
				<Button
					startIcon={<ArrowBackIcon />}
					onClick={() => navigate("/")}
					sx={{ mt: 2 }}
				>
					Back to Shop
				</Button>
			</Box>
		);
	}

	const inStock = product.stock > 0;

	return (
		<Box>
			<Button
				startIcon={<ArrowBackIcon />}
				onClick={() => navigate("/")}
				sx={{ mb: 3, fontWeight: 600 }}
			>
				Back to Shop
			</Button>

			<Card
				sx={{
					borderRadius: 4,
					overflow: "hidden",
					border: "1px solid",
					borderColor: "divider",
				}}
			>
				<Grid container>
					{/* Image Section */}
					<Grid
						item
						xs={12}
						md={6}
						sx={{
							bgcolor: (theme) =>
								theme.palette.mode === "light" ? "#f8fafc" : "#0f172a",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							p: 4,
							minHeight: { xs: 300, md: 500 },
						}}
					>
						<CardMedia
							component="img"
							image={product.imageUrl}
							alt={product.name}
							sx={{
								maxWidth: "100%",
								maxHeight: 450,
								objectFit: "contain",
								transition: "transform 0.3s ease",
								"&:hover": {
									transform: "scale(1.05)",
								},
							}}
							onError={(e: any) => {
								e.target.src =
									"https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80";
							}}
						/>
					</Grid>

					{/* Details Section */}
					<Grid item xs={12} md={6} sx={{ p: { xs: 3, md: 5 } }}>
						<Stack spacing={3}>
							<Box>
								<Stack
									direction="row"
									spacing={1}
									mb={1.5}
									flexWrap="wrap"
									gap={1}
								>
									<Chip
										label={product.brand}
										size="small"
										color="primary"
										variant="outlined"
									/>
									<Chip
										label={product.category}
										size="small"
										variant="outlined"
									/>
									<Chip
										label={inStock ? "In Stock" : "Out of Stock"}
										size="small"
										color={inStock ? "success" : "error"}
									/>
								</Stack>

								<Typography variant="h3" fontWeight={800} gutterBottom>
									{product.name}
								</Typography>

								<Typography
									variant="h4"
									color="primary"
									fontWeight={800}
									sx={{ mb: 2 }}
								>
									${product.price.toLocaleString()}
								</Typography>
							</Box>

							<Divider />

							<Box>
								<Typography variant="subtitle1" fontWeight={700} mb={1}>
									Description
								</Typography>
								<Typography
									variant="body1"
									color="text.secondary"
									sx={{ lineHeight: 1.7 }}
								>
									{product.description}
								</Typography>
							</Box>

							<Divider />

							{/* Quantity Selector & Add to Cart */}
							<Box>
								<Typography variant="subtitle1" fontWeight={700} mb={1.5}>
									Quantity
								</Typography>
								<Stack direction="row" alignItems="center" spacing={2} mb={3}>
									<IconButton
										size="small"
										onClick={() => setQuantity(Math.max(1, quantity - 1))}
										sx={{ border: "1px solid", borderColor: "divider" }}
									>
										<RemoveIcon />
									</IconButton>
									<TextField
										value={quantity}
										onChange={(e) => {
											const val = parseInt(e.target.value) || 1;
											setQuantity(Math.min(val, product.stock));
										}}
										type="number"
										size="small"
										sx={{ width: 80, "& input": { textAlign: "center" } }}
										inputProps={{ min: 1, max: product.stock }}
									/>
									<IconButton
										size="small"
										onClick={() =>
											setQuantity(Math.min(product.stock, quantity + 1))
										}
										disabled={quantity >= product.stock}
										sx={{ border: "1px solid", borderColor: "divider" }}
									>
										<AddIcon />
									</IconButton>
									<Typography variant="body2" color="text.secondary">
										{product.stock} available
									</Typography>
								</Stack>

								<Button
									fullWidth
									variant="contained"
									size="large"
									startIcon={<AddShoppingCartIcon />}
									disabled={!inStock || addToCartMutation.isPending}
									onClick={handleAddToCart}
									sx={{ py: 1.5, borderRadius: 3, fontSize: "1rem" }}
								>
									{addToCartMutation.isPending
										? "Adding..."
										: inStock
											? "Add to Cart"
											: "Out of Stock"}
								</Button>
							</Box>

							{/* Stock Info */}
							<Stack
								direction="row"
								alignItems="center"
								spacing={1}
								color="text.secondary"
							>
								{inStock ? (
									<>
										<CheckCircleOutlineIcon color="success" fontSize="small" />
										<Typography variant="body2">
											Free shipping on orders over $50
										</Typography>
									</>
								) : (
									<Typography variant="body2" color="error">
										This product is currently out of stock
									</Typography>
								)}
							</Stack>
						</Stack>
					</Grid>
				</Grid>
			</Card>

			<Box mt={4}>
				<Card
					sx={{
						borderRadius: 4,
						border: "1px solid",
						borderColor: "divider",
					}}
				>
					<CardMedia component="div" sx={{ p: 3 }}>
						<Stack
							direction={{ xs: "column", sm: "row" }}
							alignItems={{ xs: "flex-start", sm: "center" }}
							justifyContent="space-between"
							spacing={2}
						>
							<Box>
								<Typography variant="h5" fontWeight={800}>
									Customer Reviews
								</Typography>
								<Typography variant="body2" color="text.secondary">
									{reviewsData?.totalReviews ?? 0} verified review
									{(reviewsData?.totalReviews ?? 0) === 1 ? "" : "s"}
								</Typography>
							</Box>
							<Stack direction="row" alignItems="center" spacing={1}>
								<Rating
									value={reviewsData?.averageRating ?? 0}
									precision={0.1}
									readOnly
									size="small"
								/>
								<Typography variant="h6" fontWeight={700}>
									{(reviewsData?.averageRating ?? 0).toFixed(1)}
								</Typography>
							</Stack>
						</Stack>
					</CardMedia>
					<Divider />
					<Box sx={{ p: 3 }}>
						<Grid container spacing={3}>
							<Grid item xs={12} md={4}>
								<Paper elevation={0} sx={luxeSurface}>
									<Typography variant="subtitle2" color="text.secondary" mb={1}>
										Review Summary
									</Typography>
									<Typography variant="h3" fontWeight={800}>
										{(reviewsData?.averageRating ?? 0).toFixed(1)}
									</Typography>
									<Rating
										value={reviewsData?.averageRating ?? 0}
										precision={0.1}
										readOnly
										sx={{ mt: 1 }}
									/>
									<Typography variant="body2" color="text.secondary" mt={1}>
										Based on {reviewsData?.totalReviews ?? 0} review
										{(reviewsData?.totalReviews ?? 0) === 1 ? "" : "s"}
									</Typography>
								</Paper>
							</Grid>

							<Grid item xs={12} md={8}>
								{isAuthenticated ? (
									<Box
										sx={{
											p: 1.5,
											borderRadius: 3,
											border: "1px solid",
											borderColor: "divider",
										}}
									>
										<Typography variant="subtitle1" fontWeight={700} mb={1.5}>
											Write a Review
										</Typography>
										<Stack spacing={2}>
											<Stack direction="row" alignItems="center" spacing={1}>
												<Typography variant="body2" color="text.secondary">
													Your rating:
												</Typography>
												<Rating
													value={reviewRating}
													onChange={(_, value) => setReviewRating(value || 5)}
												/>
											</Stack>
											<TextField
												fullWidth
												multiline
												rows={4}
												label="Share your experience"
												value={reviewComment}
												onChange={(e) => setReviewComment(e.target.value)}
											/>
											<Button
												variant="contained"
												onClick={handleReviewSubmit}
												disabled={
													reviewMutation.isPending || !reviewComment.trim()
												}
											>
												{reviewMutation.isPending
													? "Posting..."
													: "Post Review"}
											</Button>
										</Stack>
									</Box>
								) : (
									<Typography variant="body2" color="text.secondary">
										Please log in to leave a review for this product.
									</Typography>
								)}
							</Grid>
						</Grid>

						<Stack spacing={2} mt={3}>
							{(reviewsData?.reviews ?? []).length === 0 ? (
								<Typography variant="body2" color="text.secondary">
									No reviews yet. Be the first to share your thoughts.
								</Typography>
							) : (
								(reviewsData?.reviews ?? []).map((review) => {
									const reviewerName =
										typeof review.userId === "string"
											? "Verified customer"
											: `${review.userId.firstName} ${review.userId.lastName}`;

									return (
										<Box
											key={review._id}
											sx={{
												p: 2,
												borderRadius: 3,
												border: "1px solid",
												borderColor: "divider",
											}}
										>
											<Stack
												direction="row"
												justifyContent="space-between"
												alignItems="center"
												spacing={1}
											>
												<Typography variant="subtitle1" fontWeight={700}>
													{reviewerName}
												</Typography>
												<Rating value={review.rating} readOnly size="small" />
											</Stack>
											<Typography variant="body2" color="text.secondary" mt={1}>
												{review.comment}
											</Typography>
										</Box>
									);
								})
							)}
						</Stack>
					</Box>
				</Card>
			</Box>
		</Box>
	);
};
