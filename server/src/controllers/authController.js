import { authService } from "../services/authService.js";
import { setTokenCookies, clearTokenCookies } from "../utils/tokenUtils.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const authController = {
  login: asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Username and password required" });
    }

    const { accessToken, refreshToken, user } = await authService.login(
      username,
      password,
    );

    // Set tokens as httpOnly cookies (preferred) AND return in body for non-browser clients
    setTokenCookies(res, accessToken, refreshToken);

    res.json({
      success: true,
      data: { user, accessToken }, // Include accessToken in body for SPA memory storage
    });
  }),

  refresh: asyncHandler(async (req, res) => {
    const incomingToken = req.cookies?.refreshToken || req.body?.refreshToken;
    const { accessToken, refreshToken } =
      await authService.refresh(incomingToken);

    setTokenCookies(res, accessToken, refreshToken);

    res.json({ success: true, data: { accessToken } });
  }),

  logout: asyncHandler(async (req, res) => {
    await authService.logout(req.user.id);
    clearTokenCookies(res);
    res.json({ success: true, message: "Logged out successfully" });
  }),

  me: asyncHandler(async (req, res) => {
    res.json({ success: true, data: req.user });
  }),

  // Utility endpoint to seed the first admin user (disable in production)
  register: asyncHandler(async (req, res) => {
    const { username, password, role } = req.body;
    const user = await authService.createUser(username, password, role);
    res.status(201).json({ success: true, data: user });
  }),
};
