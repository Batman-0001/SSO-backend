const mongoose = require("mongoose");

const specialTrainingSchema = new mongoose.Schema(
  {
    projectId: {
      type: String,
      required: true,
      trim: true,
    },
    module: {
      type: String,
      default: "special_training",
      enum: ["special_training"],
    },
    date: {
      type: Date,
      required: true,
    },
    topic: {
      type: String,
      required: true,
      trim: true,
    },
    duration: {
      type: Number,
      required: true,
      min: 1, // Minimum 1 minute
    },
    trainer: {
      type: String,
      required: true,
      trim: true,
    },
    attendeesCount: {
      type: Number,
      required: true,
      min: 0,
    },
    keyPoints: [
      {
        type: String,
        trim: true,
        validate: {
          validator: function (v) {
            // Required only if status is not 'draft'
            return this.status === "draft" || (v && v.trim().length > 0);
          },
          message: "Key points cannot be empty for submitted trainings",
        },
      },
    ],
    certificationsIssued: {
      type: Boolean,
      default: false,
    },
    permitRequired: {
      type: Boolean,
      default: false,
    },
    photos: [
      {
        type: String, // Cloudinary URLs
      },
    ],
    status: {
      type: String,
      enum: ["draft", "scheduled", "completed", "cancelled"],
      default: "draft",
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
specialTrainingSchema.index({ projectId: 1, date: -1 });
specialTrainingSchema.index({ topic: 1, date: -1 });
specialTrainingSchema.index({ trainer: 1, date: -1 });
specialTrainingSchema.index({ certificationsIssued: 1 });
specialTrainingSchema.index({ permitRequired: 1 });

// Virtual for training duration in hours
specialTrainingSchema.virtual("durationHours").get(function () {
  return Math.round((this.duration / 60) * 100) / 100; // Round to 2 decimal places
});

// Virtual for key points count
specialTrainingSchema.virtual("keyPointsCount").get(function () {
  return this.keyPoints.length;
});

// Method to get non-empty key points
specialTrainingSchema.methods.getValidKeyPoints = function () {
  return this.keyPoints.filter((point) => point && point.trim().length > 0);
};

// Method to check if this is a certification training
specialTrainingSchema.methods.isCertificationTraining = function () {
  return this.certificationsIssued;
};

// Method to check if this training requires a permit
specialTrainingSchema.methods.requiresPermit = function () {
  return this.permitRequired;
};

// Pre-save validation
specialTrainingSchema.pre("save", function (next) {
  // Filter out empty key points
  this.keyPoints = this.keyPoints.filter(
    (point) => point && point.trim().length > 0
  );

  // Validate that we have at least one key point for non-draft status
  if (this.status !== "draft" && this.keyPoints.length === 0) {
    return next(
      new Error("At least one key point is required for submitted trainings")
    );
  }

  // Validate training date is not in the future for completed trainings
  if (this.status === "completed" && this.date > new Date()) {
    return next(
      new Error(
        "Special training date cannot be in the future for completed trainings"
      )
    );
  }

  next();
});

module.exports = mongoose.model("SpecialTraining", specialTrainingSchema);
