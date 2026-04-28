import { User } from "../models/User.js";
import { AppError } from "../utils/AppError.js";

export const userService = {
  async getAll() {
    // Never return password or refreshToken fields
    return User.find()
      .select("-password -refreshToken")
      .sort({ createdAt: -1 });
  },

  async create(username, password, role = "technician") {
    const existing = await User.findOne({ username });
    if (existing) throw new AppError("Username already taken", 409);
    const user = await User.create({ username, password, role });
    return {
      id: user._id,
      username: user.username,
      role: user.role,
      createdAt: user.createdAt,
    };
  },

  async updateRole(id, role) {
    const user = await User.findById(id);
    if (!user) throw new AppError("User not found", 404);
    user.role = role;
    await user.save({ validateBeforeSave: false });
    return { id: user._id, username: user.username, role: user.role };
  },

  async resetPassword(id, newPassword) {
    const user = await User.findById(id);
    if (!user) throw new AppError("User not found", 404);
    user.password = newPassword; // pre-save hook re-hashes automatically
    await user.save();
    return { id: user._id, username: user.username };
  },

  async delete(id, requestingUserId) {
    // Prevent admins from deleting their own account
    if (id === String(requestingUserId)) {
      throw new AppError("You cannot delete your own account", 400);
    }
    const user = await User.findByIdAndDelete(id);
    if (!user) throw new AppError("User not found", 404);
    return user;
  },
};
