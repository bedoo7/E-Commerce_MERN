import express from "express";
import { authenticate } from "../middleware/auth.middleware";
import {
	createReview,
	getProductReviews,
	deleteReview,
} from "../services/reviewService";

const router = express.Router();

// Get reviews for a product (public)
router.get("/product/:productId", async (req, res) => {
	try {
		const result = await getProductReviews(req.params.productId);
		res.status(200).json(result);
	} catch (error: any) {
		res.status(400).json({ message: error.message });
	}
});

// Create a review (authenticated)
router.post("/", authenticate, async (req: any, res) => {
	try {
		const { productId, rating, comment } = req.body;
		if (!productId || !rating || !comment) {
			return res
				.status(400)
				.json({ message: "ProductId, rating, and comment are required" });
		}
		if (rating < 1 || rating > 5) {
			return res
				.status(400)
				.json({ message: "Rating must be between 1 and 5" });
		}
		const review = await createReview({
			productId,
			userId: req.user.id,
			rating,
			comment,
		});
		res.status(201).json(review);
	} catch (error: any) {
		res.status(400).json({ message: error.message });
	}
});

// Delete a review (authenticated)
router.delete("/:reviewId", authenticate, async (req: any, res) => {
	try {
		const result = await deleteReview(req.params.reviewId, req.user.id);
		res.status(200).json(result);
	} catch (error: any) {
		res.status(400).json({ message: error.message });
	}
});

export default router;
