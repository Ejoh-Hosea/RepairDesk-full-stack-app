import { repairService } from "../services/repairService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const repairController = {
  getAll: asyncHandler(async (req, res) => {
    const { status, search, page, limit } = req.query;
    const result = await repairService.getAll({ status, search, page, limit });
    res.json({ success: true, ...result });
  }),

  getById: asyncHandler(async (req, res) => {
    const repair = await repairService.getById(req.params.id);
    res.json({ success: true, data: repair });
  }),

  create: asyncHandler(async (req, res) => {
    const repair = await repairService.create(req.body);
    res.status(201).json({ success: true, data: repair });
  }),

  update: asyncHandler(async (req, res) => {
    const repair = await repairService.update(req.params.id, req.body);
    res.json({ success: true, data: repair });
  }),

  delete: asyncHandler(async (req, res) => {
    await repairService.delete(req.params.id);
    res.json({ success: true, message: "Repair deleted" });
  }),
};
