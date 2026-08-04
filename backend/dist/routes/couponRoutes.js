"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const authorize_middleware_1 = require("../middleware/authorize.middleware");
const couponService_1 = require("../services/couponService");
const router = express_1.default.Router();
// Validate a coupon (authenticated users)
router.post("/validate", auth_middleware_1.authenticate, async (req, res) => {
    try {
        const { code, orderAmount } = req.body;
        if (!code) {
            return res.status(400).json({ message: "Coupon code is required" });
        }
        const userId = req.user?.id;
        const result = await (0, couponService_1.validateCoupon)(code, orderAmount || 0, userId);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
// Admin: Get all coupons with pagination
router.get("/", auth_middleware_1.authenticate, (0, authorize_middleware_1.authorize)("admin"), async (req, res) => {
    try {
        const coupons = await (0, couponService_1.getAllCoupons)(req.query);
        res.status(200).json(coupons);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
// Admin: Create a coupon
router.post("/", auth_middleware_1.authenticate, (0, authorize_middleware_1.authorize)("admin"), async (req, res) => {
    try {
        const coupon = await (0, couponService_1.createCoupon)(req.body);
        res.status(201).json(coupon);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
// Admin: Update a coupon
router.put("/:id", auth_middleware_1.authenticate, (0, authorize_middleware_1.authorize)("admin"), async (req, res) => {
    try {
        const coupon = await (0, couponService_1.updateCoupon)(String(req.params.id), req.body);
        res.status(200).json(coupon);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
// Admin: Delete a coupon
router.delete("/:id", auth_middleware_1.authenticate, (0, authorize_middleware_1.authorize)("admin"), async (req, res) => {
    try {
        const result = await (0, couponService_1.deleteCoupon)(String(req.params.id));
        res.status(200).json(result);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.default = router;
