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
    const { firstName, lastName, email, password, role } = req.body;
    try {
        const user = await (0, userServices_1.registerUser)({
            firstName,
            lastName,
            email,
            password,
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
//to test the authentication and authorization middleware
router.get("/profile", auth_middleware_1.authenticate, (req, res) => {
    try {
        res.json({
            message: "Welcome you are authenticated",
        });
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
        const user = await (0, userServices_1.getmebytoken)(req, res);
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
exports.default = router;
