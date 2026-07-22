export interface PaginationMeta {
	page: number;
	limit: number;
	totalItems: number;
	totalPages: number;
	hasNext: boolean;
	hasPrev: boolean;
}

export interface PaginatedResponse<T> {
	data: T[];
	pagination: PaginationMeta;
}

export function parsePaginationParams(query: Record<string, any>) {
	const page = Math.max(1, parseInt(String(query.page || 1), 10) || 1);
	const limit = Math.max(
		1,
		Math.min(100, parseInt(String(query.limit || 12), 10) || 12),
	);
	const skip = (page - 1) * limit;

	const sortBy = String(query.sortBy || "createdAt");
	const sortOrder: 1 | -1 =
		String(query.sortOrder || "desc").toLowerCase() === "asc" ? 1 : -1;

	return { page, limit, skip, sortBy, sortOrder };
}

export function buildPaginatedResponse<T>(
	data: T[],
	totalItems: number,
	page: number,
	limit: number,
): PaginatedResponse<T> {
	const totalPages = Math.ceil(totalItems / limit) || 1;
	return {
		data,
		pagination: {
			page,
			limit,
			totalItems,
			totalPages,
			hasNext: page < totalPages,
			hasPrev: page > 1,
		},
	};
}
