import express from "express";
import {
	getAllUsers,
	getmebytoken,
	loginUser,
	registerUser,
} from "../services/userServices";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/authorize.middleware";

const router = express.Router();

router.post("/register", async (req, res) => {
	const { firstName, lastName, email, password, role } = req.body;
	try {
		const user = await registerUser({
			firstName,
			lastName,
			email,
			password,
			role,
		});

		res.status(201).json(user);
	} catch (error: any) {
		res.status(400).json({ message: error.message });
	}
});

router.post("/login", async (req, res) => {
	const { email, password } = req.body;
	try {
		const user = await loginUser({ email, password });
		res.status(200).json(user);
	} catch (error: any) {
		res.status(400).json({ message: error.message });
	}
});

//to test the authentication and authorization middleware
router.get("/profile", authenticate, (req, res) => {
	try {
		res.json({
			message: "Welcome you are authenticated",
		});
	} catch (error: any) {
		res.status(400).json({ message: error.message });
	}
});

router.get("/admin", authenticate, authorize("admin"), (req, res) => {
	try {
		res.json({
			message: "Welcome Admin you are authenticated and authorized",
		});
	} catch (error: any) {
		res.status(400).json({ message: error.message });
	}
});

router.get("/getmebytoken", authenticate, async (req, res) => {
	try {
		const user = await getmebytoken(req, res);
		res.status(200).json(user);
	} catch (error: any) {
		res.status(400).json({ message: error.message });
	}
});

router.get("/getAllUsers", authenticate, async (req, res) => {
	try {
		const users = await getAllUsers();
		res.status(200).json(users);
	} catch (error: any) {
		res.status(400).json({ message: error.message });
	}
});

export default router;
