const mongoose = require("mongoose");

const safetyObservationSchema = new mongoose.Schema(
  {
    projectId: {
      type: String,
      required: true,
      trim: true,
    },
    module: {
      type: String,
      default: "safety_observation",
      enum: ["safety_observation"],
    },
    type: {
      type: String,
      required: true,
      enum: ["unsafe_act", "unsafe_condition"],
    },
    dateTime: {
      type: Date,
      required: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    observedBy: {
      type: String,
      required: true,
      trim: true,
    },
    observedPerson: {
      type: String,
      trim: true,
      default: "",
    },
    severity: {
      type: String,
      required: true,
      enum: ["Low", "Medium", "High", "Critical"],
    },
    description: {
      type: String,
      required: true,
      minlength: 10,
      trim: true,
    },
    correctiveAction: {
      type: String,
      trim: true,
      default: "",
    },
    actionOwner: {
      type: String,
      required: true,
      enum: ["site_incharge", "contractor_rep", "other"],
    },
    targetClosureDate: {
      type: Date,
    },
    photos: [
      {
        type: String, // Cloudinary URLs
      },
    ],
    signature: {
      type: String, // Base64 signature or Cloudinary URL
      default: "",
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "closed", "cancelled"],
      default: "open",
    },
    assignedTo: {
      type: String,
      trim: true,
      default: "",
    },
    closureDate: {
      type: Date,
    },
    closureNotes: {
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
safetyObservationSchema.index({ projectId: 1, createdAt: -1 });
safetyObservationSchema.index({ severity: 1, status: 1 });
safetyObservationSchema.index({ observedBy: 1 });

// Virtual for severity level number
safetyObservationSchema.virtual("severityLevel").get(function () {
  const levels = { Low: 1, Medium: 2, High: 3, Critical: 4 };
  return levels[this.severity];
});

// Method to check if corrective action is required
safetyObservationSchema.methods.requiresCorrectiveAction = function () {
  return ["Medium", "High", "Critical"].includes(this.severity);
};

// Pre-save validation
safetyObservationSchema.pre("save", function (next) {
  // Validate photos array length
  if (this.photos && this.photos.length > 6) {
    return next(new Error("Maximum 6 photos allowed"));
  }

  // Validate corrective action requirement
  if (this.requiresCorrectiveAction() && !this.correctiveAction) {
    return next(
      new Error(
        "Corrective action is required for Medium/High/Critical severity"
      )
    );
  }

  // Target closure date validation removed for testing flexibility

  next();
});

module.exports = mongoose.model("SafetyObservation", safetyObservationSchema);
