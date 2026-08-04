"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const productService_1 = require("../services/productService");
const auth_middleware_1 = require("../middleware/auth.middleware");
const authorize_middleware_1 = require("../middleware/authorize.middleware");
const router = express_1.default.Router();
router.get("/", async (req, res) => {
    try {
        const result = await (0, productService_1.getAllProducts)(req.query);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
router.get("/categories", async (_req, res) => {
    try {
        const categories = await (0, productService_1.getProductCategories)();
        res.status(200).json(categories);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
router.get("/brands", async (_req, res) => {
    try {
        const brands = await (0, productService_1.getProductBrands)();
        res.status(200).json(brands);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
router.get("/:id", async (req, res) => {
    try {
        const product = await (0, productService_1.getProductById)(req.params.id);
        res.status(200).json(product);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
router.get("/:id/related", async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 4;
        const related = await (0, productService_1.getRelatedProducts)(req.params.id, limit);
        res.status(200).json(related);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
router.post("/", auth_middleware_1.authenticate, (0, authorize_middleware_1.authorize)("admin"), async (req, res) => {
    try {
        const product = await (0, productService_1.createProduct)(req.body);
        res.status(201).json(product);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
router.put("/:id", auth_middleware_1.authenticate, (0, authorize_middleware_1.authorize)("admin"), async (req, res) => {
    try {
        const product = await (0, productService_1.updateProduct)(req.params.id, req.body);
        res.status(200).json(product);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
router.delete("/:id", auth_middleware_1.authenticate, (0, authorize_middleware_1.authorize)("admin"), async (req, res) => {
    try {
        const result = await (0, productService_1.deleteProduct)(req.params.id);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.default = router;
