const mongoose = require("mongoose");

const dailyBriefingSchema = new mongoose.Schema(
  {
    // Basic Information
    talkNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
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
    conductedBy: {
      type: String,
      required: true,
      trim: true,
    },
    duration: {
      type: String,
      required: true,
      enum: ["15", "30", "45"],
    },

    // Topic Information
    topicCategory: {
      type: String,
      required: true,
      enum: [
        "Working at Height",
        "Electrical Safety",
        "Excavation Safety",
        "PPE Usage",
        "Manual Handling",
        "Hot Work Safety",
        "Confined Space Entry",
        "Scaffolding Safety",
        "Crane Operations",
        "Fall Protection",
        "Fire Safety",
        "Chemical Handling",
        "Machine Guarding",
        "Housekeeping",
        "Emergency Procedures",
        "Custom Topic",
      ],
    },
    customTopic: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          return (
            this.topicCategory !== "Custom Topic" || (v && v.trim().length > 0)
          );
        },
        message: "Custom topic is required when topic category is Custom Topic",
      },
    },

    // Attendance Information
    attendeesCount: {
      type: Number,
      required: true,
      min: 1,
    },
    attendanceMethod: {
      type: String,
      required: true,
      enum: ["digital", "photo", "manual"],
    },

    // Digital Signatures (for attendanceMethod: 'digital')
    digitalSignatures: [
      {
        name: {
          type: String,
          required: function () {
            return this.parent().attendanceMethod === "digital";
          },
          trim: true,
        },
        signature: {
          type: String, // Base64 encoded signature
          required: function () {
            return this.parent().attendanceMethod === "digital";
          },
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Attendance Photos (for attendanceMethod: 'photo')
    attendancePhotos: [
      {
        type: String, // Cloudinary URLs
        validate: {
          validator: function (v) {
            return (
              this.parent().attendanceMethod !== "photo" ||
              this.parent().attendancePhotos.length > 0
            );
          },
          message:
            "At least one attendance photo is required when attendance method is photo",
        },
      },
    ],

    // Manual Attendees List (for attendanceMethod: 'manual')
    attendeesList: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          return (
            this.attendanceMethod !== "manual" || (v && v.trim().length > 0)
          );
        },
        message: "Attendees list is required when attendance method is manual",
      },
    },

    // Content Information
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
    hazardsDiscussed: {
      type: String,
      trim: true,
    },
    controlMeasures: {
      type: String,
      trim: true,
    },
    questionsRaised: {
      type: String,
      trim: true,
    },

    // Documentation - Mandatory Photos
    photos: [
      {
        type: String, // Cloudinary URLs
        required: true,
      },
    ],

    // Metadata
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["draft", "submitted", "approved", "rejected"],
      default: "submitted",
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

// Indexes for better query performance
dailyBriefingSchema.index({ talkNumber: 1 });
dailyBriefingSchema.index({ dateTime: -1 });
dailyBriefingSchema.index({ location: 1 });
dailyBriefingSchema.index({ topicCategory: 1 });
dailyBriefingSchema.index({ status: 1 });
dailyBriefingSchema.index({ createdBy: 1 });

// Virtual for getting the final topic (either category or custom)
dailyBriefingSchema.virtual("finalTopic").get(function () {
  return this.topicCategory === "Custom Topic"
    ? this.customTopic
    : this.topicCategory;
});

// Virtual for duration in minutes
dailyBriefingSchema.virtual("durationMinutes").get(function () {
  return parseInt(this.duration);
});

// Virtual for key points count
dailyBriefingSchema.virtual("keyPointsCount").get(function () {
  return this.keyPoints.length;
});

// Virtual for photos count
dailyBriefingSchema.virtual("photosCount").get(function () {
  return this.photos.length;
});

// Method to get valid key points
dailyBriefingSchema.methods.getValidKeyPoints = function () {
  return this.keyPoints.filter((point) => point && point.trim().length > 0);
};

// Method to validate attendance based on method
dailyBriefingSchema.methods.validateAttendance = function () {
  switch (this.attendanceMethod) {
    case "digital":
      return this.digitalSignatures && this.digitalSignatures.length > 0;
    case "photo":
      return this.attendancePhotos && this.attendancePhotos.length > 0;
    case "manual":
      return this.attendeesList && this.attendeesList.trim().length > 0;
    default:
      return false;
  }
};

// Pre-save validation
dailyBriefingSchema.pre("save", function (next) {
  // Filter out empty key points
  this.keyPoints = this.keyPoints.filter(
    (point) => point && point.trim().length > 0
  );

  // Validate that we have at least one key point
  if (this.keyPoints.length === 0) {
    return next(new Error("At least one key point is required"));
  }

  // Validate that we have at least one photo
  if (this.photos.length === 0) {
    return next(new Error("At least one photo is required"));
  }

  // Validate attendance based on method
  if (!this.validateAttendance()) {
    return next(new Error("Invalid attendance data for selected method"));
  }

  // Validate custom topic when needed
  if (
    this.topicCategory === "Custom Topic" &&
    (!this.customTopic || this.customTopic.trim().length === 0)
  ) {
    return next(
      new Error("Custom topic is required when topic category is Custom Topic")
    );
  }

  next();
});

// Static method to generate talk number
dailyBriefingSchema.statics.generateTalkNumber = function () {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `TBT-${year}-${random}`;
};

module.exports = mongoose.model("DailyBriefing", dailyBriefingSchema);
