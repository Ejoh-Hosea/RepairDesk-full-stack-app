import mongoose from "mongoose";
import { config } from "./env.js";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongoUri, {
      // Modern Mongoose doesn't need these flags, but explicit is better
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection failed: ${error.message}`);
    process.exit(1); // Hard exit — app can't run without DB
  }
};
