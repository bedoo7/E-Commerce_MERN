import express from "express";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/authorize.middleware";
import { getAllBrands, createBrand } from "../services/brandService";

const router = express.Router();

router.get("/", async (_req, res) => {
	try {
		const brands = await getAllBrands();
		res.status(200).json(brands);
	} catch (error: any) {
		res.status(400).json({ message: error.message });
	}
});

router.post("/", authenticate, authorize("admin"), async (req, res) => {
	try {
		const { name } = req.body;
		if (!name) {
			return res.status(400).json({ message: "Brand name is required" });
		}
		const brand = await createBrand(name);
		res.status(201).json({ name: brand });
	} catch (error: any) {
		res.status(400).json({ message: error.message });
	}
});

export default router;
