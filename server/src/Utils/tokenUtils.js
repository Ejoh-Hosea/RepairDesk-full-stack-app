import jwt from "jsonwebtoken";
import { config } from "../config/env.js";

export const generateTokens = (userId) => {
  const payload = { id: userId };

  const accessToken = jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtAccessExpiry,
  });

  const refreshToken = jwt.sign(payload, config.jwtSecret + "_refresh", {
    expiresIn: config.jwtRefreshExpiry,
  });

  return { accessToken, refreshToken };
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, config.jwtSecret + "_refresh");
};

/**
 * Sets tokens as httpOnly cookies — more secure than localStorage.
 * Separate secrets for access vs refresh prevents token cross-use.
 */
export const setTokenCookies = (res, accessToken, refreshToken) => {
  const cookieOptions = {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: "strict",
  };

  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/api/auth/refresh", // Scoped — only sent to refresh endpoint
  });
};

export const clearTokenCookies = (res) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken", { path: "/api/auth/refresh" });
};
