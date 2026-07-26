import { productModel } from "../models/productModel";

// Normalize a brand name: trim spaces, capitalize first letter of each word
export const normalizeName = (name: string): string => {
	return name
		.trim()
		.replace(/\s+/g, " ")
		.split(" ")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join(" ");
};

export const getAllBrands = async (): Promise<string[]> => {
	const brands = await productModel.distinct("brand");
	return brands.sort();
};

export const createBrand = async (name: string): Promise<string> => {
	const normalized = normalizeName(name);
	if (!normalized) {
		throw new Error("Brand name is required");
	}

	// Check if brand already exists (case-insensitive)
	const existing = await productModel.findOne({
		brand: {
			$regex: new RegExp(
				`^${normalized.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
				"i",
			),
		},
	});

	if (existing) {
		throw new Error(`Brand "${normalized}" already exists`);
	}

	// Create a dummy product to establish the brand, or just return the name
	// Brands are derived from products, so we just validate uniqueness
	return normalized;
};

export const deleteBrand = async (name: string): Promise<void> => {
	const normalized = normalizeName(name);
	const count = await productModel.countDocuments({ brand: normalized });
	if (count > 0) {
		throw new Error(
			`Cannot delete brand "${normalized}". ${count} product(s) use this brand.`,
		);
	}
};
