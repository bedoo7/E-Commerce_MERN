import express from "express";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/authorize.middleware";
import { getDashboardAnalytics } from "../services/analyticsService";

const router = express.Router();

router.get(
	"/dashboard",
	authenticate,
	authorize("admin"),
	async (_req, res) => {
		try {
			const analytics = await getDashboardAnalytics();
			res.status(200).json(analytics);
		} catch (error: any) {
			res.status(400).json({ message: error.message });
		}
	},
);

export default router;
