export interface IUser {
	_id: string;
	firstName: string;
	lastName: string;
	email: string;
	role: "user" | "admin";
	isActive?: boolean;
	createdAt?: string;
	updatedAt?: string;
}

export interface IProduct {
	_id: string;
	name: string;
	description: string;
	price: number;
	category: string;
	brand: string;
	stock: number;
	imageUrl: string;
	createdAt?: string;
	updatedAt?: string;
}

export interface ICartItem {
	product: IProduct | string;
	quantity: number;
	unitPrice: number;
	_id?: string;
}

export interface ICart {
	_id: string;
	userId: string;
	items: ICartItem[];
	totalAmount: number;
	status: "active" | "completed";
}

export type OrderStatus =
	| "pending"
	| "processing"
	| "shipped"
	| "delivered"
	| "cancelled";

export interface IOrderItem {
	productTitle: string;
	productImage: string;
	unitPrice: number;
	quantity: number;
	_id?: string;
}

export interface IOrder {
	_id: string;
	orderNumber: string;
	userId: string | IUser;
	orderItems: IOrderItem[];
	totalAmount: number;
	subtotal: number;
	discount: number;
	couponCode?: string;
	couponPercent?: number;
	address: string;
	status: OrderStatus;
	cancelledAt?: string;
	cancelledBy?: string;
	cancelReason?: string;
	createdAt?: string;
	updatedAt?: string;
}

export interface LoginResponse {
	message: string;
	token: string;
	user: IUser;
}

export interface IPagination {
	page: number;
	limit: number;
	totalItems: number;
	totalPages: number;
	hasNext: boolean;
	hasPrev: boolean;
}

export interface IPaginatedResponse<T> {
	data: T[];
	pagination: IPagination;
}

export interface IProductQuery {
	page?: number;
	limit?: number;
	search?: string;
	category?: string;
	brand?: string;
	minPrice?: number | string;
	maxPrice?: number | string;
	inStock?: boolean;
	stockStatus?: string;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
}

export interface IUserQuery {
	page?: number;
	limit?: number;
	search?: string;
	role?: string;
	isActive?: string | boolean;
	startDate?: string;
	endDate?: string;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
}

export interface IOrderQuery {
	page?: number;
	limit?: number;
	search?: string;
	status?: string;
	minPrice?: number | string;
	maxPrice?: number | string;
	startDate?: string;
	endDate?: string;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
}

export interface ICouponQuery {
	page?: number;
	limit?: number;
	search?: string;
	status?: string;
	discountType?: string;
	minDiscount?: number | string;
	maxDiscount?: number | string;
	startDate?: string;
	endDate?: string;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
}

export interface IUsersResponse extends IPaginatedResponse<IUser> {
	users: IUser[];
	count: number;
}

export interface IWishlistItem {
	product: IProduct | string | null;
	addedAt: string;
	_id?: string;
}

export interface IWishlist {
	_id: string;
	userId: string;
	items: IWishlistItem[];
}

export type CouponDiscountType = "percentage" | "fixed";

export interface ICoupon {
	_id: string;
	code: string;
	discountType?: CouponDiscountType;
	discountPercent: number;
	discountValue?: number;
	minOrderAmount: number;
	expiresAt: string;
	usageLimit: number;
	usedCount: number;
	usedBy?: { userId: string; count: number }[];
	isActive: boolean;
	createdAt?: string;
	updatedAt?: string;
}

export interface IReviewUser {
	_id: string;
	firstName: string;
	lastName: string;
}

export interface IReview {
	_id: string;
	productId: string;
	userId: IReviewUser | string;
	rating: number;
	comment: string;
	isVerifiedPurchase?: boolean;
	createdAt?: string;
	updatedAt?: string;
}

export interface IReviewResponse {
	reviews: IReview[];
	averageRating: number;
	totalReviews: number;
	ratingDistribution: number[];
}

export interface IAnalyticsRevenue {
	totalRevenue: number;
	revenueToday: number;
	revenueThisWeek: number;
	revenueThisMonth: number;
	revenueThisYear: number;
	avgOrderValue: number;
	revenueGrowth: number;
}

