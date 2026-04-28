import { config } from "../config/env.js";

/**
 * Global error handler — must be registered LAST in Express middleware chain.
 * All errors funnel here via next(error).
 */
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Mongoose validation error
  if (err.name === "ValidationError") {
    statusCode = 400;
    const errors = Object.values(err.errors).map((e) => e.message);
    message = errors.join(", ");
  }

  // Mongoose duplicate key (e.g. unique username)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `${field} already exists`;
  }

  // Mongoose invalid ObjectId
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // JWT errors (shouldn't reach here if auth middleware handles them, but just in case)
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  }

  // Log non-operational errors (bugs) — operational ones (user errors) are expected
  if (!err.isOperational && config.nodeEnv !== "test") {
    console.error("💥 Unexpected error:", err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    // Only expose stack trace in development
    ...(config.nodeEnv === "development" && { stack: err.stack }),
  });
};

/**
 * 404 handler — catches requests that didn't match any route
 */
export const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};
