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
	Alert,
	Avatar,
} from "@mui/material";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import RateReviewIcon from "@mui/icons-material/RateReview";
import { api } from "../api/axios";
import { IProduct, IReviewResponse } from "../types";
import { luxeSurface, luxeFadeIn } from "../theme/luxeStyles";
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

	const { data: relatedProducts } = useQuery<IProduct[]>({
		queryKey: ["related-products", id],
		queryFn: async () => {
			const res = await api.get<IProduct[]>(`/product/${id}/related`);
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

			{relatedProducts && relatedProducts.length > 0 && (
				<Box mt={6} sx={luxeFadeIn}>
					<Typography variant="h5" fontWeight={800} mb={3}>
						Related Products
					</Typography>
					<Grid container spacing={3}>
						{relatedProducts.map((relatedProduct) => (
							<Grid item xs={12} sm={6} md={3} key={relatedProduct._id}>
								<Card
									sx={{
										borderRadius: 3,
										border: "1px solid",
										borderColor: "divider",
										cursor: "pointer",
										transition: "all 0.2s ease",
										"&:hover": {
											transform: "translateY(-4px)",
											boxShadow: "0 12px 24px -8px rgba(0,0,0,0.12)",
										},
									}}
									onClick={() => navigate(`/product/${relatedProduct._id}`)}
								>
									<CardMedia
										component="img"
										image={relatedProduct.imageUrl}
										alt={relatedProduct.name}
										sx={{
											height: 200,
											objectFit: "cover",
										}}
										onError={(e: any) => {
											e.target.src =
												"https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80";
										}}
									/>
									<Box sx={{ p: 2 }}>
										<Typography
											variant="subtitle2"
											fontWeight={700}
											noWrap
											mb={0.5}
										>
											{relatedProduct.name}
										</Typography>
										<Typography variant="body2" color="text.secondary" noWrap mb={1}>
											{relatedProduct.brand}
										</Typography>
										<Typography variant="h6" fontWeight={800} color="primary">
											${relatedProduct.price.toLocaleString()}
										</Typography>
									</Box>
								</Card>
							</Grid>
						))}
					</Grid>
				</Box>
			)}

			{/* Customer Reviews */}
			<Box mt={6} sx={luxeFadeIn}>
				<Card
					sx={{
						borderRadius: 4,
						border: "1px solid",
						borderColor: "divider",
					}}
				>
					{/* Header */}
					<Box sx={{ p: { xs: 2.5, md: 3.5 } }}>
						<Stack
							direction={{ xs: "column", sm: "row" }}
							justifyContent="space-between"
							alignItems={{ xs: "flex-start", sm: "center" }}
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
								<Typography variant="h5" fontWeight={800}>
									{(reviewsData?.averageRating ?? 0).toFixed(1)}
								</Typography>
							</Stack>
						</Stack>
					</Box>

					<Divider />

					{/* Body: Summary + Write Review */}
					<Box sx={{ p: { xs: 2.5, md: 3.5 } }}>
						<Grid container spacing={3}>
							{/* Left: Review Summary */}
							<Grid item xs={12} md={4}>
								<Paper
									elevation={0}
									sx={{
										...luxeSurface,
										p: 3,
										textAlign: "center",
									}}
								>
									<Typography
										variant="subtitle2"
										color="text.secondary"
										gutterBottom
									>
										Review Summary
									</Typography>
									<Typography variant="h2" fontWeight={800} sx={{ lineHeight: 1 }}>
										{(reviewsData?.averageRating ?? 0).toFixed(1)}
									</Typography>
									<Rating
										value={reviewsData?.averageRating ?? 0}
										precision={0.1}
										readOnly
										sx={{ my: 1 }}
									/>
									<Typography variant="body2" color="text.secondary">
										Based on {reviewsData?.totalReviews ?? 0} review
										{(reviewsData?.totalReviews ?? 0) === 1 ? "" : "s"}
									</Typography>
								</Paper>
							</Grid>

							{/* Right: Write Review or Login */}
							<Grid item xs={12} md={8}>
								{isAuthenticated ? (
									<Box
										sx={{
											p: 3,
											borderRadius: 3,
											border: "1px solid",
											borderColor: "divider",
											bgcolor: "background.paper",
										}}
									>
										<Typography variant="subtitle1" fontWeight={700} mb={2}>
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
									<Alert
										severity="info"
										sx={{
											borderRadius: 3,
											bgcolor: (theme) =>
												theme.palette.mode === "dark"
													? "rgba(59, 130, 246, 0.08)"
													: "rgba(59, 130, 246, 0.04)",
											border: "1px solid",
											borderColor: "divider",
										}}
									>
										<Box
											sx={{
												display: "flex",
												alignItems: "center",
												gap: 1.5,
											}}
										>
											<InfoOutlinedIcon sx={{ color: "info.main" }} />
											<Box>
												<Typography
													variant="subtitle2"
													fontWeight={600}
													color="info.main"
												>
													Sign in to share your thoughts
												</Typography>
												<Typography variant="body2" color="text.secondary">
													Please log in to leave a review for this
													product.
												</Typography>
											</Box>
										</Box>
									</Alert>
								)}
							</Grid>
						</Grid>
					</Box>

					<Divider sx={{ mx: { xs: 2.5, md: 3.5 } }} />

					{/* Reviews List or Empty State */}
					<Box sx={{ p: { xs: 2.5, md: 3.5 } }}>
						{(reviewsData?.reviews ?? []).length === 0 ? (
							<Box
								sx={{
									textAlign: "center",
									py: 6,
									...luxeFadeIn,
								}}
							>
								<Box
									sx={{
										width: 64,
										height: 64,
										borderRadius: "50%",
										bgcolor: (theme) =>
											theme.palette.mode === "dark"
												? "rgba(129, 140, 248, 0.1)"
												: "rgba(79, 70, 229, 0.06)",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										mx: "auto",
										mb: 2,
									}}
								>
									<RateReviewIcon
										sx={{ fontSize: 32, color: "primary.main", opacity: 0.7 }}
									/>
								</Box>
								<Typography variant="h6" fontWeight={700} gutterBottom>
									No reviews yet
								</Typography>
								<Typography
									variant="body2"
									color="text.secondary"
									sx={{ maxWidth: 400, mx: "auto", lineHeight: 1.7 }}
								>
									Be the first to share your experience with this
									product. Your feedback helps others make informed
									decisions.
								</Typography>
							</Box>
						) : (
							<Stack spacing={2}>
								{(reviewsData?.reviews ?? []).map((review) => {
									const reviewerName =
										typeof review.userId === "string"
											? "Verified customer"
											: `${review.userId.firstName} ${review.userId.lastName}`;

									return (
										<Box
											key={review._id}
											sx={{
												p: 2.5,
												borderRadius: 3,
												border: "1px solid",
												borderColor: "divider",
												bgcolor: "background.paper",
												transition: "all 0.2s ease",
												"&:hover": {
													bgcolor: (theme) =>
														theme.palette.mode === "dark"
															? "rgba(129, 140, 248, 0.04)"
															: "rgba(79, 70, 229, 0.02)",
												},
											}}
										>
											<Stack
												direction="row"
												justifyContent="space-between"
												alignItems="center"
												spacing={2}
											>
												<Box
													sx={{
														display: "flex",
														alignItems: "center",
														gap: 1.5,
													}}
												>
													<Avatar
														sx={{
															width: 36,
															height: 36,
															bgcolor: "primary.main",
															fontSize: "0.875rem",
														}}
													>
														{reviewerName === "Verified customer"
															? "?"
															: reviewerName
																	.split(" ")
																	.map((n) => n[0])
																	.join("")}
													</Avatar>
													<Typography variant="subtitle1" fontWeight={700}>
														{reviewerName}
													</Typography>
												</Box>
												<Stack
													direction="row"
													alignItems="center"
													spacing={1}
												>
													<Rating
														value={review.rating}
														readOnly
														size="small"
													/>
													<Typography
														variant="caption"
														color="text.secondary"
														sx={{ minWidth: 36 }}
													>
														{review.rating}.0
													</Typography>
												</Stack>
											</Stack>
											<Typography
												variant="body2"
												color="text.secondary"
												sx={{ mt: 1.5, lineHeight: 1.7 }}
											>
												{review.comment}
											</Typography>
										</Box>
									);
								})}
							</Stack>
						)}
					</Box>
				</Card>
			</Box>
		</Box>
	);
};
