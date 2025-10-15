const mongoose = require("mongoose");

const incidentReportSchema = new mongoose.Schema(
  {
    // Basic Information
    incidentId: {
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

    // Incident Classification
    incidentType: {
      type: String,
      required: true,
      enum: [
        "near_miss",
        "first_aid",
        "medical",
        "lti",
        "property",
        "environmental",
      ],
    },
    severity: {
      type: String,
      required: true,
      enum: ["low", "medium", "high"],
    },

    // Quick Capture Photos (First 60 seconds)
    quickPhotos: [
      {
        type: String, // Cloudinary URLs
      },
    ],

    // Incident Details
    description: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          // Required only if status is not 'draft'
          return this.status === "draft" || (v && v.trim().length > 0);
        },
        message: "Detailed description is required for submitted reports",
      },
    },
    activity: {
      type: String,
      trim: true,
    },
    equipment: {
      type: String,
      trim: true,
    },
    weather: {
      type: String,
      trim: true,
      default: "Partly Cloudy, 28°C",
    },

    // Documentation Photos/Videos
    photos: [
      {
        type: String, // Cloudinary URLs
        validate: {
          validator: function (v) {
            // Required only if status is not 'draft'
            return this.status === "draft" || this.photos.length > 0;
          },
          message: "At least one photo is required for submitted reports",
        },
      },
    ],

    // Persons Involved
    personName: {
      type: String,
      trim: true,
    },
    personRole: {
      type: String,
      trim: true,
    },
    personCompany: {
      type: String,
      trim: true,
      enum: ["MEIL", "Subcontractor", "Visitor", ""],
      default: "",
    },
    injuryDetails: {
      type: String,
      trim: true,
    },
    treatment: {
      type: String,
      trim: true,
    },

    // Witness Information
    witnessName: {
      type: String,
      trim: true,
    },
    witnessStatement: {
      type: String,
      trim: true,
    },

    // Root Cause Analysis
    immediateCause: {
      type: String,
      trim: true,
    },
    rootCause: {
      type: String,
      trim: true,
    },
    immediateActions: {
      type: String,
      trim: true,
    },
    correctiveActions: {
      type: String,
      trim: true,
    },

    // Status and Workflow
    status: {
      type: String,
      enum: [
        "draft",
        "submitted",
        "under_investigation",
        "investigation_complete",
        "closed",
      ],
      default: "draft",
    },

    // Investigation Details
    investigator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    investigationNotes: {
      type: String,
      trim: true,
    },
    investigationDate: {
      type: Date,
    },

    // Follow-up Actions
    followUpActions: [
      {
        action: {
          type: String,
          required: true,
          trim: true,
        },
        assignedTo: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        dueDate: {
          type: Date,
        },
        status: {
          type: String,
          enum: ["pending", "in_progress", "completed", "overdue"],
          default: "pending",
        },
        completedDate: {
          type: Date,
        },
        completedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],

    // Notification Flags
    smsAlertSent: {
      type: Boolean,
      default: false,
    },
    emailAlertSent: {
      type: Boolean,
      default: false,
    },

    // Metadata
    submittedAt: {
      type: Date,
    },
    closedAt: {
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

// Indexes for better query performance
incidentReportSchema.index({ incidentId: 1 });
incidentReportSchema.index({ dateTime: -1 });
incidentReportSchema.index({ location: 1 });
incidentReportSchema.index({ incidentType: 1 });
incidentReportSchema.index({ severity: 1 });
incidentReportSchema.index({ status: 1 });
incidentReportSchema.index({ createdBy: 1 });
incidentReportSchema.index({ investigator: 1 });

// Virtual for incident type label
incidentReportSchema.virtual("incidentTypeLabel").get(function () {
  const labels = {
    near_miss: "Near Miss",
    first_aid: "First Aid Case",
    medical: "Medical Treatment",
    lti: "Lost Time Injury",
    property: "Property Damage",
    environmental: "Environmental",
  };
  return labels[this.incidentType] || this.incidentType;
});

// Virtual for severity label
incidentReportSchema.virtual("severityLabel").get(function () {
  const labels = {
    low: "Low",
    medium: "Medium",
    high: "High",
  };
  return labels[this.severity] || this.severity;
});

// Virtual for priority level based on type and severity
incidentReportSchema.virtual("priorityLevel").get(function () {
  if (this.incidentType === "lti" || this.severity === "high") {
    return "critical";
  } else if (this.incidentType === "medical" || this.severity === "medium") {
    return "high";
  } else {
    return "normal";
  }
});

// Virtual for photos count
incidentReportSchema.virtual("photosCount").get(function () {
  return this.photos.length;
});

// Virtual for quick photos count
incidentReportSchema.virtual("quickPhotosCount").get(function () {
  return this.quickPhotos.length;
});

// Method to check if high priority (requires immediate attention)
incidentReportSchema.methods.isHighPriority = function () {
  return this.incidentType === "lti" || this.severity === "high";
};

// Method to check if investigation is required
incidentReportSchema.methods.requiresInvestigation = function () {
  return (
    ["lti", "medical", "property"].includes(this.incidentType) ||
    this.severity === "high"
  );
};

// Method to get incident summary
incidentReportSchema.methods.getSummary = function () {
  return {
    id: this.incidentId,
    type: this.incidentTypeLabel,
    severity: this.severityLabel,
    location: this.location,
    dateTime: this.dateTime,
    status: this.status,
    priority: this.priorityLevel,
  };
};

// Pre-save validation
incidentReportSchema.pre("save", function (next) {
  // Set submitted date when status changes to submitted
  if (
    this.isModified("status") &&
    this.status === "submitted" &&
    !this.submittedAt
  ) {
    this.submittedAt = new Date();
  }

  // Set closed date when status changes to closed
  if (this.isModified("status") && this.status === "closed" && !this.closedAt) {
    this.closedAt = new Date();
  }

  // Validate that we have required fields for submitted reports
  if (this.status !== "draft") {
    if (!this.description || this.description.trim().length === 0) {
      return next(
        new Error("Detailed description is required for submitted reports")
      );
    }

    if (this.photos.length === 0) {
      return next(
        new Error("At least one photo is required for submitted reports")
      );
    }
  }

  next();
});

// Static method to generate incident ID
incidentReportSchema.statics.generateIncidentId = function () {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `INC-${year}-${random}`;
};

// Static method to get incident statistics
incidentReportSchema.statics.getStatistics = async function (filter = {}) {
  const stats = await this.aggregate([
    { $match: filter },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        draft: {
          $sum: { $cond: [{ $eq: ["$status", "draft"] }, 1, 0] },
        },
        submitted: {
          $sum: { $cond: [{ $eq: ["$status", "submitted"] }, 1, 0] },
        },
        underInvestigation: {
          $sum: { $cond: [{ $eq: ["$status", "under_investigation"] }, 1, 0] },
        },
        investigationComplete: {
          $sum: {
            $cond: [{ $eq: ["$status", "investigation_complete"] }, 1, 0],
          },
        },
        closed: {
          $sum: { $cond: [{ $eq: ["$status", "closed"] }, 1, 0] },
        },
        low: {
          $sum: { $cond: [{ $eq: ["$severity", "low"] }, 1, 0] },
        },
        medium: {
          $sum: { $cond: [{ $eq: ["$severity", "medium"] }, 1, 0] },
        },
        high: {
          $sum: { $cond: [{ $eq: ["$severity", "high"] }, 1, 0] },
        },
      },
    },
  ]);

  return stats[0] || {};
};

module.exports = mongoose.model("IncidentReport", incidentReportSchema);
