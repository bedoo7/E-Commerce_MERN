"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const authorize_middleware_1 = require("../middleware/authorize.middleware");
const analyticsService_1 = require("../services/analyticsService");
const router = express_1.default.Router();
router.get("/dashboard", auth_middleware_1.authenticate, (0, authorize_middleware_1.authorize)("admin"), async (_req, res) => {
    try {
        const analytics = await (0, analyticsService_1.getDashboardAnalytics)();
        res.status(200).json(analytics);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.default = router;
