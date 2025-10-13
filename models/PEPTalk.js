const mongoose = require("mongoose");

const pepTalkSchema = new mongoose.Schema(
  {
    projectId: {
      type: String,
      required: true,
      trim: true,
    },
    module: {
      type: String,
      default: "pep_talk",
      enum: ["pep_talk"],
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
pepTalkSchema.index({ projectId: 1, date: -1 });
pepTalkSchema.index({ topic: 1, date: -1 });
pepTalkSchema.index({ trainer: 1, date: -1 });

// Virtual for training duration in hours
pepTalkSchema.virtual("durationHours").get(function () {
  return Math.round((this.duration / 60) * 100) / 100; // Round to 2 decimal places
});

// Virtual for key points count
pepTalkSchema.virtual("keyPointsCount").get(function () {
  return this.keyPoints.length;
});

// Method to get non-empty key points
pepTalkSchema.methods.getValidKeyPoints = function () {
  return this.keyPoints.filter((point) => point && point.trim().length > 0);
};

// Pre-save validation
pepTalkSchema.pre("save", function (next) {
  // Filter out empty key points
  this.keyPoints = this.keyPoints.filter(
    (point) => point && point.trim().length > 0
  );

  // Validate that we have at least one key point
  if (this.keyPoints.length === 0) {
    return next(new Error("At least one key point is required"));
  }

  // Validate training date is not in the future for completed talks
  if (this.status === "completed" && this.date > new Date()) {
    return next(
      new Error("PEP talk date cannot be in the future for completed talks")
    );
  }

  next();
});

module.exports = mongoose.model("PEPTalk", pepTalkSchema);
