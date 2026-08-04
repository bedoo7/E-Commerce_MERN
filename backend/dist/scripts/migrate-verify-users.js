"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const userModel_1 = require("../models/userModel");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
async function main() {
    const mongoUri = process.env.DATABASE_URL;
    if (!mongoUri) {
        console.error("DATABASE_URL is not set in .env");
        process.exit(1);
    }
    await mongoose_1.default.connect(mongoUri);
    console.log("Connected to MongoDB");
    const result = await userModel_1.userModel.updateMany({
        $or: [
            { isVerified: false },
            { isVerified: { $exists: false } },
        ],
        verificationToken: { $exists: false },
    }, {
        $set: { isVerified: true },
    });
    console.log(`Migration complete. ${result.modifiedCount} user(s) updated.`);
    console.log(`Criteria: isVerified=false AND verificationToken does not exist (pre-verification-feature users).`);
    await mongoose_1.default.disconnect();
    console.log("Disconnected from MongoDB");
}
main().catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
});
