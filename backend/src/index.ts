import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import userRoutes from "./routes/userRoutes";
import { seedInitialProducts } from "./services/productService";
import productRoutes from "./routes/productRoutes";
import cartRoutes from "./routes/cartRoutes";
import orderRoutes from "./routes/orderRoutes";
import authRoutes from "./routes/authRoutes";
import wishlistRoutes from "./routes/wishlistRoutes";
import reviewRoutes from "./routes/reviewRoutes";
import couponRoutes from "./routes/couponRoutes";
import analyticsRoutes from "./routes/analyticsRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import brandRoutes from "./routes/brandRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || "";

app.use(cors());
app.use(express.json());

mongoose
	.connect(process.env.DATABASE_URL || "")
	.then(() => {
		console.log("Connected to MongoDB");
	})
	.catch((err) => {
		console.error("Error connecting to MongoDB:", err);
	});

app.use("/user", userRoutes);
app.use("/product", productRoutes);
app.use("/cart", cartRoutes);
app.use("/order", orderRoutes);
app.use("/auth", authRoutes);
app.use("/wishlist", wishlistRoutes);
app.use("/review", reviewRoutes);
app.use("/coupon", couponRoutes);
app.use("/analytics", analyticsRoutes);
app.use("/category", categoryRoutes);
app.use("/brand", brandRoutes);

seedInitialProducts();

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
