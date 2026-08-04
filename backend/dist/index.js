"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const productService_1 = require("./services/productService");
const productRoutes_1 = __importDefault(require("./routes/productRoutes"));
const cartRoutes_1 = __importDefault(require("./routes/cartRoutes"));
const orderRoutes_1 = __importDefault(require("./routes/orderRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const wishlistRoutes_1 = __importDefault(require("./routes/wishlistRoutes"));
const reviewRoutes_1 = __importDefault(require("./routes/reviewRoutes"));
const couponRoutes_1 = __importDefault(require("./routes/couponRoutes"));
const analyticsRoutes_1 = __importDefault(require("./routes/analyticsRoutes"));
const categoryRoutes_1 = __importDefault(require("./routes/categoryRoutes"));
const brandRoutes_1 = __importDefault(require("./routes/brandRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || "";
app.use((0, cors_1.default)());
app.use(express_1.default.json());
mongoose_1.default
    .connect(process.env.DATABASE_URL || "")
    .then(() => {
    console.log("Connected to MongoDB");
})
    .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
});
app.use("/user", userRoutes_1.default);
app.use("/product", productRoutes_1.default);
app.use("/cart", cartRoutes_1.default);
app.use("/order", orderRoutes_1.default);
app.use("/auth", authRoutes_1.default);
app.use("/wishlist", wishlistRoutes_1.default);
app.use("/review", reviewRoutes_1.default);
app.use("/coupon", couponRoutes_1.default);
app.use("/analytics", analyticsRoutes_1.default);
app.use("/category", categoryRoutes_1.default);
app.use("/brand", brandRoutes_1.default);
(0, productService_1.seedInitialProducts)();
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
