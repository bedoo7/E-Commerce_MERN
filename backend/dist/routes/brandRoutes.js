"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const authorize_middleware_1 = require("../middleware/authorize.middleware");
const brandService_1 = require("../services/brandService");
const router = express_1.default.Router();
router.get("/", async (_req, res) => {
    try {
        const brands = await (0, brandService_1.getAllBrands)();
        res.status(200).json(brands);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
router.post("/", auth_middleware_1.authenticate, (0, authorize_middleware_1.authorize)("admin"), async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ message: "Brand name is required" });
        }
        const brand = await (0, brandService_1.createBrand)(name);
        res.status(201).json({ name: brand });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.default = router;
