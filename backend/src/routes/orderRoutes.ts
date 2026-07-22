import express, { Response } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/authorize.middleware";
import {
	getAllOrders,
	getOrderById,
	getUserOrders,
	updateOrderStatus,
} from "../services/orderService";

const router = express.Router();

router.get("/my-orders", authenticate, async (req: any, res: Response) => {
	try {
		const userId = req.user.id;
		const orders = await getUserOrders(userId, req.query);
		res.status(200).json(orders);
	} catch (error: any) {
		res.status(400).json({ message: error.message });
	}
});

router.get("/my-orders/:id", authenticate, async (req: any, res: Response) => {
	try {
		const order = await getOrderById(req.params.id, req.user.id);
		res.status(200).json(order);
	} catch (error: any) {
		res.status(400).json({ message: error.message });
	}
});

router.get(
	"/admin/all",
	authenticate,
	authorize("admin"),
	async (req: any, res: Response) => {
		try {
			const orders = await getAllOrders(req.query);
			res.status(200).json(orders);
		} catch (error: any) {
			res.status(400).json({ message: error.message });
		}
	},
);

router.put(
	"/admin/:id/status",
	authenticate,
	authorize("admin"),
	async (req: any, res: Response) => {
		try {
			const { status } = req.body;
			const order = await updateOrderStatus(req.params.id, status);
			res.status(200).json(order);
		} catch (error: any) {
			res.status(400).json({ message: error.message });
		}
	},
);

export default router;
