import { dashboardService } from "../services/dashboardService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const dashboardController = {
  getStats: asyncHandler(async (req, res) => {
    const stats = await dashboardService.getStats();
    res.json({ success: true, data: stats });
  }),

  getTrends: asyncHandler(async (req, res) => {
    const trends = await dashboardService.getTrends();
    res.json({ success: true, data: trends });
  }),

  getActivity: asyncHandler(async (req, res) => {
    const { limit } = req.query;
    const activity = await dashboardService.getActivity(limit);
    res.json({ success: true, data: activity });
  }),
};
