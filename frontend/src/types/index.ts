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
	sortBy?: string;
	sortOrder?: "asc" | "desc";
}

export interface IUserQuery {
	page?: number;
	limit?: number;
	search?: string;
	role?: string;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
}

export interface IOrderQuery {
	page?: number;
	limit?: number;
	search?: string;
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
	totalOrders: number;
	avgOrderValue: number;
}

export interface IAnalyticsRevenueByMonth {
	month: string;
	revenue: number;
	orders: number;
}

export interface IAnalyticsTopSelling {
	_id: string;
	totalQuantity: number;
	totalRevenue: number;
}

export interface IAnalyticsStock {
	lowStock: number;
	outOfStock: number;
}

export interface IAnalyticsTotals {
	users: number;
	products: number;
}

export interface IAnalytics {
	revenue: IAnalyticsRevenue;
	revenueByMonth: IAnalyticsRevenueByMonth[];
	ordersByStatus: Record<string, number>;
	topSelling: IAnalyticsTopSelling[];
	stock: IAnalyticsStock;
	totals: IAnalyticsTotals;
}
