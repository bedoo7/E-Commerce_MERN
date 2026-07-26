import { productModel } from "../models/productModel";
import { normalizeName } from "./brandService";

export const getAllCategories = async (): Promise<string[]> => {
	const categories = await productModel.distinct("category");
	return categories.sort();
};

export const createCategory = async (name: string): Promise<string> => {
	const normalized = normalizeName(name);
	if (!normalized) {
		throw new Error("Category name is required");
	}

	const existing = await productModel.findOne({
		category: {
			$regex: new RegExp(
				`^${normalized.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
				"i",
			),
		},
	});

	if (existing) {
		throw new Error(`Category "${normalized}" already exists`);
	}

	return normalized;
};

export const deleteCategory = async (name: string): Promise<void> => {
	const normalized = normalizeName(name);
	const count = await productModel.countDocuments({ category: normalized });
	if (count > 0) {
		throw new Error(
			`Cannot delete category "${normalized}". ${count} product(s) use this category.`,
		);
	}
};
