import { orderModel } from "../models/orderModel";
import { productModel } from "../models/productModel";
import { userModel } from "../models/userModel";

export const getDashboardAnalytics = async () => {
	try {
		// Revenue calculations
		const revenueResult = await orderModel.aggregate([
			{ $match: { status: { $ne: "cancelled" } } },
			{
				$group: {
					_id: null,
					totalRevenue: { $sum: "$totalAmount" },
					totalOrders: { $sum: 1 },
					avgOrderValue: { $avg: "$totalAmount" },
				},
			},
		]);

		// Revenue by month (last 6 months)
		const sixMonthsAgo = new Date();
		sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

		const revenueByMonth = await orderModel.aggregate([
			{
				$match: {
					createdAt: { $gte: sixMonthsAgo },
					status: { $ne: "cancelled" },
				},
			},
			{
				$group: {
					_id: {
						year: { $year: "$createdAt" },
						month: { $month: "$createdAt" },
					},
					revenue: { $sum: "$totalAmount" },
					orders: { $sum: 1 },
				},
			},
			{ $sort: { "_id.year": 1, "_id.month": 1 } },
		]);

		// Orders by status
		const ordersByStatus = await orderModel.aggregate([
			{
				$group: {
					_id: "$status",
					count: { $sum: 1 },
				},
			},
		]);

		// Top selling products
		const topSelling = await orderModel.aggregate([
			{ $match: { status: { $ne: "cancelled" } } },
			{ $unwind: "$orderItems" },
			{
				$group: {
					_id: "$orderItems.productTitle",
					totalQuantity: { $sum: "$orderItems.quantity" },
					totalRevenue: {
						$sum: {
							$multiply: ["$orderItems.unitPrice", "$orderItems.quantity"],
						},
					},
				},
			},
			{ $sort: { totalQuantity: -1 } },
			{ $limit: 10 },
		]);

		// Low stock products
		const lowStockCount = await productModel.countDocuments({
			stock: { $lte: 5, $gt: 0 },
		});

		const outOfStockCount = await productModel.countDocuments({
			stock: { $lte: 0 },
		});

		const totalUsers = await userModel.countDocuments();
		const totalProducts = await productModel.countDocuments();

		const revenue = revenueResult[0] || {
			totalRevenue: 0,
			totalOrders: 0,
			avgOrderValue: 0,
		};

		// Format ordersByStatus into a clean object
		const statusMap: Record<string, number> = {
			pending: 0,
			processing: 0,
			shipped: 0,
			delivered: 0,
			cancelled: 0,
		};
		ordersByStatus.forEach((s) => {
			statusMap[s._id] = s.count;
		});

		return {
			revenue: {
				totalRevenue: revenue.totalRevenue,
				totalOrders: revenue.totalOrders,
				avgOrderValue: Math.round(revenue.avgOrderValue * 100) / 100,
			},
			revenueByMonth: revenueByMonth.map((r) => ({
				month: `${r._id.year}-${String(r._id.month).padStart(2, "0")}`,
				revenue: r.revenue,
				orders: r.orders,
			})),
			ordersByStatus: statusMap,
			topSelling,
			stock: {
				lowStock: lowStockCount,
				outOfStock: outOfStockCount,
			},
			totals: {
				users: totalUsers,
				products: totalProducts,
			},
		};
	} catch (error: any) {
		throw new Error(error.message);
	}
};
