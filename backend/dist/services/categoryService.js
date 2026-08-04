"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.createCategory = exports.getAllCategories = void 0;
const productModel_1 = require("../models/productModel");
const brandService_1 = require("./brandService");
const getAllCategories = async () => {
    const categories = await productModel_1.productModel.distinct("category");
    return categories.sort();
};
exports.getAllCategories = getAllCategories;
const createCategory = async (name) => {
    const normalized = (0, brandService_1.normalizeName)(name);
    if (!normalized) {
        throw new Error("Category name is required");
    }
    const existing = await productModel_1.productModel.findOne({
        category: {
            $regex: new RegExp(`^${normalized.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"),
        },
    });
    if (existing) {
        throw new Error(`Category "${normalized}" already exists`);
    }
    return normalized;
};
exports.createCategory = createCategory;
const deleteCategory = async (name) => {
    const normalized = (0, brandService_1.normalizeName)(name);
    const count = await productModel_1.productModel.countDocuments({ category: normalized });
    if (count > 0) {
        throw new Error(`Cannot delete category "${normalized}". ${count} product(s) use this category.`);
    }
};
exports.deleteCategory = deleteCategory;
