"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const authorize_middleware_1 = require("../middleware/authorize.middleware");
const cloudinary_1 = require("../utils/cloudinary");
const router = express_1.default.Router();
const storage = multer_1.default.memoryStorage();
const fileFilter = (_req, file, cb) => {
    const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "image/gif",
    ];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error("Only JPEG, PNG, WebP and GIF images are allowed"));
    }
};
const upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});
router.post("/", auth_middleware_1.authenticate, (0, authorize_middleware_1.authorize)("admin"), upload.single("image"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No image file provided" });
        }
        const result = await (0, cloudinary_1.uploadToCloudinary)(req.file);
        res.status(200).json({ url: result.url, publicId: result.publicId });
    }
    catch (error) {
        res.status(400).json({ message: error.message || "Upload failed" });
    }
});
exports.default = router;
