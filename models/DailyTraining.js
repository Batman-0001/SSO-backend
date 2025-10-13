const mongoose = require("mongoose");

const dailyTrainingSchema = new mongoose.Schema(
  {
    projectId: {
      type: String,
      required: true,
      trim: true,
    },
    module: {
      type: String,
      default: "daily_training",
      enum: ["daily_training"],
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
            return v && v.trim().length > 0;
          },
          message: "Key points cannot be empty",
        },
      },
    ],
    photos: [
      {
        type: String, // Cloudinary URLs
      },
    ],
    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled"],
      default: "completed",
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
dailyTrainingSchema.index({ projectId: 1, date: -1 });
dailyTrainingSchema.index({ topic: 1, date: -1 });
dailyTrainingSchema.index({ trainer: 1, date: -1 });

// Virtual for training duration in hours
dailyTrainingSchema.virtual("durationHours").get(function () {
  return Math.round((this.duration / 60) * 100) / 100; // Round to 2 decimal places
});

// Virtual for key points count
dailyTrainingSchema.virtual("keyPointsCount").get(function () {
  return this.keyPoints.length;
});

// Method to get non-empty key points
dailyTrainingSchema.methods.getValidKeyPoints = function () {
  return this.keyPoints.filter((point) => point && point.trim().length > 0);
};

// Pre-save validation
dailyTrainingSchema.pre("save", function (next) {
  // Filter out empty key points
  this.keyPoints = this.keyPoints.filter(
    (point) => point && point.trim().length > 0
  );

  // Validate that we have at least one key point
  if (this.keyPoints.length === 0) {
    return next(new Error("At least one key point is required"));
  }

  // Validate training date is not in the future for completed trainings
  if (this.status === "completed" && this.date > new Date()) {
    return next(
      new Error("Training date cannot be in the future for completed trainings")
    );
  }

  next();
});

module.exports = mongoose.model("DailyTraining", dailyTrainingSchema);
