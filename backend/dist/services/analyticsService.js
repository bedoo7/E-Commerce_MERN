"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardAnalytics = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const orderModel_1 = require("../models/orderModel");
const productModel_1 = require("../models/productModel");
const userModel_1 = require("../models/userModel");
const couponModel_1 = require("../models/couponModel");
const DAY = 24 * 60 * 60 * 1000;
async function dateRangeDays(days) {
    const end = new Date();
    const start = new Date(end.getTime() - days * DAY);
    return { start, end };
}
const getDashboardAnalytics = async () => {
    try {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekStart = new Date(now.getTime() - 7 * DAY);
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const yearStart = new Date(now.getFullYear(), 0, 1);
        const prevMonthStart = new Date(monthStart.getTime() - 30 * DAY);
        const nonCancelled = { status: { $ne: "cancelled" } };
        // ── Revenue ──────────────────────────────────────
        const revenueResult = await orderModel_1.orderModel.aggregate([
            { $match: nonCancelled },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$totalAmount" },
                    totalOrders: { $sum: 1 },
                    avgOrderValue: { $avg: "$totalAmount" },
                },
            },
        ]);
        const rev = revenueResult[0] || { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 };
        const todayRevResult = await orderModel_1.orderModel.aggregate([
            { $match: { ...nonCancelled, createdAt: { $gte: todayStart } } },
            { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" }, totalOrders: { $sum: 1 } } },
        ]);
        const revToday = todayRevResult[0] || { totalRevenue: 0, totalOrders: 0 };
        const weekRevResult = await orderModel_1.orderModel.aggregate([
            { $match: { ...nonCancelled, createdAt: { $gte: weekStart } } },
            { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" }, totalOrders: { $sum: 1 } } },
        ]);
        const revWeek = weekRevResult[0] || { totalRevenue: 0, totalOrders: 0 };
        const monthRevResult = await orderModel_1.orderModel.aggregate([
            { $match: { ...nonCancelled, createdAt: { $gte: monthStart } } },
            { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" }, totalOrders: { $sum: 1 } } },
        ]);
        const revMonth = monthRevResult[0] || { totalRevenue: 0, totalOrders: 0 };
        const yearRevResult = await orderModel_1.orderModel.aggregate([
            { $match: { ...nonCancelled, createdAt: { $gte: yearStart } } },
            { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" }, totalOrders: { $sum: 1 } } },
        ]);
        const revYear = yearRevResult[0] || { totalRevenue: 0, totalOrders: 0 };
        // Revenue growth % (this month vs previous month)
        const prevMonthRevResult = await orderModel_1.orderModel.aggregate([
            { $match: { ...nonCancelled, createdAt: { $gte: prevMonthStart, $lt: monthStart } } },
            { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } },
        ]);
        const prevMonthTotal = prevMonthRevResult[0]?.totalRevenue || 0;
        const revenueGrowth = prevMonthTotal > 0 ? Math.round(((revMonth.totalRevenue - prevMonthTotal) / prevMonthTotal) * 10000) / 100 : 0;
        // Daily Revenue (last 30 days)
        const dailyRevStart = new Date(now.getTime() - 30 * DAY);
        const dailyRevenue = await orderModel_1.orderModel.aggregate([
            { $match: { ...nonCancelled, createdAt: { $gte: dailyRevStart } } },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" },
                        day: { $dayOfMonth: "$createdAt" },
                    },
                    revenue: { $sum: "$totalAmount" },
                    orders: { $sum: 1 },
                },
            },
            { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
        ]);
        // Weekly Revenue (last 12 weeks)
        const weeklyRevStart = new Date(now.getTime() - 84 * DAY);
        const weeklyRevenue = await orderModel_1.orderModel.aggregate([
            { $match: { ...nonCancelled, createdAt: { $gte: weeklyRevStart } } },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        week: { $isoWeek: "$createdAt" },
                    },
                    revenue: { $sum: "$totalAmount" },
                    orders: { $sum: 1 },
                },
            },
            { $sort: { "_id.year": 1, "_id.week": 1 } },
        ]);
        // Monthly Revenue (last 12 months)
        const monthlyRevStart = new Date(now.getTime() - 365 * DAY);
        const monthlyRevenue = await orderModel_1.orderModel.aggregate([
            { $match: { ...nonCancelled, createdAt: { $gte: monthlyRevStart } } },
            {
                $group: {
                    _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
                    revenue: { $sum: "$totalAmount" },
                    orders: { $sum: 1 },
                },
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } },
        ]);
        // Yearly Revenue
        const yearlyRevenue = await orderModel_1.orderModel.aggregate([
            { $match: nonCancelled },
            {
                $group: {
                    _id: { year: { $year: "$createdAt" } },
                    revenue: { $sum: "$totalAmount" },
                    orders: { $sum: 1 },
                },
            },
            { $sort: { "_id.year": 1 } },
        ]);
        // ── Orders Analytics ─────────────────────────────
        const ordersTodayCount = await orderModel_1.orderModel.countDocuments({ createdAt: { $gte: todayStart } });
        const ordersThisWeekCount = await orderModel_1.orderModel.countDocuments({ createdAt: { $gte: weekStart } });
        const ordersThisMonthCount = await orderModel_1.orderModel.countDocuments({ createdAt: { $gte: monthStart } });
        const totalOrdersAll = await orderModel_1.orderModel.countDocuments({});
        // Orders by status (from orders)
        const ordersByStatusResult = await orderModel_1.orderModel.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } },
        ]);
        const statusMap = {
            pending: 0,
            processing: 0,
            shipped: 0,
            delivered: 0,
            cancelled: 0,
        };
        ordersByStatusResult.forEach((s) => {
            statusMap[s._id] = s.count;
        });
        // Completion rate
        const deliveredCount = await orderModel_1.orderModel.countDocuments({ status: "delivered" });
        const completionRate = totalOrdersAll > 0 ? Math.round((deliveredCount / totalOrdersAll) * 10000) / 100 : 0;
        // Cancellation rate
        const cancelledCount = await orderModel_1.orderModel.countDocuments({ status: "cancelled" });
        const cancellationRate = totalOrdersAll > 0 ? Math.round((cancelledCount / totalOrdersAll) * 10000) / 100 : 0;
        // Orders over time (daily, last 30 days)
        const ordersOverTime = await orderModel_1.orderModel.aggregate([
            { $match: { createdAt: { $gte: dailyRevStart } } },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" },
                        day: { $dayOfMonth: "$createdAt" },
                    },
                    orders: { $sum: 1 },
                },
            },
            { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
        ]);
        // ── Products Analytics ───────────────────────────
        const totalProductsCount = await productModel_1.productModel.countDocuments();
        const activeProductsCount = await productModel_1.productModel.countDocuments({ stock: { $gt: 0 } });
        const outOfStockCount = await productModel_1.productModel.countDocuments({ stock: { $lte: 0 } });
        const lowStockCount = await productModel_1.productModel.countDocuments({ stock: { $lte: 5, $gt: 0 } });
        // Best Selling Products (by quantity)
        const bestSelling = await orderModel_1.orderModel.aggregate([
            { $match: { status: { $ne: "cancelled" } } },
            { $unwind: "$orderItems" },
            {
                $group: {
                    _id: "$orderItems.productTitle",
                    productImage: { $first: "$orderItems.productImage" },
                    totalQuantity: { $sum: "$orderItems.quantity" },
                    totalRevenue: { $sum: { $multiply: ["$orderItems.unitPrice", "$orderItems.quantity"] } },
                },
            },
            { $sort: { totalQuantity: -1 } },
            { $limit: 10 },
        ]);
        // Worst Selling Products (lowest quantity among sold)
        const worstSelling = await orderModel_1.orderModel.aggregate([
            { $match: { status: { $ne: "cancelled" } } },
            { $unwind: "$orderItems" },
            {
                $group: {
                    _id: "$orderItems.productTitle",
                    productImage: { $first: "$orderItems.productImage" },
                    totalQuantity: { $sum: "$orderItems.quantity" },
                    totalRevenue: { $sum: { $multiply: ["$orderItems.unitPrice", "$orderItems.quantity"] } },
                },
            },
            { $sort: { totalQuantity: 1 } },
            { $limit: 10 },
        ]);
        // Never Ordered Products
        const soldProductNamesResult = await orderModel_1.orderModel.aggregate([
            { $match: { status: { $ne: "cancelled" } } },
            { $unwind: "$orderItems" },
            { $group: { _id: "$orderItems.productTitle" } },
        ]);
        const soldNames = soldProductNamesResult.map((p) => p._id);
        const neverOrderedProducts = await productModel_1.productModel.find({ name: { $nin: soldNames } }).limit(10).lean();
        // Low Stock Products (detailed)
        const lowStockDetails = await productModel_1.productModel.find({ stock: { $lte: 5, $gt: 0 } }).limit(10).lean();
        // Out of Stock Products (detailed)
        const outOfStockDetails = await productModel_1.productModel.find({ stock: { $lte: 0 } }).limit(10).lean();
        // Highest Revenue Products
        const highestRevenue = await orderModel_1.orderModel.aggregate([
            { $match: { status: { $ne: "cancelled" } } },
            { $unwind: "$orderItems" },
            {
                $group: {
                    _id: "$orderItems.productTitle",
                    productImage: { $first: "$orderItems.productImage" },
                    totalRevenue: { $sum: { $multiply: ["$orderItems.unitPrice", "$orderItems.quantity"] } },
                    totalQuantity: { $sum: "$orderItems.quantity" },
                },
            },
            { $sort: { totalRevenue: -1 } },
            { $limit: 10 },
        ]);
        // Recently Added Products
        const recentlyAdded = await productModel_1.productModel.find().sort({ createdAt: -1 }).limit(10).lean();
        // ── Inventory ────────────────────────────────────
        const inventoryLow = await productModel_1.productModel.find({ stock: { $lte: 5, $gt: 0 } }).select("name stock category").lean();
        const inventoryOutOfStock = await productModel_1.productModel.find({ stock: { $lte: 0 } }).select("name stock category").lean();
        // ── Customer Analytics ───────────────────────────
        const totalUsersCount = await userModel_1.userModel.countDocuments();
        const newUsersTodayCount = await userModel_1.userModel.countDocuments({ createdAt: { $gte: todayStart } });
        const newUsersThisMonthCount = await userModel_1.userModel.countDocuments({ createdAt: { $gte: monthStart } });
        // Returning customers (users with >1 non-cancelled order)
        const returningCustomers = await orderModel_1.orderModel.aggregate([
            { $match: { status: { $ne: "cancelled" }, userId: { $exists: true } } },
            { $group: { _id: "$userId", orderCount: { $sum: 1 }, totalSpent: { $sum: "$totalAmount" }, lastOrderDate: { $max: "$createdAt" } } },
            { $match: { orderCount: { $gt: 1 } } },
            { $sort: { totalSpent: -1 } },
            { $limit: 10 },
        ]);
        // Highest Spending Customers
        const highestSpending = await orderModel_1.orderModel.aggregate([
            { $match: { status: { $ne: "cancelled" }, userId: { $exists: true } } },
            { $group: { _id: "$userId", totalSpent: { $sum: "$totalAmount" }, orderCount: { $sum: 1 } } },
            { $sort: { totalSpent: -1 } },
            { $limit: 10 },
        ]);
        // Customers with Most Orders
        const mostOrders = await orderModel_1.orderModel.aggregate([
            { $match: { status: { $ne: "cancelled" }, userId: { $exists: true } } },
            { $group: { _id: "$userId", orderCount: { $sum: 1 }, totalSpent: { $sum: "$totalAmount" }, lastOrderDate: { $max: "$createdAt" } } },
            { $sort: { orderCount: -1 } },
            { $limit: 10 },
        ]);
        // Populate customer details
        const customerIds = [
            ...returningCustomers.map((c) => c._id),
            ...highestSpending.map((c) => c._id),
            ...mostOrders.map((c) => c._id),
        ];
        const uniqueCustomerIds = [...new Set(customerIds.map((id) => id.toString()))];
        const customerDetails = await userModel_1.userModel.find({ _id: { $in: uniqueCustomerIds.map((id) => new mongoose_1.default.Types.ObjectId(id)) } }).select("firstName lastName email").lean();
        const customerMap = {};
        customerDetails.forEach((c) => {
            customerMap[c._id.toString()] = c;
        });
        // ── Coupon Analytics ─────────────────────────────
        const couponStats = await couponModel_1.couponModel.aggregate([
            {
                $group: {
                    _id: null,
                    totalCoupons: { $sum: 1 },
                    activeCoupons: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ["$isActive", true] },
                                        {
                                            $or: [
                                                { $eq: ["$expiresAt", null] },
                                                { $gt: ["$expiresAt", now] },
                                            ],
                                        },
                                    ],
                                },
                                1,
                                0,
                            ],
                        },
                    },
                    expiredCoupons: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ["$isActive", true] },
                                        { $ne: ["$expiresAt", null] },
                                        { $lte: ["$expiresAt", now] },
                                    ],
                                },
                                1,
                                0,
                            ],
                        },
                    },
                    inactiveCoupons: {
                        $sum: {
                            $cond: [
                                { $eq: ["$isActive", false] },
                                1,
                                0,
                            ],
                        },
                    },
                },
            },
        ]);
        const totalCouponsCount = couponStats[0]?.totalCoupons || 0;
        const activeCouponsCount = couponStats[0]?.activeCoupons || 0;
        const expiredCouponsCount = couponStats[0]?.expiredCoupons || 0;
        const inactiveCouponsCount = couponStats[0]?.inactiveCoupons || 0;
        // Most Used Coupons
        const mostUsedCoupons = await couponModel_1.couponModel.find({ usedCount: { $gt: 0 } }).sort({ usedCount: -1 }).limit(10).lean();
        // Never Used Coupons
        const neverUsedCoupons = await couponModel_1.couponModel.find({ usedCount: 0 }).limit(10).lean();
        // Total Discounts Given
        const totalDiscountsResult = await orderModel_1.orderModel.aggregate([
            { $match: { status: { $ne: "cancelled" }, discount: { $gt: 0 } } },
            { $group: { _id: null, totalDiscounts: { $sum: "$discount" } } },
        ]);
        const totalDiscountsGiven = totalDiscountsResult[0]?.totalDiscounts || 0;
        // ── Category Analytics ───────────────────────────
        const revenueByCategory = await orderModel_1.orderModel.aggregate([
            { $match: { status: { $ne: "cancelled" } } },
            { $unwind: "$orderItems" },
            {
                $lookup: {
                    from: "products",
                    localField: "orderItems.productTitle",
                    foreignField: "name",
                    as: "productInfo",
                },
            },
            { $unwind: { path: "$productInfo", preserveNullAndEmptyArrays: true } },
            {
                $group: {
                    _id: { $ifNull: ["$productInfo.category", "Uncategorized"] },
                    revenue: { $sum: { $multiply: ["$orderItems.unitPrice", "$orderItems.quantity"] } },
                    orders: { $sum: 1 },
                },
            },
            { $sort: { revenue: -1 } },
        ]);
        const ordersByCategory = await orderModel_1.orderModel.aggregate([
            { $match: { status: { $ne: "cancelled" } } },
            { $unwind: "$orderItems" },
            {
                $lookup: {
                    from: "products",
                    localField: "orderItems.productTitle",
                    foreignField: "name",
                    as: "productInfo",
                },
            },
            { $unwind: { path: "$productInfo", preserveNullAndEmptyArrays: true } },
            {
                $group: {
                    _id: { $ifNull: ["$productInfo.category", "Uncategorized"] },
                    orders: { $sum: 1 },
                },
            },
            { $sort: { orders: -1 } },
        ]);
        const bestCategory = revenueByCategory.length > 0 ? revenueByCategory[0] : null;
        const worstCategory = revenueByCategory.length > 0 ? revenueByCategory[revenueByCategory.length - 1] : null;
        // ── Business Insights ────────────────────────────
        const bestSellingProduct = bestSelling.length > 0 ? bestSelling[0] : null;
        const worstSellingProduct = worstSelling.length > 0 ? worstSelling[0] : null;
        // Average products per order (across all non-cancelled orders)
        const avgProductsResult = await orderModel_1.orderModel.aggregate([
            { $match: nonCancelled },
            { $project: { itemCount: { $size: "$orderItems" } } },
            { $group: { _id: null, avgProducts: { $avg: "$itemCount" } } },
        ]);
        const avgProductsPerOrder = Math.round((avgProductsResult[0]?.avgProducts || 0) * 100) / 100;
        // Average revenue per customer (this month / total users)
        const avgRevenuePerCustomer = totalUsersCount > 0 ? Math.round((revMonth.totalRevenue / totalUsersCount) * 100) / 100 : 0;
        return {
            revenue: {
                totalRevenue: rev.totalRevenue,
                revenueToday: revToday.totalRevenue,
                revenueThisWeek: revWeek.totalRevenue,
                revenueThisMonth: revMonth.totalRevenue,
                revenueThisYear: revYear.totalRevenue,
                avgOrderValue: Math.round(rev.avgOrderValue * 100) / 100,
                revenueGrowth,
            },
            orders: {
                totalOrders: totalOrdersAll,
                ordersToday: ordersTodayCount,
                ordersThisWeek: ordersThisWeekCount,
                ordersThisMonth: ordersThisMonthCount,
                pending: statusMap.pending || 0,
                processing: statusMap.processing || 0,
                shipped: statusMap.shipped || 0,
                delivered: statusMap.delivered || 0,
                cancelled: statusMap.cancelled || 0,
                completionRate,
                cancellationRate,
            },
            products: {
                totalProducts: totalProductsCount,
                activeProducts: activeProductsCount,
                outOfStock: outOfStockCount,
                lowStock: lowStockCount,
                topSelling: bestSelling.map((p) => ({
                    name: p._id,
                    image: p.productImage,
                    totalQuantity: p.totalQuantity,
                    totalRevenue: p.totalRevenue,
                })),
                bottomSelling: worstSelling.map((p) => ({
                    name: p._id,
                    image: p.productImage,
                    totalQuantity: p.totalQuantity,
                    totalRevenue: p.totalRevenue,
                })),
                neverOrdered: neverOrderedProducts.map((p) => ({
                    _id: p._id,
                    name: p.name,
                    imageUrl: p.imageUrl,
                    category: p.category,
                    stock: p.stock,
                })),
                lowStockProducts: lowStockDetails.map((p) => ({
                    _id: p._id,
                    name: p.name,
                    imageUrl: p.imageUrl,
                    category: p.category,
                    stock: p.stock,
                })),
                outOfStockProducts: outOfStockDetails.map((p) => ({
                    _id: p._id,
                    name: p.name,
                    imageUrl: p.imageUrl,
                    category: p.category,
                    stock: p.stock,
                })),
                highestRevenue: highestRevenue.map((p) => ({
                    name: p._id,
                    image: p.productImage,
                    totalRevenue: p.totalRevenue,
                    totalQuantity: p.totalQuantity,
                })),
                recentlyAdded: recentlyAdded.slice(0, 10).map((p) => ({
                    _id: p._id,
                    name: p.name,
                    imageUrl: p.imageUrl,
                    category: p.category,
                    stock: p.stock,
                    createdAt: p.createdAt,
                })),
            },
            inventory: {
                lowStock: inventoryLow.map((p) => ({
                    _id: p._id,
                    name: p.name,
                    category: p.category,
                    stock: p.stock,
                    status: "low",
                })),
                outOfStock: inventoryOutOfStock.map((p) => ({
                    _id: p._id,
                    name: p.name,
                    category: p.category,
                    stock: p.stock,
                    status: "outOfStock",
                })),
            },
            customers: {
                totalUsers: totalUsersCount,
                newUsersToday: newUsersTodayCount,
                newUsersThisMonth: newUsersThisMonthCount,
                returningCustomers: returningCustomers.length,
                highestSpending: highestSpending.map((c) => ({
                    userId: c._id,
                    ...(customerMap[c._id.toString()] || {}),
                    totalSpent: c.totalSpent,
                    orderCount: c.orderCount,
                })),
                mostOrders: mostOrders.map((c) => ({
                    userId: c._id,
                    ...(customerMap[c._id.toString()] || {}),
                    totalSpent: c.totalSpent,
                    orderCount: c.orderCount,
                    lastOrderDate: c.lastOrderDate,
                })),
            },
            coupons: {
                totalCoupons: totalCouponsCount,
                activeCoupons: activeCouponsCount,
                expiredCoupons: expiredCouponsCount,
                inactiveCoupons: inactiveCouponsCount,
                mostUsedCoupons: mostUsedCoupons.map((c) => ({
                    code: c.code,
                    discountPercent: c.discountPercent,
                    usedCount: c.usedCount,
                    usageLimit: c.usageLimit,
                })),
                neverUsedCoupons: neverUsedCoupons.map((c) => ({
                    code: c.code,
                    discountPercent: c.discountPercent,
                })),
                totalDiscountsGiven: totalDiscountsGiven,
            },
            categories: {
                revenueByCategory: revenueByCategory.map((c) => ({
                    category: c._id,
                    revenue: c.revenue,
                    orders: c.orders,
                })),
                ordersByCategory: ordersByCategory.map((c) => ({
                    category: c._id,
                    orders: c.orders,
                })),
                bestCategory: bestCategory ? { category: bestCategory._id, revenue: bestCategory.revenue } : null,
                worstCategory: worstCategory ? { category: worstCategory._id, revenue: worstCategory.revenue } : null,
            },
            charts: {
                dailyRevenue: dailyRevenue.map((r) => ({
                    label: `${r._id.month}/${r._id.day}/${r._id.year}`,
                    revenue: r.revenue,
                    orders: r.orders,
                })),
                weeklyRevenue: weeklyRevenue.map((r) => ({
                    label: `W${r._id.week} ${r._id.year}`,
                    revenue: r.revenue,
                    orders: r.orders,
                })),
                monthlyRevenue: monthlyRevenue.map((r) => ({
                    label: `${r._id.month}/${r._id.year}`,
                    revenue: r.revenue,
                    orders: r.orders,
                })),
                yearlyRevenue: yearlyRevenue.map((r) => ({
                    label: String(r._id.year),
                    revenue: r.revenue,
                    orders: r.orders,
                })),
                ordersOverTime: ordersOverTime.map((r) => ({
                    label: `${r._id.month}/${r._id.day}/${r._id.year}`,
                    orders: r.orders,
                })),
            },
            insights: {
                bestSellingProduct: bestSellingProduct ? { name: bestSellingProduct._id, totalQuantity: bestSellingProduct.totalQuantity, totalRevenue: bestSellingProduct.totalRevenue } : null,
                worstSellingProduct: worstSellingProduct ? { name: worstSellingProduct._id, totalQuantity: worstSellingProduct.totalQuantity, totalRevenue: worstSellingProduct.totalRevenue } : null,
                fastestGrowingCategory: bestCategory ? { category: bestCategory._id, revenue: bestCategory.revenue } : null,
                slowestCategory: worstCategory ? { category: worstCategory._id, revenue: worstCategory.revenue } : null,
                highestSpendingCustomer: null,
                mostActiveCustomer: null,
                avgProductsPerOrder,
                avgRevenuePerCustomer,
            },
        };
    }
    catch (error) {
        throw new Error(error.message);
    }
};
exports.getDashboardAnalytics = getDashboardAnalytics;
