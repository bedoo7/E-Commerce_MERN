import express from "express";
import multer from "multer";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/authorize.middleware";
import { uploadToCloudinary } from "../utils/cloudinary";

const router = express.Router();

const storage = multer.memoryStorage();

const fileFilter = (
	_req: any,
	file: Express.Multer.File,
	cb: multer.FileFilterCallback,
) => {
	const allowedTypes = [
		"image/jpeg",
		"image/jpg",
		"image/png",
		"image/webp",
		"image/gif",
	];
	if (allowedTypes.includes(file.mimetype)) {
		cb(null, true);
	} else {
		cb(new Error("Only JPEG, PNG, WebP and GIF images are allowed"));
	}
};

const upload = multer({
	storage,
	fileFilter,
	limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

router.post(
	"/",
	authenticate,
	authorize("admin"),
	upload.single("image"),
	async (req: any, res) => {
		try {
			if (!req.file) {
				return res.status(400).json({ message: "No image file provided" });
			}

			const result = await uploadToCloudinary(req.file);
			res.status(200).json({ url: result.url, publicId: result.publicId });
		} catch (error: any) {
			res.status(400).json({ message: error.message || "Upload failed" });
		}
	},
);

export default router;
