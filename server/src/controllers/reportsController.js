import { reportsService } from "../services/reportsService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const reportsController = {
  getMonthly: asyncHandler(async (req, res) => {
    const data = await reportsService.getMonthly();
    res.json({ success: true, data });
  }),
};
