import React from "react";
import {
	Card,
	CardMedia,
	CardContent,
	Typography,
	CardActions,
	Button,
	Box,
	Chip,
	Stack,
	IconButton,
	Rating,
} from "@mui/material";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { IProduct } from "../../types";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../api/axios";
import toast from "react-hot-toast";

interface ProductCardProps {
	product: IProduct;
	onAddToCart: (productId: string) => void;
	onUpdateQuantity?: (productId: string, quantity: number) => void;
	onRemoveItem?: (productId: string) => void;
	cartQuantity?: number;
	isAddToCartPending: boolean;
	isUpdatePending?: boolean;
	inWishlist?: boolean;
	/** Optional display rating (e.g. from review aggregates) */
	averageRating?: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({
	product,
	onAddToCart,
	onUpdateQuantity,
	onRemoveItem,
	cartQuantity,
	isAddToCartPending,
	isUpdatePending,
	inWishlist,
	averageRating,
}) => {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const inStock = product.stock > 0;
	const isInCart = cartQuantity !== undefined && cartQuantity > 0;

	const toggleWishlistMutation = useMutation({
		mutationFn: async () => {
			if (inWishlist) {
				await api.delete(`/wishlist/${product._id}`);
			} else {
				await api.post(`/wishlist/${product._id}`);
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["wishlist"] });
			toast.success(
				inWishlist ? "Removed from wishlist" : "Added to wishlist!",
			);
		},
		onError: (err: any) => {
			toast.error(err.message || "Failed to update wishlist");
		},
	});

