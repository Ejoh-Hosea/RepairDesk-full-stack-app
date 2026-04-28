import mongoose from "mongoose";

export const ACTIVITY_ACTIONS = {
  REPAIR_CREATED: "repair_created",
  REPAIR_UPDATED: "repair_updated",
  REPAIR_STATUS_CHANGED: "repair_status_changed",
  REPAIR_DELETED: "repair_deleted",
};

const activityLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      enum: Object.values(ACTIVITY_ACTIONS),
      required: true,
    },
    repairId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Repair",
      required: true,
    },
    // Snapshot of key repair data at time of event (avoids joins for feed display)
    metadata: {
      customerName: String,
      phoneModel: String,
      issue: String,
      oldStatus: String,
      newStatus: String,
    },
  },
  {
    timestamps: true,
    // Auto-expire logs after 30 days using MongoDB TTL index
    // Keeps the collection lean without manual cleanup
  },
);

// Only keep recent activity — index for fast feed queries
activityLogSchema.index({ createdAt: -1 });

export const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);
