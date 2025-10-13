const mongoose = require("mongoose");

const attendeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  empId: {
    type: String,
    required: true,
    trim: true,
  },
  contractor: {
    type: String,
    trim: true,
    default: "",
  },
});

const inductionTrainingSchema = new mongoose.Schema(
  {
    projectId: {
      type: String,
      required: true,
      trim: true,
    },
    module: {
      type: String,
      default: "induction_training",
      enum: ["induction_training"],
    },
    trainingDate: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
      min: 1, // Minimum 1 minute
    },
    contractor: {
      type: String,
      trim: true,
      default: "",
    },
    trainerName: {
      type: String,
      required: true,
      trim: true,
    },
    attendanceCount: {
      type: Number,
      required: true,
      min: 0,
    },
    attendees: [attendeeSchema],
    notes: {
      type: String,
      trim: true,
      default: "",
    },
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
inductionTrainingSchema.index({ projectId: 1, trainingDate: -1 });
inductionTrainingSchema.index({ contractor: 1, trainingDate: -1 });
inductionTrainingSchema.index({ trainerName: 1 });

// Virtual for training duration in hours
inductionTrainingSchema.virtual("durationHours").get(function () {
  return Math.round((this.duration / 60) * 100) / 100; // Round to 2 decimal places
});

// Method to validate attendance count matches attendees array
inductionTrainingSchema.methods.validateAttendance = function () {
  return this.attendanceCount === this.attendees.length;
};

// Pre-save validation
inductionTrainingSchema.pre("save", function (next) {
  // Validate attendance count matches attendees array
  if (this.attendanceCount !== this.attendees.length) {
    return next(
      new Error(
        "Attendance count must match the number of attendees in the list"
      )
    );
  }

  // Validate training date is not in the future for completed trainings
  if (this.status === "completed" && this.trainingDate > new Date()) {
    return next(
      new Error("Training date cannot be in the future for completed trainings")
    );
  }

  next();
});

module.exports = mongoose.model("InductionTraining", inductionTrainingSchema);