	const handleAddToCartClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		onAddToCart(product._id);
	};

	const handleDecrease = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (cartQuantity === 1) {
			onRemoveItem?.(product._id);
		} else {
			onUpdateQuantity?.(product._id, (cartQuantity || 1) - 1);
		}
	};

	const handleIncrease = (e: React.MouseEvent) => {
		e.stopPropagation();
		const newQty = (cartQuantity || 0) + 1;
		if (newQty <= product.stock) {
			onUpdateQuantity?.(product._id, newQty);
		}
	};

	const handleWishlistClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		toggleWishlistMutation.mutate();
	};

	return (
		<Card
			onClick={() => navigate(`/product/${product._id}`)}
			sx={{
				height: "100%",
				display: "flex",
				flexDirection: "column",
				justifyContent: "space-between",
				borderRadius: 4,
				overflow: "hidden",
				cursor: "pointer",
				border: "1px solid",
				borderColor: (t) =>
					t.palette.mode === "dark"
						? "rgba(129, 140, 248, 0.12)"
						: "rgba(226, 232, 240, 0.95)",
				boxShadow: (t) =>
					t.palette.mode === "dark"
						? "0 12px 40px -16px rgba(0, 0, 0, 0.45)"
						: "0 8px 30px -12px rgba(15, 23, 42, 0.08)",
				transition:
					"transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.35s ease, border-color 0.35s ease",
				"&:hover": {
					transform: "translateY(-8px)",
					borderColor: (t) =>
						t.palette.mode === "dark"
							? "rgba(129, 140, 248, 0.28)"
							: "rgba(79, 70, 229, 0.2)",
					boxShadow: (t) =>
						t.palette.mode === "dark"
							? "0 24px 48px -16px rgba(79, 70, 229, 0.35)"
							: "0 20px 40px -12px rgba(79, 70, 229, 0.18)",
					"& .MuiCardMedia-root": {
						transform: "scale(1.06)",
					},
					"& .product-card-quick-actions": {
						opacity: 1,
						transform: "translateY(0)",
					},
				},
			}}
		>
			<Box
				sx={{
					position: "relative",
					pt: "78%",
					overflow: "hidden",
					bgcolor: (theme) =>
						theme.palette.mode === "light" ? "#f1f5f9" : "#0f172a",
					"&::after": {
						content: '""',
						position: "absolute",
						inset: 0,
						background:
							"linear-gradient(180deg, transparent 55%, rgba(15, 23, 42, 0.35) 100%)",
						pointerEvents: "none",
						opacity: 0.6,
					},
				}}
			>
				<CardMedia
					component="img"
					image={product.imageUrl}
					alt={product.name}
					sx={{
						position: "absolute",
						top: 0,
						left: 0,
						width: "100%",
						height: "100%",
						objectFit: "cover",
						transition: "transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)",
					}}
					onError={(e: any) => {
						e.target.src =
							"https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80";
					}}
				/>
				<Stack
					direction="row"
					spacing={0.75}
					sx={{
						position: "absolute",
						top: 14,
						left: 14,
						zIndex: 1,
					}}
				>
					<Chip
						label={product.brand}
						size="small"
						sx={{
							bgcolor: "rgba(15, 23, 42, 0.72)",
							color: "#fff",
							backdropFilter: "blur(10px)",
							fontWeight: 700,
							fontSize: "0.68rem",
							border: "1px solid rgba(255,255,255,0.12)",
						}}
					/>
					{inStock && product.stock <= 5 && (
						<Chip
							icon={<AutoAwesomeIcon sx={{ fontSize: "14px !important" }} />}
							label="Low stock"
							size="small"
							sx={{
								bgcolor: "rgba(245, 158, 11, 0.9)",
								color: "#fff",
								fontWeight: 700,
								fontSize: "0.65rem",
								"& .MuiChip-icon": { color: "#fff" },
							}}
						/>
					)}
				</Stack>
				<IconButton
					className="product-card-quick-actions"
					onClick={handleWishlistClick}
					sx={{
						position: "absolute",
						top: 12,
						right: 12,
						zIndex: 1,
						bgcolor: "rgba(255,255,255,0.92)",
						backdropFilter: "blur(8px)",
						boxShadow: "0 8px 20px -8px rgba(0,0,0,0.35)",
						opacity: { xs: 1, md: 0.95 },
						transition: "all 0.25s ease",
						"&:hover": {
							bgcolor: "#fff",
							transform: "scale(1.08)",
						},
					}}
					size="small"
					disabled={toggleWishlistMutation.isPending}
					aria-label={
						inWishlist ? "Remove from wishlist" : "Add to wishlist"
					}
				>
					{inWishlist ? (
						<FavoriteIcon sx={{ color: "#ef4444", fontSize: 20 }} />
					) : (
						<FavoriteBorderIcon sx={{ color: "#64748b", fontSize: 20 }} />
					)}
				</IconButton>
			</Box>

			<CardContent sx={{ flexGrow: 1, p: 2.5, pt: 2 }}>
				<Box
					sx={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						mb: 1,
					}}
				>
					<Typography
						variant="caption"
						color="primary"
						fontWeight={700}
						sx={{ textTransform: "uppercase", letterSpacing: "0.08em" }}
					>
						{product.category}
					</Typography>
					<Stack direction="row" alignItems="center" gap={0.5}>
						{inStock ? (
							<CheckCircleOutlineIcon color="success" sx={{ fontSize: 16 }} />
						) : (
							<HighlightOffIcon color="error" sx={{ fontSize: 16 }} />
						)}
						<Typography
							variant="caption"
							fontWeight={600}
							color={inStock ? "success.main" : "error.main"}
						>
							{inStock ? `${product.stock} left` : "Out of stock"}
						</Typography>
					</Stack>
				</Box>

				<Typography
					variant="h6"
					fontWeight={700}
					sx={{
						mb: 0.75,
						display: "-webkit-box",
						WebkitLineClamp: 1,
						WebkitBoxOrient: "vertical",
						overflow: "hidden",
						letterSpacing: "-0.02em",
						fontSize: "1.05rem",
					}}
					title={product.name}
				>
					{product.name}
				</Typography>

				{averageRating !== undefined && averageRating > 0 && (
					<Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 1 }}>
						<Rating
							value={averageRating}
							precision={0.1}
						 readOnly
						 size="small"
						 sx={{ fontSize: "1rem" }}
						/>
						<Typography variant="caption" color="text.secondary" fontWeight={600}>
							{averageRating.toFixed(1)}
						</Typography>
					</Stack>
				)}

				<Typography
					variant="body2"
					color="text.secondary"
					sx={{
						mb: 2,
						display: "-webkit-box",
						WebkitLineClamp: 2,
						WebkitBoxOrient: "vertical",
						overflow: "hidden",
						minHeight: 40,
						fontSize: "0.8125rem",
						lineHeight: 1.55,
					}}
				>
					{product.description}
				</Typography>

				<Typography
					variant="h5"
					color="text.primary"
					fontWeight={800}
					sx={{ letterSpacing: "-0.03em" }}
				>
					${product.price.toLocaleString()}
				</Typography>
			</CardContent>

			<CardActions sx={{ p: 2.5, pt: 0 }}>
				{isInCart ? (
					<Stack
						direction="row"
						alignItems="center"
						justifyContent="space-between"
						sx={{
							width: "100%",
							p: 0.5,
							borderRadius: 2.5,
							border: "1px solid",
							borderColor: "divider",
							bgcolor: (t) =>
								t.palette.mode === "dark"
									? "rgba(129, 140, 248, 0.06)"
									: "rgba(79, 70, 229, 0.04)",
						}}
					>
						<IconButton
							size="small"
							onClick={handleDecrease}
							disabled={isUpdatePending}
							sx={{
								borderRadius: 2,
								width: 38,
								height: 38,
							}}
						>
							<RemoveIcon fontSize="small" />
						</IconButton>
						<Typography fontWeight={800} fontSize="1rem">
							{cartQuantity}
						</Typography>
						<IconButton
							size="small"
							onClick={handleIncrease}
							disabled={isUpdatePending || cartQuantity >= product.stock}
							sx={{
								borderRadius: 2,
								width: 38,
								height: 38,
							}}
						>
							<AddIcon fontSize="small" />
						</IconButton>
					</Stack>
				) : (
					<Button
						fullWidth
						variant={inStock ? "contained" : "outlined"}
						color="primary"
						startIcon={<AddShoppingCartIcon />}
						disabled={!inStock || isAddToCartPending}
						onClick={handleAddToCartClick}
						sx={{
							py: 1.15,
							borderRadius: 2.5,
							fontWeight: 700,
							background: inStock
								? "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)"
								: undefined,
						}}
					>
						{inStock ? "Add to Cart" : "Out of Stock"}
					</Button>
				)}
			</CardActions>
		</Card>
	);
};
