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
} from "@mui/material";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import { api } from "../api/axios";
import { IProduct } from "../types";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export const ProductDetail: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const { isAuthenticated } = useAuth();
	const queryClient = useQueryClient();
	const [quantity, setQuantity] = useState(1);

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

	const handleAddToCart = () => {
		if (!isAuthenticated) {
			toast.error("Please log in to add items to your cart");
			return;
		}
		if (!product) return;
		addToCartMutation.mutate({ productId: product._id, quantity });
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
		</Box>
	);
};
