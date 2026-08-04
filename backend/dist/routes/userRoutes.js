"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userServices_1 = require("../services/userServices");
const auth_middleware_1 = require("../middleware/auth.middleware");
const authorize_middleware_1 = require("../middleware/authorize.middleware");
const router = express_1.default.Router();
router.post("/register", async (req, res) => {
    const { firstName, lastName, email, password, confirmPassword, role } = req.body;
    try {
        const user = await (0, userServices_1.registerUser)({
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            role,
        });
        res.status(201).json(user);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await (0, userServices_1.loginUser)({ email, password });
        res.status(200).json(user);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
router.post("/verify-email", async (req, res) => {
    const { token } = req.body;
    try {
        const result = await (0, userServices_1.verifyEmail)(token);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await (0, userServices_1.loginUser)({ email, password });
        res.status(200).json(user);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
// Get current user profile
router.get("/profile", auth_middleware_1.authenticate, async (req, res) => {
    try {
        const user = await (0, userServices_1.getProfile)(req.user.id);
        res.status(200).json(user);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
// Update current user profile
router.put("/profile", auth_middleware_1.authenticate, async (req, res) => {
    try {
        const allowedFields = ["firstName", "lastName", "email", "phone", "address"];
        const updateData = {};
        Object.keys(req.body).forEach((key) => {
            if (allowedFields.includes(key)) {
                updateData[key] = req.body[key];
            }
        });
        const user = await (0, userServices_1.updateProfile)(req.user.id, updateData);
        res.status(200).json(user);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
router.get("/admin", auth_middleware_1.authenticate, (0, authorize_middleware_1.authorize)("admin"), (req, res) => {
    try {
        res.json({
            message: "Welcome Admin you are authenticated and authorized",
        });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
router.get("/getmebytoken", auth_middleware_1.authenticate, async (req, res) => {
    try {
        const user = await (0, userServices_1.getmebytoken)(req.user.id);
        res.status(200).json(user);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
router.get("/getAllUsers", auth_middleware_1.authenticate, (0, authorize_middleware_1.authorize)("admin"), async (req, res) => {
    try {
        const usersData = await (0, userServices_1.getAllUsers)(req.query);
        res.status(200).json(usersData);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
// Admin: Update user
router.put("/:id", auth_middleware_1.authenticate, (0, authorize_middleware_1.authorize)("admin"), async (req, res) => {
    try {
        const user = await (0, userServices_1.updateUser)(req.params.id, req.body);
        res.status(200).json(user);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
// Admin: Delete user
router.delete("/:id", auth_middleware_1.authenticate, (0, authorize_middleware_1.authorize)("admin"), async (req, res) => {
    try {
        const result = await (0, userServices_1.deleteUser)(req.params.id);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
// Admin: Toggle user active status
router.put("/:id/toggle-active", auth_middleware_1.authenticate, (0, authorize_middleware_1.authorize)("admin"), async (req, res) => {
    try {
        const result = await (0, userServices_1.toggleUserActive)(req.params.id);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.default = router;
