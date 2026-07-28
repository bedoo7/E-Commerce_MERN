import { couponModel, ICoupon } from "../models/couponModel";
import {
	buildPaginatedResponse,
	parsePaginationParams,
	PaginatedResponse,
} from "../utils/pagination";

const normalizeCouponDiscountType = (coupon: ICoupon) => {
	if (coupon.discountType === "fixed") {
		return "fixed";
	}

	return "percentage";
};

export interface CouponQueryParams {
	page?: string | number;
	limit?: string | number;
	search?: string;
	status?: string;
	discountType?: string;
	minDiscount?: string | number;
	maxDiscount?: string | number;
	startDate?: string;
	endDate?: string;
	sortBy?: string;
	sortOrder?: string;
}

export const validateCoupon = async (
	code: string,
	orderAmount: number,
	userId?: string,
) => {
	try {
		const coupon = await couponModel.findOne({
			code: code.toUpperCase(),
			isActive: true,
		});

		if (!coupon) {
			throw new Error("Invalid coupon code");
		}

		if (coupon.expiresAt < new Date()) {
			throw new Error("Coupon has expired");
		}

		// Check per-user usage limit (NOT global - each user can use it independently)
		if (userId) {
			const userEntry = (coupon.usedBy || []).find(
				(u: any) => String(u.userId) === String(userId),
			);
			if (userEntry && userEntry.count >= 1) {
				throw new Error("You have already used this coupon");
			}
		}

		if (orderAmount < coupon.minOrderAmount) {
			throw new Error(
				`Minimum order amount of $${coupon.minOrderAmount} required for this coupon`,
			);
		}

		const discountType = normalizeCouponDiscountType(coupon);
		let discount = 0;

		if (discountType === "fixed") {
			discount = Math.min(coupon.discountValue ?? 0, orderAmount);
		} else {
			discount = (orderAmount * (coupon.discountPercent ?? 0)) / 100;
		}

		const roundedDiscount = Number(discount.toFixed(2));
		const finalTotal = Math.max(orderAmount - roundedDiscount, 0);

		return {
			valid: true,
			discount: roundedDiscount,
			discountPercent:
				discountType === "percentage" ? (coupon.discountPercent ?? 0) : 0,
			discountValue: discountType === "fixed" ? (coupon.discountValue ?? 0) : 0,
			code: coupon.code,
			finalTotal,
		};
	} catch (error: any) {
		throw new Error(error.message);
	}
};

export const applyCoupon = async (code: string) => {
	try {
		const coupon = await couponModel.findOneAndUpdate(
			{
				code: code.toUpperCase(),
				isActive: true,
				expiresAt: { $gt: new Date() },
				$expr: {
					$or: [
						{ $eq: ["$usageLimit", 0] },
						{ $lt: ["$usedCount", "$usageLimit"] },
					],
				},
			},
			{ $inc: { usedCount: 1 } },
			{ new: true },
		);

		if (!coupon) {
			throw new Error("Unable to apply coupon");
		}

		return coupon;
	} catch (error: any) {
		throw new Error(error.message);
	}
};

// Admin services
export const createCoupon = async (data: Partial<ICoupon>) => {
	try {
		const coupon = await couponModel.create(data);
		return coupon;
	} catch (error: any) {
		throw new Error(error.message);
	}
};

export const getAllCoupons = async (
	queryParams: CouponQueryParams = {},
): Promise<PaginatedResponse<ICoupon>> => {
	try {
		const { page, limit, skip, sortBy, sortOrder } =
			parsePaginationParams(queryParams);

		const filter: Record<string, any> = {};

		if (queryParams.search && queryParams.search.trim()) {
			const searchRegex = new RegExp(queryParams.search.trim(), "i");
			filter.$or = [{ code: searchRegex }];
		}

		if (queryParams.status === "active") {
			filter.isActive = true;
			filter.expiresAt = { $gt: new Date() };
		} else if (queryParams.status === "inactive") {
			filter.isActive = false;
		} else if (queryParams.status === "expired") {
			filter.isActive = true;
			filter.expiresAt = { $lte: new Date() };
		}

		if (queryParams.discountType) {
			filter.discountType = queryParams.discountType;
		}

		if (
			queryParams.minDiscount !== undefined ||
			queryParams.maxDiscount !== undefined
		) {
			if (queryParams.discountType === "fixed") {
				if (
					queryParams.minDiscount !== undefined &&
					queryParams.minDiscount !== ""
				) {
					filter.discountValue = filter.discountValue || {};
					filter.discountValue.$gte = Number(queryParams.minDiscount);
				}
				if (
					queryParams.maxDiscount !== undefined &&
					queryParams.maxDiscount !== ""
				) {
					filter.discountValue = filter.discountValue || {};
					filter.discountValue.$lte = Number(queryParams.maxDiscount);
				}
			} else {
				if (
					queryParams.minDiscount !== undefined &&
					queryParams.minDiscount !== ""
				) {
					filter.discountPercent = filter.discountPercent || {};
					filter.discountPercent.$gte = Number(queryParams.minDiscount);
				}
				if (
					queryParams.maxDiscount !== undefined &&
					queryParams.maxDiscount !== ""
				) {
					filter.discountPercent = filter.discountPercent || {};
					filter.discountPercent.$lte = Number(queryParams.maxDiscount);
				}
			}
		}

		if (queryParams.startDate) {
			filter.createdAt = filter.createdAt || {};
			filter.createdAt.$gte = new Date(queryParams.startDate);
		}
		if (queryParams.endDate) {
			filter.createdAt = filter.createdAt || {};
			filter.createdAt.$lte = new Date(queryParams.endDate);
		}

		const allowedSortFields = [
			"createdAt",
			"expiresAt",
			"discountPercent",
			"discountValue",
			"code",
		];
		const sortField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";

		const [coupons, totalItems] = await Promise.all([
			couponModel
				.find(filter)
				.sort({ [sortField]: sortOrder })
				.skip(skip)
				.limit(limit)
				.lean(),
			couponModel.countDocuments(filter),
		]);

		return buildPaginatedResponse(
			coupons as ICoupon[],
			totalItems,
			page,
			limit,
		);
	} catch (error: any) {
		throw new Error(error.message);
	}
};

export const updateCoupon = async (couponId: string, data: Partial<ICoupon>) => {
	try {
		const existing = await couponModel.findById(couponId);
		if (!existing) {
			throw new Error('Coupon not found');
		}

		// Prevent duplicate coupon codes (except for the current coupon)
		if (data.code !== undefined) {
			const codeExists = await couponModel.findOne({
				code: data.code.toUpperCase(),
				_id: { $ne: couponId },
			});
			if (codeExists) {
				throw new Error('Coupon code already exists');
			}
		}

		const updated = await couponModel.findByIdAndUpdate(couponId, data, {
			new: true,
			runValidators: true,
		});
		return updated;
	} catch (error: any) {
		throw new Error(error.message);
	}
};

export const deleteCoupon = async (couponId: string) => {
	try {
		await couponModel.findByIdAndDelete(couponId);
		return { message: "Coupon deleted successfully" };
	} catch (error: any) {
		throw new Error(error.message);
	}
};
