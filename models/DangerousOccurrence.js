const mongoose = require("mongoose");

const dangerousOccurrenceSchema = new mongoose.Schema(
  {
    projectId: {
      type: String,
      required: true,
      trim: true,
    },
    module: {
      type: String,
      default: "dangerous_occurrence",
      enum: ["dangerous_occurrence"],
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
    investigationRequired: {
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
      enum: [
        "draft",
        "reported",
        "under_investigation",
        "investigation_complete",
        "closed",
      ],
      default: "draft",
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "high",
    },
    investigationNotes: {
      type: String,
      trim: true,
      default: "",
    },
    investigator: {
      type: String,
      trim: true,
      default: "",
    },
    investigationStartDate: {
      type: Date,
    },
    investigationEndDate: {
      type: Date,
    },
    investigationFindings: {
      type: String,
      trim: true,
      default: "",
    },
    rootCause: {
      type: String,
      trim: true,
      default: "",
    },
    correctiveActions: {
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
    headOfficeNotified: {
      type: Boolean,
      default: false,
    },
    headOfficeNotificationDate: {
      type: Date,
    },
    headOfficeResponse: {
      type: String,
      trim: true,
      default: "",
    },
    regulatoryReportRequired: {
      type: Boolean,
      default: false,
    },
    regulatoryReportSubmitted: {
      type: Boolean,
      default: false,
    },
    regulatoryReportDate: {
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
dangerousOccurrenceSchema.index({ projectId: 1, dateTime: -1 });
dangerousOccurrenceSchema.index({ location: 1 });
dangerousOccurrenceSchema.index({ severity: 1, status: 1 });
dangerousOccurrenceSchema.index({ investigationRequired: 1 });
dangerousOccurrenceSchema.index({ headOfficeNotified: 1 });
dangerousOccurrenceSchema.index({ regulatoryReportRequired: 1 });

// Virtual for severity level number
dangerousOccurrenceSchema.virtual("severityLevel").get(function () {
  const levels = { low: 1, medium: 2, high: 3, critical: 4 };
  return levels[this.severity];
});

// Virtual for investigation duration in days
dangerousOccurrenceSchema.virtual("investigationDuration").get(function () {
  if (!this.investigationStartDate || !this.investigationEndDate) return null;
  const diffTime = this.investigationEndDate - this.investigationStartDate;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for days until action deadline
dangerousOccurrenceSchema.virtual("daysUntilDeadline").get(function () {
  if (!this.actionDeadline) return null;
  const now = new Date();
  const diffTime = this.actionDeadline - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for action overdue status
dangerousOccurrenceSchema.virtual("isActionOverdue").get(function () {
  if (!this.actionDeadline || this.actionCompleted) return false;
  return new Date() > this.actionDeadline;
});

// Method to start investigation
dangerousOccurrenceSchema.methods.startInvestigation = function (
  investigator,
  notes = ""
) {
  this.status = "under_investigation";
  this.investigator = investigator;
  this.investigationStartDate = new Date();
  this.investigationNotes = notes;
};

// Method to complete investigation
dangerousOccurrenceSchema.methods.completeInvestigation = function (
  findings,
  rootCause,
  correctiveActions
) {
  this.status = "investigation_complete";
  this.investigationEndDate = new Date();
  this.investigationFindings = findings;
  this.rootCause = rootCause;
  this.correctiveActions = correctiveActions;
};

// Method to assign corrective action
dangerousOccurrenceSchema.methods.assignCorrectiveAction = function (
  actionOwner,
  actionDeadline
) {
  this.actionOwner = actionOwner;
  this.actionDeadline = new Date(actionDeadline);
};

// Method to complete corrective action
dangerousOccurrenceSchema.methods.completeCorrectiveAction = function (
  lessonsLearned = ""
) {
  this.actionCompleted = true;
  this.actionCompletedDate = new Date();
  this.lessonsLearned = lessonsLearned;
  this.status = "closed";
};

// Method to notify head office
dangerousOccurrenceSchema.methods.notifyHeadOffice = function () {
  this.headOfficeNotified = true;
  this.headOfficeNotificationDate = new Date();
};

// Method to submit regulatory report
dangerousOccurrenceSchema.methods.submitRegulatoryReport = function () {
  this.regulatoryReportSubmitted = true;
  this.regulatoryReportDate = new Date();
};

// Method to share with team
dangerousOccurrenceSchema.methods.shareWithTeam = function () {
  this.sharedWithTeam = true;
  this.sharedDate = new Date();
};

// Pre-save validation
dangerousOccurrenceSchema.pre("save", function (next) {
  // Only validate required fields for non-draft status
  if (this.status !== "draft") {
    // Validate required fields for submitted reports
    if (
      !this.location ||
      !this.situation ||
      !this.potentialConsequence ||
      !this.preventiveActions
    ) {
      return next(
        new Error("All required fields must be filled for submitted reports")
      );
    }
  }

  // Auto-notify head office if investigation required
  if (this.investigationRequired && !this.headOfficeNotified) {
    this.notifyHeadOffice();
  }

  // Validate investigation dates
  if (
    this.investigationEndDate &&
    this.investigationStartDate &&
    this.investigationEndDate < this.investigationStartDate
  ) {
    return next(new Error("Investigation end date must be after start date"));
  }

  // Validate action deadline if action is assigned
  if (this.actionOwner && !this.actionDeadline) {
    return next(
      new Error("Action deadline is required when action owner is assigned")
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

module.exports = mongoose.model(
  "DangerousOccurrence",
  dangerousOccurrenceSchema
);
