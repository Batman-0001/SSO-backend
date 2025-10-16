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
    status: {
      type: String,
      enum: ["draft", "open", "in_progress", "closed", "cancelled"],
      default: "draft",
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
  // Only validate required fields for non-draft status
  if (this.status !== "draft") {
    // Validate required fields for submitted observations
    if (
      !this.type ||
      !this.location ||
      !this.observedBy ||
      !this.severity ||
      !this.description ||
      !this.actionOwner
    ) {
      return next(
        new Error(
          "All required fields must be filled for submitted observations"
        )
      );
    }

    // Validate description length
    if (this.description.length < 10) {
      return next(new Error("Description must be at least 10 characters"));
    }

    // Validate corrective action requirement
    if (this.requiresCorrectiveAction() && !this.correctiveAction) {
      return next(
        new Error(
          "Corrective action is required for Medium/High/Critical severity"
        )
      );
    }
  }

  // Validate photos array length
  if (this.photos && this.photos.length > 6) {
    return next(new Error("Maximum 6 photos allowed"));
  }

  next();
});

module.exports = mongoose.model("SafetyObservation", safetyObservationSchema);
