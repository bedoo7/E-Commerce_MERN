import express from "express";
import { getAllProducts } from "../services/productService";

const router = express.Router();

router.get("/", async (req, res) => {
	try {
		const products = await getAllProducts();
		res.status(200).json(products);
	} catch (error: any) {
		res.status(400).json({ message: error.message });
	}
});

export default router;
