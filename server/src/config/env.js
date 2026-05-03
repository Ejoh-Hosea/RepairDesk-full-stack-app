// Centralizes all env var access — fail fast if required vars are missing
import dotenv from "dotenv";
dotenv.config();

const required = ["MONGO_URI", "JWT_SECRET"];
required.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  mongoUri: process.env.MONGO_URI, // ← PLACEHOLDER: add your MongoDB URI
  jwtSecret: process.env.JWT_SECRET, // ← PLACEHOLDER: add a strong  secret
  jwtAccessExpiry: process.env.JWT_ACCESS_EXPIRY || "15m",
  jwtRefreshExpiry: process.env.JWT_REFRESH_EXPIRY || "7d",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173", // ← PLACEHOLDER: your frontend URL
  corsAllOrigins: process.env.CORS_ALL_ORIGINS === "true", // only set true locally for API testing
  isProduction: process.env.NODE_ENV === "production",
};
