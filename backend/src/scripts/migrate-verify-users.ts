import mongoose from "mongoose";
import { userModel } from "../models/userModel";
import dotenv from "dotenv";

dotenv.config();

async function main() {
	const mongoUri = process.env.DATABASE_URL;
	if (!mongoUri) {
		console.error("DATABASE_URL is not set in .env");
		process.exit(1);
	}

	await mongoose.connect(mongoUri);
	console.log("Connected to MongoDB");

	const result = await userModel.updateMany(
		{
			$or: [
				{ isVerified: false },
				{ isVerified: { $exists: false } },
			],
			verificationToken: { $exists: false },
		},
		{
			$set: { isVerified: true },
		},
	);

	console.log(`Migration complete. ${result.modifiedCount} user(s) updated.`);
	console.log(
		`Criteria: isVerified=false AND verificationToken does not exist (pre-verification-feature users).`,
	);

	await mongoose.disconnect();
	console.log("Disconnected from MongoDB");
}

main().catch((error) => {
	console.error("Migration failed:", error);
	process.exit(1);
});