import { Repair, REPAIR_STATUSES } from "../models/Repair.js";
import { ActivityLog, ACTIVITY_ACTIONS } from "../models/ActivityLog.js";
import { AppError } from "../utils/AppError.js";
import { cacheService } from "../cache/cacheService.js";

/**
 * Logs an activity event and invalidates dashboard cache.
 * Called after any repair mutation.
 */
const logActivity = async (action, repair, extra = {}) => {
  await ActivityLog.create({
    action,
    repairId: repair._id,
    metadata: {
      customerName: repair.customerName,
      phoneModel: repair.phoneModel,
      issue: repair.issue,
      ...extra,
    },
  });
  // Invalidate dashboard cache so next request gets fresh stats
  cacheService.invalidateDashboard();
};

export const repairService = {
  async getAll({ status, search, page = 1, limit = 20 } = {}) {
    const query = {};

    if (status && Object.values(REPAIR_STATUSES).includes(status)) {
      query.status = status;
    }

    if (search) {
      // Use MongoDB text index for efficient search across phoneModel + issue
      query.$text = { $search: search };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [repairs, total] = await Promise.all([
      Repair.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Repair.countDocuments(query),
    ]);

    return {
      repairs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    };
  },

  async getById(id) {
    const repair = await Repair.findById(id);
    if (!repair) throw new AppError("Repair not found", 404);
    return repair;
  },

  async create(data) {
    const repair = await Repair.create(data);
    await logActivity(ACTIVITY_ACTIONS.REPAIR_CREATED, repair);
    return repair;
  },

  async update(id, data) {
    const repair = await Repair.findById(id);
    if (!repair) throw new AppError("Repair not found", 404);

    const oldStatus = repair.status;
    Object.assign(repair, data);
    await repair.save();

    // Use specific action type if status changed
    const action =
      data.status && data.status !== oldStatus
        ? ACTIVITY_ACTIONS.REPAIR_STATUS_CHANGED
        : ACTIVITY_ACTIONS.REPAIR_UPDATED;

    await logActivity(action, repair, {
      oldStatus,
      newStatus: repair.status,
    });

    return repair;
  },

  async delete(id) {
    const repair = await Repair.findByIdAndDelete(id);
    if (!repair) throw new AppError("Repair not found", 404);
    await logActivity(ACTIVITY_ACTIONS.REPAIR_DELETED, repair);
    return repair;
  },
};
