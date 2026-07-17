import express from "express";
import { Request, Response } from "express";
import {
	addItemToCart,
	checkout,
	clearCart,
	deleteItemFromCart,
	getActiveCartForUser,
	updateItemInCart,
} from "../services/cartService";
import { authenticate } from "../middleware/auth.middleware";

const router = express.Router();

router.get("/", authenticate, async (req: any, res: Response) => {
	const userId = req.user.id;
	try {
		const activeCart = await getActiveCartForUser({ userId });
		res.status(200).json(activeCart);
	} catch (error) {
		res.status(500).json({ message: "Error retrieving active cart", error });
	}
});

router.post("/items", authenticate, async (req: any, res: Response) => {
	try {
	const userId = req.user.id;
	const { productId, quantity } = req.body;
	const response = await addItemToCart({ userId, productId, quantity });
		res.status(200).json(response);
	} catch (error) {
		res.status(500).json({ message: "Error adding item to cart", error });
	}
});

router.put("/items", authenticate, async (req: any, res: Response) => {
	try {
	const userId = req.user.id;
	const { productId, quantity } = req.body;
	const response = await updateItemInCart({ userId, productId, quantity });
		res.status(200).json(response);
	} catch (error) {
		res.status(500).json({ message: "Error updating item in cart", error });
	}
});

router.delete(
	"/items/:productId",
	authenticate,
	async (req: any, res: Response) => {
		try {
		const userId = req.user.id;
		const { productId } = req.params;
		const response = await deleteItemFromCart({ userId, productId });
			res.status(200).json(response);
		} catch (error) {
			res.status(500).json({ message: "Error deleting item from cart", error });
		}
	},
);

router.delete("/clear", authenticate, async (req: any, res: Response) => {
	try {
	const userId = req.user.id;
	const response = await clearCart({ userId });
		res.status(200).json(response);
	} catch (error) {
		res.status(500).json({ message: "Error clearing cart", error });
	}
});

router.post("/checkout", authenticate, async (req: any, res: Response) => {
	try {
	const userId = req.user.id;
	const { address } = req.body;
	const response = await checkout({ userId, address });
		res.status(200).json(response);
	} catch (error) {
		res.status(500).json({ message: "Error during checkout", error });
	}
});
export default router;
