"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const productService_1 = require("../services/productService");
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
exports.default = router;
