"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBrand = exports.createBrand = exports.getAllBrands = exports.normalizeName = void 0;
const productModel_1 = require("../models/productModel");
// Normalize a brand name: trim spaces, capitalize first letter of each word
const normalizeName = (name) => {
    return name
        .trim()
        .replace(/\s+/g, " ")
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");
};
exports.normalizeName = normalizeName;
const getAllBrands = async () => {
    const brands = await productModel_1.productModel.distinct("brand");
    return brands.sort();
};
exports.getAllBrands = getAllBrands;
const createBrand = async (name) => {
    const normalized = (0, exports.normalizeName)(name);
    if (!normalized) {
        throw new Error("Brand name is required");
    }
    // Check if brand already exists (case-insensitive)
    const existing = await productModel_1.productModel.findOne({
        brand: {
            $regex: new RegExp(`^${normalized.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"),
        },
    });
    if (existing) {
        throw new Error(`Brand "${normalized}" already exists`);
    }
    // Create a dummy product to establish the brand, or just return the name
    // Brands are derived from products, so we just validate uniqueness
    return normalized;
};
exports.createBrand = createBrand;
const deleteBrand = async (name) => {
    const normalized = (0, exports.normalizeName)(name);
    const count = await productModel_1.productModel.countDocuments({ brand: normalized });
    if (count > 0) {
        throw new Error(`Cannot delete brand "${normalized}". ${count} product(s) use this brand.`);
    }
};
exports.deleteBrand = deleteBrand;
