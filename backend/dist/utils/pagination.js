"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePaginationParams = parsePaginationParams;
exports.buildPaginatedResponse = buildPaginatedResponse;
function parsePaginationParams(query) {
    const page = Math.max(1, parseInt(String(query.page || 1), 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(String(query.limit || 12), 10) || 12));
    const skip = (page - 1) * limit;
    const sortBy = String(query.sortBy || "createdAt");
    const sortOrder = String(query.sortOrder || "desc").toLowerCase() === "asc" ? 1 : -1;
    return { page, limit, skip, sortBy, sortOrder };
}
function buildPaginatedResponse(data, totalItems, page, limit) {
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
