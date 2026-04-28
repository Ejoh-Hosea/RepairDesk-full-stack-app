import { User } from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import { generateTokens, verifyRefreshToken } from "../utils/tokenUtils.js";

export const authService = {
  async login(username, password) {
    // Explicitly select password field (excluded by default in schema)
    const user = await User.findOne({ username }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      throw new AppError("Invalid credentials", 401);
    }

    const { accessToken, refreshToken } = generateTokens(user._id);

    // Persist refresh token for rotation validation
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return {
      accessToken,
      refreshToken,
      user: { id: user._id, username: user.username, role: user.role },
    };
  },

  async refresh(incomingRefreshToken) {
    if (!incomingRefreshToken) {
      throw new AppError("Refresh token required", 401);
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(incomingRefreshToken);
    } catch {
      throw new AppError("Invalid or expired refresh token", 401);
    }

    // Validate token matches what we stored (rotation — invalidates reuse)
    const user = await User.findById(decoded.id).select("+refreshToken");
    if (!user || user.refreshToken !== incomingRefreshToken) {
      throw new AppError("Refresh token reuse detected or user not found", 401);
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(
      user._id,
    );

    // Rotate: replace stored token
    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken: newRefreshToken };
  },

  async logout(userId) {
    await User.findByIdAndUpdate(userId, { refreshToken: null });
  },

  async createUser(username, password, role = "technician") {
    const existing = await User.findOne({ username });
    if (existing) throw new AppError("Username already taken", 409);

    const user = await User.create({ username, password, role });
    return { id: user._id, username: user.username, role: user.role };
  },
};
