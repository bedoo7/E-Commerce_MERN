import express from "express";
import {
	getAllUsers,
	getmebytoken,
	getProfile,
	updateProfile,
	loginUser,
	registerUser,
	updateUser,
	deleteUser,
	deleteOwnAccount,
	toggleUserActive,
	verifyEmail,
} from "../services/userServices";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/authorize.middleware";

const router = express.Router();

router.post("/register", async (req, res) => {
	const { firstName, lastName, email, password, confirmPassword, role } = req.body;
		try {
			const user = await registerUser({
				firstName,
				lastName,
				email,
				password,
				confirmPassword,
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

router.post("/verify-email", async (req, res) => {
	const { token } = req.body;
	try {
		const result = await verifyEmail(token);
		res.status(200).json(result);
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

// Get current user profile
router.get("/profile", authenticate, async (req: any, res) => {
	try {
		const user = await getProfile(req.user.id);
		res.status(200).json(user);
	} catch (error: any) {
		res.status(400).json({ message: error.message });
	}
});

// Update current user profile
router.put("/profile", authenticate, async (req: any, res) => {
	try {
		const allowedFields = ["firstName", "lastName", "email", "phone", "address"];
		const updateData: Record<string, any> = {};
		Object.keys(req.body).forEach((key) => {
			if (allowedFields.includes(key)) {
				updateData[key] = req.body[key];
			}
		});
		const user = await updateProfile(req.user.id, updateData);
		res.status(200).json(user);
	} catch (error: any) {
		res.status(400).json({ message: error.message });
	}
});

// Delete own account
router.delete("/profile", authenticate, async (req: any, res) => {
	try {
		const result = await deleteOwnAccount(req.user.id);
		res.status(200).json(result);
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

router.get("/getmebytoken", authenticate, async (req: any, res) => {
	try {
		const user = await getmebytoken(req.user.id);
		res.status(200).json(user);
	} catch (error: any) {
		res.status(400).json({ message: error.message });
	}
});

router.get(
	"/getAllUsers",
	authenticate,
	authorize("admin"),
	async (req, res) => {
		try {
			const usersData = await getAllUsers(req.query);
			res.status(200).json(usersData);
		} catch (error: any) {
			res.status(400).json({ message: error.message });
		}
	},
);

// Admin: Update user
router.put("/:id", authenticate, authorize("admin"), async (req: any, res) => {
	try {
		const user = await updateUser(req.params.id as string, req.body);
		res.status(200).json(user);
	} catch (error: any) {
		res.status(400).json({ message: error.message });
	}
});

// Admin: Delete user
router.delete(
	"/:id",
	authenticate,
	authorize("admin"),
	async (req: any, res) => {
		try {
			const result = await deleteUser(req.params.id as string);
			res.status(200).json(result);
		} catch (error: any) {
			res.status(400).json({ message: error.message });
		}
	},
);

// Admin: Toggle user active status
router.put(
	"/:id/toggle-active",
	authenticate,
	authorize("admin"),
	async (req: any, res) => {
		try {
			const result = await toggleUserActive(req.params.id as string);
			res.status(200).json(result);
		} catch (error: any) {
			res.status(400).json({ message: error.message });
		}
	},
);

export default router;
