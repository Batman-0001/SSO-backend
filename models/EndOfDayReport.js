const mongoose = require("mongoose");

const endOfDayReportSchema = new mongoose.Schema(
  {
    projectId: {
      type: String,
      required: true,
      trim: true,
    },
    module: {
      type: String,
      default: "end_of_day_report",
      enum: ["end_of_day_report"],
    },
    reportId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    reportDate: {
      type: Date,
      required: true,
    },
    // Work Statistics Section
    workStatistics: {
      totalWorkers: {
        type: Number,
        required: true,
        min: 0,
      },
      meilEmployees: {
        type: Number,
        required: true,
        min: 0,
      },
      subcontractor: {
        type: Number,
        required: true,
        min: 0,
      },
      visitors: {
        type: Number,
        required: true,
        min: 0,
      },
      manHours: {
        type: Number,
        required: true,
        min: 0,
      },
      safeDays: {
        type: Number,
        default: 0,
        min: 0,
      },
      highRiskActivities: [
        {
          activity: {
            type: String,
            enum: [
              "height",
              "hotwork",
              "confined",
              "excavation",
              "lifting",
              "electrical",
            ],
            required: true,
          },
          count: {
            type: Number,
            default: 0,
            min: 0,
          },
        },
      ],
      workPermits: {
        height: {
          type: Number,
          default: 0,
          min: 0,
        },
        hotWork: {
          type: Number,
          default: 0,
          min: 0,
        },
        excavation: {
          type: Number,
          default: 0,
          min: 0,
        },
      },
    },
    // Safety Performance Section
    safetyPerformance: {
      safetyScore: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
      },
      ppeCompliance: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
      },
      housekeeping: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
      },
      equipmentSafety: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
      },
      scoreBreakdown: {
        briefingCompletion: {
          score: {
            type: Number,
            default: 0,
            min: 0,
          },
          maxScore: {
            type: Number,
            default: 20,
          },
        },
        inspectionQuality: {
          score: {
            type: Number,
            default: 0,
            min: 0,
          },
          maxScore: {
            type: Number,
            default: 25,
          },
        },
        ppeCompliance: {
          score: {
            type: Number,
            default: 0,
            min: 0,
          },
          maxScore: {
            type: Number,
            default: 20,
          },
        },
        observationsLogged: {
          score: {
            type: Number,
            default: 0,
            min: 0,
          },
          maxScore: {
            type: Number,
            default: 15,
          },
        },
        zeroIncidents: {
          score: {
            type: Number,
            default: 0,
            min: 0,
          },
          maxScore: {
            type: Number,
            default: 20,
          },
        },
      },
    },
    // Activities Summary Section (Auto-generated from other modules)
    activitiesSummary: {
      toolboxTalks: {
        count: {
          type: Number,
          default: 0,
        },
        attendees: {
          type: Number,
          default: 0,
        },
        topics: [String],
      },
      siteInspections: {
        count: {
          type: Number,
          default: 0,
        },
        categories: [String],
      },
      incidentsReported: {
        count: {
          type: Number,
          default: 0,
        },
        types: [String],
      },
      observationsLogged: {
        count: {
          type: Number,
          default: 0,
        },
        safe: {
          type: Number,
          default: 0,
        },
        unsafe: {
          type: Number,
          default: 0,
        },
      },
      openActions: {
        count: {
          type: Number,
          default: 0,
        },
        critical: {
          type: Number,
          default: 0,
        },
        high: {
          type: Number,
          default: 0,
        },
        medium: {
          type: Number,
          default: 0,
        },
        low: {
          type: Number,
          default: 0,
        },
      },
    },
    // SSO Review Section
    ssoReview: {
      siteStatus: {
        type: String,
        required: function () {
          return this.status !== "draft";
        },
        enum: ["excellent", "good", "satisfactory", "needs_improvement"],
      },
      highlights: {
        type: String,
        required: function () {
          return this.status !== "draft";
        },
        trim: true,
      },
      concerns: {
        type: String,
        trim: true,
        default: "",
      },
      tomorrowPlan: {
        type: String,
        trim: true,
        default: "",
      },
      weatherImpact: {
        type: String,
        trim: true,
        default: "",
      },
      equipmentIssues: {
        type: String,
        trim: true,
        default: "",
      },
      photos: [
        {
          type: String, // Cloudinary URLs
        },
      ],
      ssoSignature: {
        type: String, // Base64 signature or Cloudinary URL
        required: function () {
          return this.status !== "draft";
        },
      },
    },
    // Status and metadata
    status: {
      type: String,
      enum: ["draft", "submitted", "approved", "archived"],
      default: "draft",
    },
    approvedBy: {
      type: String,
      trim: true,
      default: "",
    },
    approvedAt: {
      type: Date,
    },
    approvalNotes: {
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
endOfDayReportSchema.index({ projectId: 1, reportDate: -1 });
endOfDayReportSchema.index({ reportId: 1 });
endOfDayReportSchema.index({ status: 1 });
endOfDayReportSchema.index({ "workStatistics.manHours": -1 });
endOfDayReportSchema.index({ "safetyPerformance.safetyScore": -1 });

// Virtual for total man-hours per worker
endOfDayReportSchema.virtual("averageHoursPerWorker").get(function () {
  if (this.workStatistics.totalWorkers === 0) return 0;
  return (
    this.workStatistics.manHours / this.workStatistics.totalWorkers
  ).toFixed(2);
});

// Virtual for safety performance grade
endOfDayReportSchema.virtual("safetyGrade").get(function () {
  const score = this.safetyPerformance.safetyScore;
  if (score >= 95) return "A+";
  if (score >= 90) return "A";
  if (score >= 85) return "B+";
  if (score >= 80) return "B";
  if (score >= 75) return "C+";
  if (score >= 70) return "C";
  if (score >= 65) return "D+";
  if (score >= 60) return "D";
  return "F";
});

// Virtual for compliance status
endOfDayReportSchema.virtual("complianceStatus").get(function () {
  const ppe = this.safetyPerformance.ppeCompliance;
  const housekeeping = this.safetyPerformance.housekeeping;
  const equipment = this.safetyPerformance.equipmentSafety;

  if (ppe >= 95 && housekeeping >= 95 && equipment >= 95) return "excellent";
  if (ppe >= 90 && housekeeping >= 90 && equipment >= 90) return "good";
  if (ppe >= 80 && housekeeping >= 80 && equipment >= 80) return "satisfactory";
  return "needs_improvement";
});

// Method to calculate safety score
endOfDayReportSchema.methods.calculateSafetyScore = function () {
  const breakdown = this.safetyPerformance.scoreBreakdown;
  const totalScore =
    breakdown.briefingCompletion.score +
    breakdown.inspectionQuality.score +
    breakdown.ppeCompliance.score +
    breakdown.observationsLogged.score +
    breakdown.zeroIncidents.score;
  const maxScore =
    breakdown.briefingCompletion.maxScore +
    breakdown.inspectionQuality.maxScore +
    breakdown.ppeCompliance.maxScore +
    breakdown.observationsLogged.maxScore +
    breakdown.zeroIncidents.maxScore;

  return maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
};

// Method to approve report
endOfDayReportSchema.methods.approve = function (
  approvedBy,
  approvalNotes = ""
) {
  this.status = "approved";
  this.approvedBy = approvedBy;
  this.approvedAt = new Date();
  this.approvalNotes = approvalNotes;
};

// Method to archive report
endOfDayReportSchema.methods.archive = function () {
  this.status = "archived";
};

// Pre-save validation
endOfDayReportSchema.pre("save", function (next) {
  // Validate worker count consistency
  const total =
    this.workStatistics.meilEmployees +
    this.workStatistics.subcontractor +
    this.workStatistics.visitors;
  if (Math.abs(total - this.workStatistics.totalWorkers) > 1) {
    // Allow small discrepancy but warn
    console.warn(
      `Worker count mismatch: calculated ${total}, reported ${this.workStatistics.totalWorkers}`
    );
  }

  // Auto-calculate safety score if not provided
  if (!this.safetyPerformance.safetyScore) {
    this.safetyPerformance.safetyScore = this.calculateSafetyScore();
  }

  // Validate approval requirements
  if (this.status === "approved" && !this.approvedBy) {
    return next(
      new Error("Approved by field is required when status is approved")
    );
  }

  // Set approved date if status is approved and not already set
  if (this.status === "approved" && !this.approvedAt) {
    this.approvedAt = new Date();
  }

  // Validate SSO signature for submitted reports
  if (
    this.status !== "draft" &&
    (!this.ssoReview.ssoSignature ||
      this.ssoReview.ssoSignature.trim().length === 0)
  ) {
    return next(new Error("SSO signature is required for submitted reports"));
  }

  next();
});

module.exports = mongoose.model("EndOfDayReport", endOfDayReportSchema);
