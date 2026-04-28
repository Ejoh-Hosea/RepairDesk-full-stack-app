import jwt from "jsonwebtoken";
import { config } from "../config/env.js";
import { User } from "../models/User.js";
import { AppError } from "../utils/AppError.js";

/**
 * Verifies JWT access token from Authorization header or cookie.
 * Attaches decoded user to req.user.
 */
export const authenticate = async (req, res, next) => {
  try {
    let token;

    // Support both Bearer token (API clients) and httpOnly cookie (browser)
    if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return next(new AppError("Authentication required", 401));
    }

    const decoded = jwt.verify(token, config.jwtSecret);

    // Fetch user to ensure they still exist (not deleted after token issued)
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new AppError("User no longer exists", 401));
    }

    req.user = { id: user._id, username: user.username, role: user.role };
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return next(new AppError("Access token expired", 401));
    }
    return next(new AppError("Invalid token", 401));
  }
};

/**
 * Role-based access control — call after authenticate()
 * Usage: authorize('admin')
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return next(new AppError("Insufficient permissions", 403));
    }
    next();
  };
};
