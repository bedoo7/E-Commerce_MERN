import express from "express";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/authorize.middleware";
import { getAllCategories, createCategory } from "../services/categoryService";

const router = express.Router();

router.get("/", async (_req, res) => {
	try {
		const categories = await getAllCategories();
		res.status(200).json(categories);
	} catch (error: any) {
		res.status(400).json({ message: error.message });
	}
});

router.post("/", authenticate, authorize("admin"), async (req, res) => {
	try {
		const { name } = req.body;
		if (!name) {
			return res.status(400).json({ message: "Category name is required" });
		}
		const category = await createCategory(name);
		res.status(201).json({ name: category });
	} catch (error: any) {
		res.status(400).json({ message: error.message });
	}
});

export default router;
