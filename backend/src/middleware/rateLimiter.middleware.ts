import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 10, // 10 attempts per window
	message: {
		message: "Too many attempts. Please try again after 15 minutes.",
	},
	standardHeaders: true,
	legacyHeaders: false,
});

export const apiLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 100,
	message: {
		message: "Too many requests. Please try again later.",
	},
	standardHeaders: true,
	legacyHeaders: false,
});
