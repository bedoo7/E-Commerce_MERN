"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelOrder = exports.updateOrderStatus = exports.getOrderById = exports.getAllOrders = exports.getUserOrders = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const orderModel_1 = require("../models/orderModel");
const productModel_1 = require("../models/productModel");
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
    // Ensure every order has a status field (for orders created before status was added to schema)
    const ordersWithStatus = orders.map((order) => ({
        ...order,
        status: (order.status || "pending"),
    }));
    return (0, pagination_1.buildPaginatedResponse)(ordersWithStatus, totalItems, page, limit);
};
exports.getUserOrders = getUserOrders;
const getAllOrders = async (queryParams = {}) => {
    try {
        const { page, limit, skip, sortBy, sortOrder } = (0, pagination_1.parsePaginationParams)(queryParams);
        const match = {};
        if (queryParams.search && queryParams.search.trim()) {
            const searchRegex = new RegExp(queryParams.search.trim(), "i");
            match.$or = [
                { orderNumber: searchRegex },
                { address: searchRegex },
                { "orderItems.productTitle": searchRegex },
            ];
        }
        if (queryParams.status) {
            match.status = queryParams.status;
        }
        if (queryParams.minPrice !== undefined ||
            queryParams.maxPrice !== undefined) {
            match.totalAmount = {};
            if (queryParams.minPrice !== undefined && queryParams.minPrice !== "") {
                match.totalAmount.$gte = Number(queryParams.minPrice);
            }
            if (queryParams.maxPrice !== undefined && queryParams.maxPrice !== "") {
                match.totalAmount.$lte = Number(queryParams.maxPrice);
            }
        }
        if (queryParams.startDate) {
            match.createdAt = match.createdAt || {};
            match.createdAt.$gte = new Date(queryParams.startDate);
        }
        if (queryParams.endDate) {
            match.createdAt = match.createdAt || {};
            match.createdAt.$lte = new Date(queryParams.endDate);
        }
        const allowedSortFields = ["createdAt", "totalAmount"];
        const sortField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
        const pipeline = [
            { $match: match },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "userLookup",
                },
            },
            { $unwind: { path: "$userLookup", preserveNullAndEmptyArrays: true } },
        ];
        if (queryParams.search && queryParams.search.trim()) {
            const searchRegex = new RegExp(queryParams.search.trim(), "i");
            pipeline[0].$match.$or = [
                { orderNumber: searchRegex },
                { address: searchRegex },
                { "orderItems.productTitle": searchRegex },
                { "userLookup.firstName": searchRegex },
                { "userLookup.lastName": searchRegex },
                { "userLookup.email": searchRegex },
            ];
        }
        pipeline.push({ $sort: { [sortField]: sortOrder } }, { $skip: skip }, { $limit: limit });
        const [orders, totalItems] = await Promise.all([
            orderModel_1.orderModel.aggregate(pipeline),
            orderModel_1.orderModel.countDocuments(match),
        ]);
        const ordersWithStatus = orders.map((order) => ({
            ...order,
            userId: order.userLookup
                ? {
                    _id: order.userLookup._id,
                    firstName: order.userLookup.firstName,
                    lastName: order.userLookup.lastName,
                    email: order.userLookup.email,
                }
                : order.userId,
            status: (order.status || "pending"),
        }));
        return (0, pagination_1.buildPaginatedResponse)(ordersWithStatus, totalItems, page, limit);
    }
    catch (error) {
        throw new Error(error.message);
    }
};
exports.getAllOrders = getAllOrders;
const getOrderById = async (orderId, userId) => {
    try {
        const filter = { _id: orderId };
        if (userId) {
            filter.userId = userId;
        }
        const order = await orderModel_1.orderModel
            .findById(orderId)
            .populate("userId", "firstName lastName email")
            .lean();
        if (!order) {
            throw new Error("Order not found");
        }
        return {
            ...order,
            status: (order.status || "pending"),
        };
    }
    catch (error) {
        throw new Error(error.message);
    }
};
exports.getOrderById = getOrderById;
const updateOrderStatus = async (orderId, status) => {
    try {
        const validStatuses = [
            "pending",
            "processing",
            "shipped",
            "delivered",
            "cancelled",
        ];
        if (!validStatuses.includes(status)) {
            throw new Error(`Invalid status. Must be one of: ${validStatuses.join(", ")}`);
        }
        if (status === "cancelled") {
            const updatedOrder = await orderModel_1.orderModel
                .findOneAndUpdate({ _id: orderId, status: { $ne: "cancelled" } }, {
                status: "cancelled",
                cancelledAt: new Date(),
            }, { new: true })
                .populate("userId", "firstName lastName email")
                .lean();
            if (!updatedOrder) {
                throw new Error("Cannot update a cancelled order.");
            }
            for (const item of updatedOrder.orderItems) {
                await productModel_1.productModel.findOneAndUpdate({ name: item.productTitle }, { $inc: { stock: item.quantity } });
            }
            return updatedOrder;
        }
        const order = await orderModel_1.orderModel.findById(orderId).lean();
        if (!order) {
            throw new Error("Order not found");
        }
        if (order.status === "cancelled") {
            throw new Error("Cannot update a cancelled order.");
        }
        const updatedOrder = await orderModel_1.orderModel
            .findByIdAndUpdate(orderId, { status }, { new: true })
            .populate("userId", "firstName lastName email")
            .lean();
        return updatedOrder;
    }
    catch (error) {
        throw new Error(error.message);
    }
};
exports.updateOrderStatus = updateOrderStatus;
const cancelOrder = async (orderId, userId, cancelReason) => {
    try {
        const updatedOrder = await orderModel_1.orderModel
            .findOneAndUpdate({
            _id: orderId,
            userId: new mongoose_1.default.Types.ObjectId(userId),
            status: "pending",
        }, {
            status: "cancelled",
            cancelledAt: new Date(),
            cancelledBy: userId,
            cancelReason,
        }, { new: true })
            .populate("userId", "firstName lastName email")
            .lean();
        if (!updatedOrder) {
            const existingOrder = await orderModel_1.orderModel.findById(orderId).lean();
            if (!existingOrder) {
                throw new Error("Order not found");
            }
            if (existingOrder.status === "cancelled") {
                throw new Error("Order is already cancelled");
            }
            throw new Error(`Cannot cancel order with status "${existingOrder.status}". Only pending orders can be cancelled.`);
        }
        for (const item of updatedOrder.orderItems) {
            await productModel_1.productModel.findOneAndUpdate({ name: item.productTitle }, { $inc: { stock: item.quantity } });
        }
        return updatedOrder;
    }
    catch (error) {
        throw new Error(error.message);
    }
};
exports.cancelOrder = cancelOrder;
