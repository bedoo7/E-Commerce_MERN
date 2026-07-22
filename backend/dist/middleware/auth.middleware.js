"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization; //bearer + token
        if (!authHeader) {
            return res.status(401).json({
                message: "No token provided",
            });
        }
        const token = authHeader.split(" ")[1];
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || ""); //{ id: "...", role: "user", iat: 1783287344, exp: 1783290944 }
        req.user = decoded; // الاي دي ده بقي هناخده عشان نعمل بيه سيرش ف فانكشين الجيت مي ونجيب باقي الداتا بتاعت اليوزر ونرجعها  من السيرفر
        next();
    }
    catch (error) {
        return res.status(401).json({
            message: "Invalid token",
        });
    }
};
exports.authenticate = authenticate;
