const mongoose = require("mongoose");

const stopWorkOrderSchema = new mongoose.Schema(
  {
    projectId: {
      type: String,
      required: true,
      trim: true,
    },
    module: {
      type: String,
      default: "stop_work_order",
      enum: ["stop_work_order"],
    },
    dateTime: {
      type: Date,
      required: true,
    },
    areaStopped: {
      type: String,
      required: true,
      trim: true,
    },
    activityStopped: {
      type: String,
      required: true,
      trim: true,
    },
    reasonCategory: {
      type: String,
      required: true,
      enum: [
        "unsafe_condition",
        "unsafe_act",
        "equipment_failure",
        "weather",
        "regulatory",
        "other",
      ],
    },
    reasonDescription: {
      type: String,
      required: true,
      trim: true,
    },
    issuedBy: {
      type: String,
      required: true,
      trim: true,
    },
    duration: {
      type: String,
      trim: true,
      default: "",
    },
    immediateActions: {
      type: String,
      required: true,
      trim: true,
    },
    photos: [
      {
        type: String, // Cloudinary URLs
      },
    ],
    status: {
      type: String,
      enum: ["draft", "active", "resolved", "cancelled"],
      default: "draft",
    },
    resolvedBy: {
      type: String,
      trim: true,
      default: "",
    },
    resolvedAt: {
      type: Date,
    },
    resolutionNotes: {
      type: String,
      trim: true,
      default: "",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
stopWorkOrderSchema.index({ projectId: 1, dateTime: -1 });
stopWorkOrderSchema.index({ reasonCategory: 1, status: 1 });
stopWorkOrderSchema.index({ areaStopped: 1 });
stopWorkOrderSchema.index({ status: 1 });

// Virtual for reason category display name
stopWorkOrderSchema.virtual("reasonCategoryDisplay").get(function () {
  const categories = {
    unsafe_condition: "Unsafe Condition",
    unsafe_act: "Unsafe Act",
    equipment_failure: "Equipment Failure",
    weather: "Adverse Weather",
    regulatory: "Regulatory Non-compliance",
    other: "Other",
  };
  return categories[this.reasonCategory];
});

// Virtual for duration in hours (if duration is numeric)
stopWorkOrderSchema.virtual("durationHours").get(function () {
  if (!this.duration) return null;
  const numericDuration = parseFloat(this.duration);
  if (!isNaN(numericDuration)) {
    return numericDuration;
  }
  return null;
});

// Method to check if SWO is currently active
stopWorkOrderSchema.methods.isActive = function () {
  return this.status === "active";
};

// Method to resolve SWO
stopWorkOrderSchema.methods.resolve = function (
  resolvedBy,
  resolutionNotes = ""
) {
  this.status = "resolved";
  this.resolvedBy = resolvedBy;
  this.resolvedAt = new Date();
  this.resolutionNotes = resolutionNotes;
};

// Method to cancel SWO
stopWorkOrderSchema.methods.cancel = function (reason = "") {
  this.status = "cancelled";
  this.resolutionNotes = reason;
};

// Pre-save validation
stopWorkOrderSchema.pre("save", function (next) {
  // Validate resolution data if status is resolved
  if (this.status === "resolved" && !this.resolvedBy) {
    return next(
      new Error("Resolved by field is required when status is resolved")
    );
  }

  // Set resolved date if status is resolved and not already set
  if (this.status === "resolved" && !this.resolvedAt) {
    this.resolvedAt = new Date();
  }

  next();
});

module.exports = mongoose.model("StopWorkOrder", stopWorkOrderSchema);
