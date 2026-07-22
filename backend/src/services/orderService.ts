import { orderModel, IOrder } from "../models/orderModel";
import {
	buildPaginatedResponse,
	parsePaginationParams,
	PaginatedResponse,
} from "../utils/pagination";

export interface OrderQueryParams {
	page?: string | number;
	limit?: string | number;
	search?: string;
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
	const { page, limit, skip, sortBy, sortOrder } =
		parsePaginationParams(queryParams);

	const filter: Record<string, any> = {};

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
			.populate("userId", "firstName lastName email")
			.sort({ [sortField]: sortOrder })
			.skip(skip)
			.limit(limit)
			.lean(),
		orderModel.countDocuments(filter),
	]);

	// Ensure every order has a status field
	const ordersWithStatus = orders.map((order) => ({
		...order,
		status: (order.status || "pending") as IOrder["status"],
	})) as unknown as IOrder[];

	return buildPaginatedResponse(ordersWithStatus, totalItems, page, limit);
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
		const order = await orderModel
			.findByIdAndUpdate(orderId, { status }, { new: true })
			.populate("userId", "firstName lastName email")
			.lean();
		if (!order) {
			throw new Error("Order not found");
		}
		return order;
	} catch (error: any) {
		throw new Error(error.message);
	}
};
