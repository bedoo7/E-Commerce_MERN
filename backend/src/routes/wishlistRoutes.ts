import express, { Response } from "express";
import { authenticate } from "../middleware/auth.middleware";
import {
	getWishlist,
	addToWishlist,
	removeFromWishlist,
	checkInWishlist,
	clearWishlist,
} from "../services/wishlistService";

const router = express.Router();

router.get("/", authenticate, async (req: any, res: Response) => {
	try {
		const wishlist = await getWishlist({ userId: req.user.id });
		res.status(200).json(wishlist);
	} catch (error: any) {
		res.status(400).json({ message: error.message });
	}
});

router.get(
	"/check/:productId",
	authenticate,
	async (req: any, res: Response) => {
		try {
			const inWishlist = await checkInWishlist({
				userId: req.user.id,
				productId: req.params.productId,
			});
			res.status(200).json({ inWishlist });
		} catch (error: any) {
			res.status(400).json({ message: error.message });
		}
	},
);

router.post("/:productId", authenticate, async (req: any, res: Response) => {
	try {
		const wishlist = await addToWishlist({
			userId: req.user.id,
			productId: req.params.productId,
		});
		res.status(200).json(wishlist);
	} catch (error: any) {
		res.status(400).json({ message: error.message });
	}
});

router.delete("/:productId", authenticate, async (req: any, res: Response) => {
	try {
		const wishlist = await removeFromWishlist({
			userId: req.user.id,
			productId: req.params.productId,
		});
		res.status(200).json(wishlist);
	} catch (error: any) {
		res.status(400).json({ message: error.message });
	}
});

router.delete("/", authenticate, async (req: any, res: Response) => {
	try {
		const result = await clearWishlist({ userId: req.user.id });
		res.status(200).json(result);
	} catch (error: any) {
		res.status(400).json({ message: error.message });
	}
});

export default router;
