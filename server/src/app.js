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
      contentSecurityPolicy: config.isProduction ? undefined : false,
    }),
  );

  // CORS
  // - Local dev:  Vite runs on :5173, API on :5000 — allow :5173
  // - Render:     Same origin — frontend and API on same URL, cors less critical
  // - AWS:        Frontend on yourdomain.com, API on api.yourdomain.com — allow domain
  const allowedOrigins = config.corsAllOrigins
    ? true
    : [config.clientUrl, config.clientUrl.replace("https://", "https://www.")];

  app.use(
    cors({
      origin: allowedOrigins,
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      exposedHeaders: ["set-cookie"],
    }),
  );

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
      success: false,
      message: "Too many requests, please try again later",
    },
  });

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

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({
      success: true,
      status: "ok",
      timestamp: new Date().toISOString(),
    });
  });

  // ── Static file serving ────────────────────────────────────────────────────
  //
  // DEPLOYMENT_TARGET controls this behaviour:
  //
  //   render  → Express serves the React build from client/dist/
  //             (single service deployment — frontend + backend together)
  //
  //   aws     → Express serves API only. Frontend is on S3 + CloudFront.
  //             DO NOT serve static files — the client/dist folder does not
  //             exist inside the Docker container.
  //
  //   (unset) → Local development. Vite handles the frontend on :5173.
  //             Express just serves the API on :5000.
  //
  if (config.deploymentTarget === "render") {
    const clientBuildPath = path.join(__dirname, "../../client/dist");
    app.use(express.static(clientBuildPath));
    // SPA fallback — React Router handles all non-API routes
    app.get("*", (req, res) => {
      res.sendFile(path.join(clientBuildPath, "index.html"));
    });
    console.log("📦 Serving React frontend from client/dist (Render mode)");
  } else if (config.deploymentTarget === "aws") {
    // API only — frontend is on S3/CloudFront
    // Do NOT add static middleware here
    console.log("☁️  AWS mode — frontend served by S3/CloudFront");
  }
  // else: local dev — Vite handles frontend, no action needed

  // Error handlers — must be last
  app.use(notFound);
  app.use(errorHandler);

  return app;
};