export interface IAnalyticsOrders {
	totalOrders: number;
	ordersToday: number;
	ordersThisWeek: number;
	ordersThisMonth: number;
	pending: number;
	processing: number;
	shipped: number;
	delivered: number;
	cancelled: number;
	completionRate: number;
	cancellationRate: number;
}

export interface IAnalyticsProductItem {
	_id?: string;
	name?: string;
	image?: string;
	imageUrl?: string;
	totalQuantity?: number;
	totalRevenue?: number;
	category?: string;
	stock?: number;
	createdAt?: string;
}

export interface IAnalyticsProducts {
	totalProducts: number;
	activeProducts: number;
	outOfStock: number;
	lowStock: number;
	topSelling: IAnalyticsProductItem[];
	bottomSelling: IAnalyticsProductItem[];
	neverOrdered: IAnalyticsProductItem[];
	lowStockProducts: IAnalyticsProductItem[];
	outOfStockProducts: IAnalyticsProductItem[];
	highestRevenue: IAnalyticsProductItem[];
	recentlyAdded: IAnalyticsProductItem[];
}

export interface IAnalyticsInventoryItem {
	_id?: string;
	name?: string;
	category?: string;
	stock?: number;
	status?: string;
}

export interface IAnalyticsInventory {
	lowStock: IAnalyticsInventoryItem[];
	outOfStock: IAnalyticsInventoryItem[];
}

export interface IAnalyticsCustomerItem {
	userId?: string;
	firstName?: string;
	lastName?: string;
	email?: string;
	totalSpent?: number;
	orderCount?: number;
	lastOrderDate?: string;
}

export interface IAnalyticsCustomers {
	totalUsers: number;
	newUsersToday: number;
	newUsersThisMonth: number;
	returningCustomers: number;
	highestSpending: IAnalyticsCustomerItem[];
	mostOrders: IAnalyticsCustomerItem[];
}

export interface IAnalyticsCouponItem {
	code?: string;
	discountPercent?: number;
	usedCount?: number;
	usageLimit?: number;
}

export interface IAnalyticsCoupons {
totalCoupons: number;
		activeCoupons: number;
		expiredCoupons: number;
		inactiveCoupons: number;
		mostUsedCoupons: IAnalyticsCouponItem[];
	neverUsedCoupons: IAnalyticsCouponItem[];
	totalDiscountsGiven: number;
}

export interface IAnalyticsCategoryItem {
	category?: string;
	revenue?: number;
	orders?: number;
}

export interface IAnalyticsCategories {
	revenueByCategory: IAnalyticsCategoryItem[];
	ordersByCategory: IAnalyticsCategoryItem[];
	bestCategory: IAnalyticsCategoryItem | null;
	worstCategory: IAnalyticsCategoryItem | null;
}

export interface IAnalyticsChartItem {
	label: string;
	revenue?: number;
	orders?: number;
}

export interface IAnalyticsCharts {
	dailyRevenue: IAnalyticsChartItem[];
	weeklyRevenue: IAnalyticsChartItem[];
	monthlyRevenue: IAnalyticsChartItem[];
	yearlyRevenue: IAnalyticsChartItem[];
	ordersOverTime: IAnalyticsChartItem[];
}

export interface IAnalyticsInsight {
	bestSellingProduct: IAnalyticsProductItem | null;
	worstSellingProduct: IAnalyticsProductItem | null;
	fastestGrowingCategory: IAnalyticsCategoryItem | null;
	slowestCategory: IAnalyticsCategoryItem | null;
	highestSpendingCustomer: IAnalyticsCustomerItem | null;
	mostActiveCustomer: IAnalyticsCustomerItem | null;
	avgProductsPerOrder: number;
	avgRevenuePerCustomer: number;
}

export interface IAnalytics {
	revenue: IAnalyticsRevenue;
	orders: IAnalyticsOrders;
	products: IAnalyticsProducts;
	inventory: IAnalyticsInventory;
	customers: IAnalyticsCustomers;
	coupons: IAnalyticsCoupons;
	categories: IAnalyticsCategories;
	charts: IAnalyticsCharts;
	insights: IAnalyticsInsight;
}
