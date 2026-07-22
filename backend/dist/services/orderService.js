"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllOrders = exports.getUserOrders = void 0;
const orderModel_1 = require("../models/orderModel");
const pagination_1 = require("../utils/pagination");
const getUserOrders = async (userId, queryParams = {}) => {
    const { page, limit, skip, sortBy, sortOrder } = (0, pagination_1.parsePaginationParams)(queryParams);
    const filter = { userId };
    if (queryParams.search && queryParams.search.trim()) {
        const searchRegex = new RegExp(queryParams.search.trim(), "i");
        filter.$or = [
            { address: searchRegex },
            { "orderItems.productTitle": searchRegex },
        ];
    }
    const allowedSortFields = ["createdAt", "totalAmount"];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
    const [orders, totalItems] = await Promise.all([
        orderModel_1.orderModel
            .find(filter)
            .sort({ [sortField]: sortOrder })
            .skip(skip)
            .limit(limit)
            .lean(),
        orderModel_1.orderModel.countDocuments(filter),
    ]);
    return (0, pagination_1.buildPaginatedResponse)(orders, totalItems, page, limit);
};
exports.getUserOrders = getUserOrders;
const getAllOrders = async (queryParams = {}) => {
    const { page, limit, skip, sortBy, sortOrder } = (0, pagination_1.parsePaginationParams)(queryParams);
    const filter = {};
    if (queryParams.search && queryParams.search.trim()) {
        const searchRegex = new RegExp(queryParams.search.trim(), "i");
        filter.$or = [
            { address: searchRegex },
            { "orderItems.productTitle": searchRegex },
        ];
    }
    const allowedSortFields = ["createdAt", "totalAmount"];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
    const [orders, totalItems] = await Promise.all([
        orderModel_1.orderModel
            .find(filter)
            .populate("userId", "firstName lastName email")
            .sort({ [sortField]: sortOrder })
            .skip(skip)
            .limit(limit)
            .lean(),
        orderModel_1.orderModel.countDocuments(filter),
    ]);
    return (0, pagination_1.buildPaginatedResponse)(orders, totalItems, page, limit);
};
exports.getAllOrders = getAllOrders;
