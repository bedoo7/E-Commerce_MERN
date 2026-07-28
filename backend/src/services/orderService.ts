import mongoose from "mongoose";
import { orderModel, IOrder } from "../models/orderModel";
import { productModel } from "../models/productModel";
import {
	buildPaginatedResponse,
	parsePaginationParams,
	PaginatedResponse,
} from "../utils/pagination";

export interface OrderQueryParams {
	page?: string | number;
	limit?: string | number;
	search?: string;
	status?: string;
	minPrice?: string | number;
	maxPrice?: string | number;
	startDate?: string;
	endDate?: string;
	sortBy?: string;
	sortOrder?: string;
}

export const getUserOrders = async (
	userId: string,
	queryParams: OrderQueryParams = {},
): Promise<PaginatedResponse<IOrder>> => {
	const { page, limit, skip, sortBy, sortOrder } =
		parsePaginationParams(queryParams);

	const filter: Record<string, any> = { userId };

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
		orderModel
			.find(filter)
			.sort({ [sortField]: sortOrder })
			.skip(skip)
			.limit(limit)
			.lean(),
		orderModel.countDocuments(filter),
	]);

	// Ensure every order has a status field (for orders created before status was added to schema)
	const ordersWithStatus = orders.map((order) => ({
		...order,
		status: (order.status || "pending") as IOrder["status"],
	})) as unknown as IOrder[];

	return buildPaginatedResponse(ordersWithStatus, totalItems, page, limit);
};

export const getAllOrders = async (
	queryParams: OrderQueryParams = {},
): Promise<PaginatedResponse<IOrder>> => {
	try {
		const { page, limit, skip, sortBy, sortOrder } =
			parsePaginationParams(queryParams);

		const match: Record<string, any> = {};

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

		if (
			queryParams.minPrice !== undefined ||
			queryParams.maxPrice !== undefined
		) {
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

		const pipeline: any[] = [
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

		pipeline.push(
			{ $sort: { [sortField]: sortOrder } },
			{ $skip: skip },
			{ $limit: limit },
		);

		const [orders, totalItems] = await Promise.all([
			orderModel.aggregate(pipeline),
			orderModel.countDocuments(match),
		]);

		const ordersWithStatus = orders.map((order: any) => ({
			...order,
			userId: order.userLookup
				? {
						_id: order.userLookup._id,
						firstName: order.userLookup.firstName,
						lastName: order.userLookup.lastName,
						email: order.userLookup.email,
					}
				: order.userId,
			status: (order.status || "pending") as IOrder["status"],
		}));

		return buildPaginatedResponse(
			ordersWithStatus as IOrder[],
			totalItems,
			page,
			limit,
		);
	} catch (error: any) {
		throw new Error(error.message);
	}
};

export const getOrderById = async (orderId: string, userId?: string) => {
	try {
		const filter: Record<string, any> = { _id: orderId };
		if (userId) {
			filter.userId = userId;
		}
		const order = await orderModel
			.findById(orderId)
			.populate("userId", "firstName lastName email")
			.lean();
		if (!order) {
			throw new Error("Order not found");
		}
		return {
			...order,
			status: (order.status || "pending") as IOrder["status"],
		};
	} catch (error: any) {
		throw new Error(error.message);
	}
};

export const updateOrderStatus = async (orderId: string, status: string) => {
	try {
		const validStatuses = [
			"pending",
			"processing",
			"shipped",
			"delivered",
			"cancelled",
		];
		if (!validStatuses.includes(status)) {
			throw new Error(
				`Invalid status. Must be one of: ${validStatuses.join(", ")}`,
			);
		}

		if (status === "cancelled") {
			const updatedOrder = await orderModel
				.findOneAndUpdate(
					{ _id: orderId, status: { $ne: "cancelled" } },
					{
						status: "cancelled",
						cancelledAt: new Date(),
					},
					{ new: true },
				)
				.populate("userId", "firstName lastName email")
				.lean();

			if (!updatedOrder) {
				throw new Error("Cannot update a cancelled order.");
			}

			for (const item of updatedOrder.orderItems) {
				await productModel.findOneAndUpdate(
					{ name: item.productTitle },
					{ $inc: { stock: item.quantity } },
				);
			}

			return updatedOrder;
		}

		const order = await orderModel.findById(orderId).lean();
		if (!order) {
			throw new Error("Order not found");
		}

		if (order.status === "cancelled") {
			throw new Error("Cannot update a cancelled order.");
		}

		const updatedOrder = await orderModel
			.findByIdAndUpdate(orderId, { status }, { new: true })
			.populate("userId", "firstName lastName email")
			.lean();

		return updatedOrder;
	} catch (error: any) {
		throw new Error(error.message);
	}
};

export const cancelOrder = async (
	orderId: string,
	userId: string,
	cancelReason: string,
) => {
	try {
		const updatedOrder = await orderModel
			.findOneAndUpdate(
				{
					_id: orderId,
					userId: new mongoose.Types.ObjectId(userId),
					status: "pending",
				} as any,
				{
					status: "cancelled",
					cancelledAt: new Date(),
					cancelledBy: userId,
					cancelReason,
				},
				{ new: true },
			)
			.populate("userId", "firstName lastName email")
			.lean();

		if (!updatedOrder) {
			const existingOrder = await orderModel.findById(orderId).lean();
			if (!existingOrder) {
				throw new Error("Order not found");
			}
			if (existingOrder.status === "cancelled") {
				throw new Error("Order is already cancelled");
			}
			throw new Error(
				`Cannot cancel order with status "${existingOrder.status}". Only pending orders can be cancelled.`,
			);
		}

		for (const item of updatedOrder.orderItems) {
			await productModel.findOneAndUpdate(
				{ name: item.productTitle },
				{ $inc: { stock: item.quantity } },
			);
		}

		return updatedOrder;
	} catch (error: any) {
		throw new Error(error.message);
	}
};
