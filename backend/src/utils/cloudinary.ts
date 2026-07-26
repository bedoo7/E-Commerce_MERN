import { v2 as cloudinary } from "cloudinary";
import { UploadApiResponse } from "cloudinary";

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "",
	api_key: process.env.CLOUDINARY_API_KEY || "",
	api_secret: process.env.CLOUDINARY_API_SECRET || "",
});

interface UploadResult {
	url: string;
	publicId: string;
}

export const uploadToCloudinary = async (
	file: Express.Multer.File,
	folder: string = "e-commerce",
): Promise<UploadResult> => {
	return new Promise((resolve, reject) => {
		const stream = cloudinary.uploader.upload_stream(
			{
				folder,
				resource_type: "image",
				transformation: [{ quality: "auto", fetch_format: "auto" }],
			},
			(error: any, result: UploadApiResponse | undefined) => {
				if (error) {
					reject(new Error(error.message || "Upload failed"));
				} else if (result) {
					resolve({ url: result.secure_url, publicId: result.public_id });
				} else {
					reject(new Error("Upload failed - no result"));
				}
			},
		);
		stream.end(file.buffer);
	});
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
	try {
		await cloudinary.uploader.destroy(publicId);
	} catch (error: any) {
		console.error("Error deleting from Cloudinary:", error.message);
	}
};

export default cloudinary;
