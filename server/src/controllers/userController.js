import { userService } from "../services/userService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const userController = {
  getAll: asyncHandler(async (req, res) => {
    const users = await userService.getAll();
    res.json({ success: true, data: users });
  }),

  create: asyncHandler(async (req, res) => {
    const { username, password, role } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Username and password required" });
    }
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }
    const user = await userService.create(username, password, role);
    res.status(201).json({ success: true, data: user });
  }),

  updateRole: asyncHandler(async (req, res) => {
    const { role } = req.body;
    if (!["admin", "technician"].includes(role)) {
      return res
        .status(400)
        .json({ success: false, message: "Role must be admin or technician" });
    }
    const user = await userService.updateRole(req.params.id, role);
    res.json({ success: true, data: user });
  }),

  resetPassword: asyncHandler(async (req, res) => {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters",
      });
    }
    const user = await userService.resetPassword(req.params.id, newPassword);
    res.json({ success: true, data: user });
  }),

  delete: asyncHandler(async (req, res) => {
    await userService.delete(req.params.id, req.user.id);
    res.json({ success: true, message: "User deleted" });
  }),
};
