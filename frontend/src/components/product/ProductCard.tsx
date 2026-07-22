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
} from "@mui/material";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import { IProduct } from "../../types";
import { useNavigate } from "react-router-dom";

interface ProductCardProps {
	product: IProduct;
	onAddToCart: (productId: string) => void;
	onUpdateQuantity?: (productId: string, quantity: number) => void;
	onRemoveItem?: (productId: string) => void;
	cartQuantity?: number;
	isAddToCartPending: boolean;
	isUpdatePending?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
	product,
	onAddToCart,
	onUpdateQuantity,
	onRemoveItem,
	cartQuantity,
	isAddToCartPending,
	isUpdatePending,
}) => {
	const navigate = useNavigate();
	const inStock = product.stock > 0;
	const isInCart = cartQuantity !== undefined && cartQuantity > 0;

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
				transition: "transform 0.3s ease, box-shadow 0.3s ease",
				"&:hover": {
					transform: "translateY(-6px)",
					boxShadow: (theme) =>
						theme.palette.mode === "light"
							? "0 12px 30px -4px rgba(15, 23, 42, 0.12)"
							: "0 12px 30px -4px rgba(0, 0, 0, 0.5)",
					"& .MuiCardMedia-root": {
						transform: "scale(1.05)",
					},
				},
			}}
		>
			<Box
				sx={{
					position: "relative",
					pt: "75%",
					overflow: "hidden",
					bgcolor: (theme) =>
						theme.palette.mode === "light" ? "#f8fafc" : "#0f172a",
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
						transition: "transform 0.5s ease",
					}}
					onError={(e: any) => {
						e.target.src =
							"https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80";
					}}
				/>
				<Box
					sx={{
						position: "absolute",
						top: 12,
						left: 12,
						display: "flex",
						gap: 0.8,
					}}
				>
					<Chip
						label={product.brand}
						size="small"
						sx={{
							bgcolor: "rgba(15, 23, 42, 0.75)",
							color: "#fff",
							backdropFilter: "blur(6px)",
							fontWeight: 600,
							fontSize: "0.7rem",
						}}
					/>
				</Box>
			</Box>

			<CardContent sx={{ flexGrow: 1, p: 2.5 }}>
				<Stack
					direction="row"
					justifyContent="space-between"
					alignItems="center"
					mb={1}
				>
					<Typography
						variant="caption"
						color="primary"
						fontWeight={700}
						sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}
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
				</Stack>

				<Typography
					variant="h6"
					fontWeight={700}
					sx={{
						mb: 1,
						display: "-webkit-box",
						WebkitLineClamp: 1,
						WebkitBoxOrient: "vertical",
						overflow: "hidden",
					}}
					title={product.name}
				>
					{product.name}
				</Typography>

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
						fontSize: "0.85rem",
					}}
				>
					{product.description}
				</Typography>

				<Typography variant="h5" color="text.primary" fontWeight={800}>
					${product.price.toLocaleString()}
				</Typography>
			</CardContent>

			<CardActions sx={{ p: 2.5, pt: 0 }}>
				{isInCart ? (
					<Stack
						direction="row"
						alignItems="center"
						justifyContent="space-between"
						sx={{ width: "100%" }}
					>
						<IconButton
							size="small"
							onClick={handleDecrease}
							disabled={isUpdatePending}
							sx={{
								border: "1px solid",
								borderColor: "divider",
								borderRadius: 1.5,
								width: 36,
								height: 36,
							}}
						>
							<RemoveIcon fontSize="small" />
						</IconButton>
						<Typography fontWeight={700} fontSize="1rem">
							{cartQuantity}
						</Typography>
						<IconButton
							size="small"
							onClick={handleIncrease}
							disabled={isUpdatePending || cartQuantity >= product.stock}
							sx={{
								border: "1px solid",
								borderColor: "divider",
								borderRadius: 1.5,
								width: 36,
								height: 36,
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
							py: 1,
							borderRadius: 2.5,
							fontWeight: 700,
						}}
					>
						{inStock ? "Add to Cart" : "Out of Stock"}
					</Button>
				)}
			</CardActions>
		</Card>
	);
};
