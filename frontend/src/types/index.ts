export interface IUser {
	_id: string;
	firstName: string;
	lastName: string;
	email: string;
	role: "user" | "admin";
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
	userId: string | IUser;
	orderItems: IOrderItem[];
	totalAmount: number;
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
