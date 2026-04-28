import mongoose from "mongoose";

export const REPAIR_STATUSES = {
  RECEIVED: "received",
  IN_PROGRESS: "in-progress",
  DONE: "done",
};

const repairSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
      maxlength: [100, "Customer name too long"],
    },
    phoneModel: {
      type: String,
      required: [true, "Phone model is required"],
      trim: true,
      maxlength: [100, "Phone model too long"],
    },
    issue: {
      type: String,
      required: [true, "Issue description is required"],
      trim: true,
      maxlength: [500, "Issue description too long"],
    },
    cost: {
      type: Number,
      required: [true, "Cost is required"],
      min: [0, "Cost cannot be negative"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    status: {
      type: String,
      enum: {
        values: Object.values(REPAIR_STATUSES),
        message: "Invalid status value",
      },
      default: REPAIR_STATUSES.RECEIVED,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, "Notes too long"],
    },
  },
  {
    timestamps: true, // Adds createdAt + updatedAt automatically
    toJSON: { virtuals: true },
  },
);

// Virtual: profit is always calculated, never stored
repairSchema.virtual("profit").get(function () {
  return this.price - this.cost;
});

// Indexes for frequent query patterns
repairSchema.index({ status: 1 });
repairSchema.index({ createdAt: -1 });
repairSchema.index({ phoneModel: "text", issue: "text" }); // Text search

export const Repair = mongoose.model("Repair", repairSchema);
