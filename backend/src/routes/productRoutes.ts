import express from "express";
import {
	getAllProducts,
	getProductBrands,
	getProductCategories,
	getProductById,
	createProduct,
	updateProduct,
	deleteProduct,
} from "../services/productService";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/authorize.middleware";

const router = express.Router();

router.get("/", async (req, res) => {
	try {
		const result = await getAllProducts(req.query);
		res.status(200).json(result);
	} catch (error: any) {
		res.status(400).json({ message: error.message });
	}
});

router.get("/categories", async (_req, res) => {
	try {
		const categories = await getProductCategories();
		res.status(200).json(categories);
	} catch (error: any) {
		res.status(400).json({ message: error.message });
	}
});

router.get("/brands", async (_req, res) => {
	try {
		const brands = await getProductBrands();
		res.status(200).json(brands);
	} catch (error: any) {
		res.status(400).json({ message: error.message });
	}
});

router.get("/:id", async (req, res) => {
	try {
		const product = await getProductById(req.params.id);
		res.status(200).json(product);
	} catch (error: any) {
		res.status(400).json({ message: error.message });
	}
});

router.post("/", authenticate, authorize("admin"), async (req, res) => {
	try {
		const product = await createProduct(req.body);
		res.status(201).json(product);
	} catch (error: any) {
		res.status(400).json({ message: error.message });
	}
});

router.put("/:id", authenticate, authorize("admin"), async (req, res) => {
	try {
		const product = await updateProduct(req.params.id as string, req.body);
		res.status(200).json(product);
	} catch (error: any) {
		res.status(400).json({ message: error.message });
	}
});

router.delete("/:id", authenticate, authorize("admin"), async (req, res) => {
	try {
		const result = await deleteProduct(req.params.id as string);
		res.status(200).json(result);
	} catch (error: any) {
		res.status(400).json({ message: error.message });
	}
});

export default router;
