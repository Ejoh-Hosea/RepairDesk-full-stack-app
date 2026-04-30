import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";
import { config } from "./config/env.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import authRoutes from "./routes/auth.js";
import repairRoutes from "./routes/repairs.js";
import dashboardRoutes from "./routes/dashboard.js";
import userRoutes from "./routes/users.js";
import reportsRoutes from "./routes/reports.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const createApp = () => {
  const app = express();

  // Security headers
  app.use(
    helmet({
      // Required for serving frontend from same Express instance
      contentSecurityPolicy: config.isProduction ? undefined : false,
    }),
  );

  // CORS — allow our frontend origin.
  // Set CORS_ALL_ORIGINS=true in server/.env to accept any origin — useful when
  // testing routes independently with Postman / VS Code REST Client without the frontend.
  app.use(
    cors({
      origin: config.corsAllOrigins ? true : config.clientUrl,
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  );

  // Rate limiting — prevent brute force
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: {
      success: false,
      message: "Too many requests, please try again later",
    },
  });

  // Stricter limit on auth endpoints
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { success: false, message: "Too many login attempts" },
  });

  app.use("/api", limiter);
  app.use("/api/auth/login", authLimiter);

  // Body parsing + cookies
  app.use(express.json({ limit: "10kb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // API Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/repairs", repairRoutes);
  app.use("/api/dashboard", dashboardRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/reports", reportsRoutes);

  // Health check — useful for Render's health monitoring
  app.get("/api/health", (req, res) => {
    res.json({
      success: true,
      status: "ok",
      timestamp: new Date().toISOString(),
    });
  });

  // Serve React frontend in production (Render deployment)
  if (config.isProduction) {
    const clientBuildPath = path.join(__dirname, "../../client/dist");
    app.use(express.static(clientBuildPath));
    // SPA fallback — let React Router handle all non-API routes
    app.get("*", (req, res) => {
      res.sendFile(path.join(clientBuildPath, "index.html"));
    });
  }

  // Error handlers — must be registered AFTER routes
  app.use(notFound);
  app.use(errorHandler);

  return app;
};
