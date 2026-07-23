import express from "express";
import { forgotPassword, resetPassword } from "../services/authService";

const router = express.Router();

router.post("/forgot-password", async (req, res) => {
	try {
		const { email } = req.body;
		if (!email) {
			return res.status(400).json({ message: "Email is required" });
		}
		const result = await forgotPassword(email);
		res.status(200).json(result);
	} catch (error: any) {
		res.status(400).json({ message: error.message });
	}
});

router.post("/reset-password", async (req, res) => {
	try {
		const { token, password } = req.body;
		if (!token || !password) {
			return res
				.status(400)
				.json({ message: "Token and password are required" });
		}
		const result = await resetPassword(token, password);
		res.status(200).json(result);
	} catch (error: any) {
		res.status(400).json({ message: error.message });
	}
});

export default router;
