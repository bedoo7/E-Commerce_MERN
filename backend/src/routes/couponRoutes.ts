import express from "express";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/authorize.middleware";
import {
	validateCoupon,
	createCoupon,
	getAllCoupons,
	updateCoupon,
	deleteCoupon,
} from "../services/couponService";

const router = express.Router();

// Validate a coupon (authenticated users)
router.post("/validate", authenticate, async (req: any, res) => {
	try {
		const { code, orderAmount } = req.body;
		if (!code) {
			return res.status(400).json({ message: "Coupon code is required" });
		}
		const userId = req.user?.id;
		const result = await validateCoupon(code, orderAmount || 0, userId);
		res.status(200).json(result);
	} catch (error: any) {
		res.status(400).json({ message: error.message });
	}
});

// Admin: Get all coupons with pagination
router.get(
	"/",
	authenticate,
	authorize("admin"),
	async (req, res) => {
		try {
			const coupons = await getAllCoupons(req.query);
			res.status(200).json(coupons);
		} catch (error: any) {
			res.status(400).json({ message: error.message });
		}
	},
);

// Admin: Create a coupon
router.post("/", authenticate, authorize("admin"), async (req, res) => {
	try {
		const coupon = await createCoupon(req.body);
		res.status(201).json(coupon);
	} catch (error: any) {
		res.status(400).json({ message: error.message });
	}
});

// Admin: Update a coupon
router.put(
	"/:id",
	authenticate,
	authorize("admin"),
	async (req: any, res) => {
		try {
			const coupon = await updateCoupon(String(req.params.id), req.body);
			res.status(200).json(coupon);
		} catch (error: any) {
			res.status(400).json({ message: error.message });
		}
	},
);

// Admin: Delete a coupon
router.delete(
	"/:id",
	authenticate,
	authorize("admin"),
	async (req: any, res) => {
		try {
			const result = await deleteCoupon(String(req.params.id));
			res.status(200).json(result);
		} catch (error: any) {
			res.status(400).json({ message: error.message });
		}
	},
);

export default router;

