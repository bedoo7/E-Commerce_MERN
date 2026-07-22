"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedInitialProducts = exports.getProductBrands = exports.getProductCategories = exports.getAllProducts = void 0;
const productModel_1 = require("../models/productModel");
const pagination_1 = require("../utils/pagination");
const getAllProducts = async (queryParams = {}) => {
    const { page, limit, skip, sortBy, sortOrder } = (0, pagination_1.parsePaginationParams)(queryParams);
    const filter = {};
    // Search filter across name, brand, description
    if (queryParams.search && queryParams.search.trim()) {
        const searchRegex = new RegExp(queryParams.search.trim(), "i");
        filter.$or = [
            { name: searchRegex },
            { brand: searchRegex },
            { description: searchRegex },
            { category: searchRegex },
        ];
    }
    // Category filter
    if (queryParams.category && queryParams.category !== "All") {
        filter.category = queryParams.category;
    }
    // Brand filter
    if (queryParams.brand && queryParams.brand !== "All") {
        filter.brand = queryParams.brand;
    }
    // Price filter
    if (queryParams.minPrice !== undefined ||
        queryParams.maxPrice !== undefined) {
        filter.price = {};
        if (queryParams.minPrice !== undefined && queryParams.minPrice !== "") {
            filter.price.$gte = Number(queryParams.minPrice);
        }
        if (queryParams.maxPrice !== undefined && queryParams.maxPrice !== "") {
            filter.price.$lte = Number(queryParams.maxPrice);
        }
    }
    // In Stock filter
    if (queryParams.inStock === "true" || queryParams.inStock === true) {
        filter.stock = { $gt: 0 };
    }
    // Allowed sort fields
    const allowedSortFields = ["price", "createdAt", "name", "stock", "brand"];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
    const [products, totalItems] = await Promise.all([
        productModel_1.productModel
            .find(filter)
            .sort({ [sortField]: sortOrder })
            .skip(skip)
            .limit(limit)
            .lean(),
        productModel_1.productModel.countDocuments(filter),
    ]);
    return (0, pagination_1.buildPaginatedResponse)(products, totalItems, page, limit);
};
exports.getAllProducts = getAllProducts;
const getProductCategories = async () => {
    const categories = await productModel_1.productModel.distinct("category");
    return categories;
};
exports.getProductCategories = getProductCategories;
const getProductBrands = async () => {
    const brands = await productModel_1.productModel.distinct("brand");
    return brands;
};
exports.getProductBrands = getProductBrands;
const seedInitialProducts = async () => {
    try {
        const products = [
            {
                name: "iPhone 16 Pro Max",
                description: "Apple smartphone with A18 Pro chip, 48MP camera, and titanium frame.",
                price: 1299,
                category: "Phones",
                brand: "Apple",
                stock: 20,
                imageUrl: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&auto=format&fit=crop&q=80",
            },
            {
                name: "Galaxy S25 Ultra",
                description: "Samsung flagship smartphone with Snapdragon 8 Gen 4 and built-in S Pen.",
                price: 1199,
                category: "Phones",
                brand: "Samsung",
                stock: 15,
                imageUrl: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80",
            },
            {
                name: "MacBook Pro 16",
                description: "Apple M3 Max laptop with 36GB Unified Memory and Liquid Retina XDR display.",
                price: 2499,
                category: "Laptops",
                brand: "Apple",
                stock: 10,
                imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80",
            },
            {
                name: "Dell XPS 15",
                description: "High performance Intel i9 laptop with 4K OLED display for creators.",
                price: 1899,
                category: "Laptops",
                brand: "Dell",
                stock: 8,
                imageUrl: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&auto=format&fit=crop&q=80",
            },
            {
                name: "Sony WH-1000XM5",
                description: "Industry leading wireless noise canceling headphones with crystal clear calls.",
                price: 399,
                category: "Audio",
                brand: "Sony",
                stock: 30,
                imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
            },
            {
                name: "AirPods Pro 2",
                description: "Active Noise Cancellation, Transparency mode, and personalized Spatial Audio.",
                price: 249,
                category: "Audio",
                brand: "Apple",
                stock: 40,
                imageUrl: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&auto=format&fit=crop&q=80",
            },
            {
                name: "iPad Air M2",
                description: "Thin and light tablet powered by the Apple M2 chip with 10.9-inch Liquid Retina display.",
                price: 599,
                category: "Tablets",
                brand: "Apple",
                stock: 25,
                imageUrl: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop&q=80",
            },
            {
                name: "Samsung Galaxy Tab S9",
                description: "Premium Android tablet with Dynamic AMOLED 2X display and IP68 rating.",
                price: 799,
                category: "Tablets",
                brand: "Samsung",
                stock: 12,
                imageUrl: "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=600&auto=format&fit=crop&q=80",
            },
            {
                name: "Apple Watch Ultra 2",
                description: "The ultimate sports and adventure watch with precision dual-frequency GPS.",
                price: 799,
                category: "Wearables",
                brand: "Apple",
                stock: 18,
                imageUrl: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&auto=format&fit=crop&q=80",
            },
            {
                name: "Logitech MX Master 3S",
                description: "Ergonomic performance wireless mouse with 8K DPI tracking and quiet clicks.",
                price: 99,
                category: "Accessories",
                brand: "Logitech",
                stock: 50,
                imageUrl: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=80",
            },
            {
                name: "Keychron Q1 Pro",
                description: "Custom mechanical keyboard with QMK/VIA support and wireless Bluetooth.",
                price: 199,
                category: "Accessories",
                brand: "Keychron",
                stock: 22,
                imageUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80",
            },
            {
                name: "Asus ROG Swift 32 Ultra",
                description: "4K QD-OLED 240Hz gaming monitor with ultra-fast response time.",
                price: 1299,
                category: "Monitors",
                brand: "Asus",
                stock: 5,
                imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80",
            },
        ];
        const existingCount = await productModel_1.productModel.countDocuments();
        if (existingCount === 0) {
            await productModel_1.productModel.insertMany(products);
            console.log("Seeded initial products successfully.");
        }
    }
    catch (error) {
        console.error("Error seeding database:", error);
    }
};
exports.seedInitialProducts = seedInitialProducts;
