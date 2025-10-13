const mongoose = require("mongoose");

const safetyAdvisoryWarningSchema = new mongoose.Schema(
  {
    projectId: {
      type: String,
      required: true,
      trim: true,
    },
    module: {
      type: String,
      default: "safety_advisory_warning",
      enum: ["safety_advisory_warning"],
    },
    date: {
      type: Date,
      required: true,
    },
    warningTitle: {
      type: String,
      required: true,
      trim: true,
    },
    severity: {
      type: String,
      required: true,
      enum: ["low", "medium", "high", "critical"],
    },
    affectedArea: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    validityFrom: {
      type: Date,
      required: true,
    },
    validityTo: {
      type: Date,
    },
    actionsRequired: {
      type: String,
      required: true,
      trim: true,
    },
    owner: {
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
      enum: ["active", "expired", "cancelled", "resolved"],
      default: "active",
    },
    acknowledgedBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        acknowledgedAt: {
          type: Date,
          default: Date.now,
        },
        notes: {
          type: String,
          trim: true,
        },
      },
    ],
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
safetyAdvisoryWarningSchema.index({ projectId: 1, date: -1 });
safetyAdvisoryWarningSchema.index({ severity: 1, status: 1 });
safetyAdvisoryWarningSchema.index({ affectedArea: 1 });
safetyAdvisoryWarningSchema.index({ validityFrom: 1, validityTo: 1 });
safetyAdvisoryWarningSchema.index({ status: 1 });

// Virtual for severity level number
safetyAdvisoryWarningSchema.virtual("severityLevel").get(function () {
  const levels = { low: 1, medium: 2, high: 3, critical: 4 };
  return levels[this.severity];
});

// Virtual for warning duration in days
safetyAdvisoryWarningSchema.virtual("durationDays").get(function () {
  if (!this.validityTo) return null;
  const diffTime = this.validityTo - this.validityFrom;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for days until expiry
safetyAdvisoryWarningSchema.virtual("daysUntilExpiry").get(function () {
  if (!this.validityTo) return null;
  const now = new Date();
  const diffTime = this.validityTo - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Method to check if warning is currently valid
safetyAdvisoryWarningSchema.methods.isCurrentlyValid = function () {
  const now = new Date();
  return (
    this.status === "active" &&
    this.validityFrom <= now &&
    (!this.validityTo || this.validityTo >= now)
  );
};

// Method to check if warning is expired
safetyAdvisoryWarningSchema.methods.isExpired = function () {
  if (!this.validityTo) return false;
  return new Date() > this.validityTo;
};

// Method to acknowledge warning
safetyAdvisoryWarningSchema.methods.acknowledge = function (
  userId,
  notes = ""
) {
  // Check if user already acknowledged
  const existingAck = this.acknowledgedBy.find(
    (ack) => ack.user.toString() === userId.toString()
  );

  if (existingAck) {
    existingAck.acknowledgedAt = new Date();
    existingAck.notes = notes;
  } else {
    this.acknowledgedBy.push({
      user: userId,
      acknowledgedAt: new Date(),
      notes: notes,
    });
  }
};

// Pre-save validation
safetyAdvisoryWarningSchema.pre("save", function (next) {
  // Validate validity dates
  if (this.validityTo && this.validityTo <= this.validityFrom) {
    return next(
      new Error("Validity end date must be after validity start date")
    );
  }

  // Auto-expire warnings if validityTo has passed
  if (this.validityTo && this.isExpired() && this.status === "active") {
    this.status = "expired";
  }

  next();
});

module.exports = mongoose.model(
  "SafetyAdvisoryWarning",
  safetyAdvisoryWarningSchema
);
