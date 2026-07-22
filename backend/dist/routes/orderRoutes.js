"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const authorize_middleware_1 = require("../middleware/authorize.middleware");
const orderService_1 = require("../services/orderService");
const router = express_1.default.Router();
router.get("/my-orders", auth_middleware_1.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const orders = await (0, orderService_1.getUserOrders)(userId, req.query);
        res.status(200).json(orders);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
router.get("/admin/all", auth_middleware_1.authenticate, (0, authorize_middleware_1.authorize)("admin"), async (req, res) => {
    try {
        const orders = await (0, orderService_1.getAllOrders)(req.query);
        res.status(200).json(orders);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.default = router;
