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
 * Cookie settings differ between local dev and production AWS:
 *
 * Local dev:
 *   - Frontend and API are on same origin (localhost via Vite proxy)
 *   - sameSite: 'lax' works fine
 *   - secure: false (no HTTPS locally)
 *
 * Production on AWS:
 *   - Frontend: https://yourdomain.com (CloudFront)
 *   - API:      https://api.yourdomain.com (ALB → ECS)
 *   - These are DIFFERENT origins (different subdomain)
 *   - sameSite: 'none' is required for cross-origin cookies
 *   - secure: true is REQUIRED when sameSite is 'none'
 *
 * Note: Since the access token is also returned in the response body
 * and stored in memory, the app works even if cookies are blocked.
 * Cookies are only needed for the refresh token flow.
 */
export const setTokenCookies = (res, accessToken, refreshToken) => {
  const cookieOptions = {
    httpOnly: true,
    secure: config.isProduction, // true in prod (HTTPS required)
    sameSite: config.isProduction ? "none" : "lax", // 'none' for cross-origin in prod
  };

  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/api/auth/refresh",
  });
};

export const clearTokenCookies = (res) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: config.isProduction ? "none" : "lax",
  });
  res.clearCookie("refreshToken", {
    path: "/api/auth/refresh",
    httpOnly: true,
    secure: config.isProduction,
    sameSite: config.isProduction ? "none" : "lax",
  });
};
