import { couponModel, ICoupon } from "../models/couponModel";

const normalizeCouponDiscountType = (coupon: ICoupon) => {
	if (coupon.discountType === "fixed") {
		return "fixed";
	}

	return "percentage";
};

export const validateCoupon = async (code: string, orderAmount: number) => {
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

		if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
			throw new Error("Coupon usage limit reached");
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

export const getAllCoupons = async () => {
	try {
		const coupons = await couponModel.find().sort({ createdAt: -1 }).lean();
		return coupons;
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
