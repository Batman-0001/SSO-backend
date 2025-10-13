const mongoose = require("mongoose");

const nearMissSchema = new mongoose.Schema(
  {
    projectId: {
      type: String,
      required: true,
      trim: true,
    },
    module: {
      type: String,
      default: "near_miss",
      enum: ["near_miss"],
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
    situation: {
      type: String,
      required: true,
      trim: true,
    },
    potentialConsequence: {
      type: String,
      required: true,
      trim: true,
    },
    preventiveActions: {
      type: String,
      required: true,
      trim: true,
    },
    reportedBy: {
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
      enum: ["reported", "under_review", "action_taken", "closed"],
      default: "reported",
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    reviewNotes: {
      type: String,
      trim: true,
      default: "",
    },
    actionsTaken: {
      type: String,
      trim: true,
      default: "",
    },
    actionOwner: {
      type: String,
      trim: true,
      default: "",
    },
    actionDeadline: {
      type: Date,
    },
    actionCompleted: {
      type: Boolean,
      default: false,
    },
    actionCompletedDate: {
      type: Date,
    },
    lessonsLearned: {
      type: String,
      trim: true,
      default: "",
    },
    sharedWithTeam: {
      type: Boolean,
      default: false,
    },
    sharedDate: {
      type: Date,
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
nearMissSchema.index({ projectId: 1, dateTime: -1 });
nearMissSchema.index({ location: 1 });
nearMissSchema.index({ severity: 1, status: 1 });
nearMissSchema.index({ status: 1 });
nearMissSchema.index({ actionDeadline: 1 });

// Virtual for severity level number
nearMissSchema.virtual("severityLevel").get(function () {
  const levels = { low: 1, medium: 2, high: 3, critical: 4 };
  return levels[this.severity];
});

// Virtual for days until action deadline
nearMissSchema.virtual("daysUntilDeadline").get(function () {
  if (!this.actionDeadline) return null;
  const now = new Date();
  const diffTime = this.actionDeadline - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for action overdue status
nearMissSchema.virtual("isActionOverdue").get(function () {
  if (!this.actionDeadline || this.actionCompleted) return false;
  return new Date() > this.actionDeadline;
});

// Method to mark as under review
nearMissSchema.methods.markUnderReview = function (reviewNotes = "") {
  this.status = "under_review";
  this.reviewNotes = reviewNotes;
};

// Method to assign action
nearMissSchema.methods.assignAction = function (
  actionsTaken,
  actionOwner,
  actionDeadline
) {
  this.status = "action_taken";
  this.actionsTaken = actionsTaken;
  this.actionOwner = actionOwner;
  this.actionDeadline = new Date(actionDeadline);
};

// Method to complete action
nearMissSchema.methods.completeAction = function (lessonsLearned = "") {
  this.actionCompleted = true;
  this.actionCompletedDate = new Date();
  this.lessonsLearned = lessonsLearned;
  this.status = "closed";
};

// Method to share with team
nearMissSchema.methods.shareWithTeam = function () {
  this.sharedWithTeam = true;
  this.sharedDate = new Date();
};

// Pre-save validation
nearMissSchema.pre("save", function (next) {
  // Validate action deadline if action is assigned
  if (this.status === "action_taken" && !this.actionDeadline) {
    return next(
      new Error("Action deadline is required when action is assigned")
    );
  }

  // Validate action completion
  if (this.actionCompleted && !this.actionCompletedDate) {
    this.actionCompletedDate = new Date();
  }

  // Auto-close if action is completed
  if (this.actionCompleted && this.status !== "closed") {
    this.status = "closed";
  }

  next();
});

module.exports = mongoose.model("NearMiss", nearMissSchema);
