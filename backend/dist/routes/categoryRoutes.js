"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const authorize_middleware_1 = require("../middleware/authorize.middleware");
const categoryService_1 = require("../services/categoryService");
const router = express_1.default.Router();
router.get("/", async (_req, res) => {
    try {
        const categories = await (0, categoryService_1.getAllCategories)();
        res.status(200).json(categories);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
router.post("/", auth_middleware_1.authenticate, (0, authorize_middleware_1.authorize)("admin"), async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ message: "Category name is required" });
        }
        const category = await (0, categoryService_1.createCategory)(name);
        res.status(201).json({ name: category });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.default = router;
