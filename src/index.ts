import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import userRoutes from "./routes/userRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

mongoose
	.connect("mongodb://localhost:27017/e-commerce")
	.then(() => {
		console.log("Connected to MongoDB");
	})
	.catch((err) => {
		console.error("Error connecting to MongoDB:", err);
	});

app.use("/user", userRoutes);

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
