import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const authenticate = (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const authHeader = req.headers.authorization; //bearer + token

		if (!authHeader) {
			return res.status(401).json({
				message: "No token provided",
			});
		}

		const token = authHeader.split(" ")[1];

		const decoded = jwt.verify(token, process.env.JWT_SECRET || ""); //{ id: "...", role: "user", iat: 1783287344, exp: 1783290944 }

		(req as any).user = decoded; // الاي دي ده بقي هناخده عشان نعمل بيه سيرش ف فانكشين الجيت مي ونجيب باقي الداتا بتاعت اليوزر ونرجعها  من السيرفر

		next();
	} catch (error) {
		return res.status(401).json({
			message: "Invalid token",
		});
	}
};
