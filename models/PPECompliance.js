const mongoose = require("mongoose");

const ppeItemSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    trim: true,
  },
  label: {
    type: String,
    required: true,
    trim: true,
  },
  icon: {
    type: String,
    required: true,
    trim: true,
  },
  required: {
    type: Boolean,
    default: false,
  },
  compliant: {
    type: Boolean,
    default: false,
  },
  condition: {
    type: String,
    enum: ["good", "fair", "poor", "not_applicable"],
    default: "good",
  },
});

const workerAuditSchema = new mongoose.Schema({
  workerId: {
    type: String,
    trim: true,
    default: "",
  },
  name: {
    type: String,
    trim: true,
    default: "",
  },
  photo: {
    type: String, // Cloudinary URL
    default: "",
  },
  ppeItems: [ppeItemSchema],
  compliant: {
    type: Boolean,
    default: false,
  },
  compliancePercentage: {
    type: Number,
    default: 0,
  },
  notes: {
    type: String,
    trim: true,
    default: "",
  },
});

const ppeComplianceSchema = new mongoose.Schema(
  {
    projectId: {
      type: String,
      required: true,
      trim: true,
    },
    module: {
      type: String,
      default: "ppe_compliance",
      enum: ["ppe_compliance"],
    },
    mode: {
      type: String,
      required: true,
      enum: ["quick", "detailed"],
    },
    area: {
      type: String,
      required: true,
      trim: true,
    },
    activity: {
      type: String,
      required: true,
      trim: true,
    },
    auditDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    auditorName: {
      type: String,
      required: true,
      trim: true,
    },
    auditorId: {
      type: String,
      trim: true,
      default: "",
    },
    // Quick Check Mode Fields
    workersCount: {
      type: Number,
      default: 0,
    },
    compliantCount: {
      type: Number,
      default: 0,
    },
    complianceRate: {
      type: Number,
      default: 0,
    },
    groupPhoto: {
      type: String, // Cloudinary URL
      default: "",
    },
    averagePpeChecks: {
      helmet: { type: Boolean, default: false },
      shoes: { type: Boolean, default: false },
      vest: { type: Boolean, default: false },
      glasses: { type: Boolean, default: false },
      gloves: { type: Boolean, default: false },
      harness: { type: Boolean, default: false },
      earProtection: { type: Boolean, default: false },
    },
    // Detailed Audit Mode Fields
    workerAudits: [workerAuditSchema],
    totalAudited: {
      type: Number,
      default: 0,
    },
    totalCompliant: {
      type: Number,
      default: 0,
    },
    totalIssues: {
      type: Number,
      default: 0,
    },
    overallComplianceRate: {
      type: Number,
      default: 0,
    },
    // Common Fields
    photos: [
      {
        type: String, // Cloudinary URLs
      },
    ],
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    weatherConditions: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["draft", "completed", "reviewed", "action_required"],
      default: "draft",
    },
    actionItems: [
      {
        workerId: String,
        description: String,
        priority: {
          type: String,
          enum: ["low", "medium", "high", "critical"],
          default: "medium",
        },
        status: {
          type: String,
          enum: ["pending", "in_progress", "completed", "cancelled"],
          default: "pending",
        },
        assignedTo: String,
        dueDate: Date,
        completedDate: Date,
        notes: String,
      },
    ],
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
ppeComplianceSchema.index({ projectId: 1, auditDate: -1 });
ppeComplianceSchema.index({ mode: 1, auditDate: -1 });
ppeComplianceSchema.index({ area: 1 });
ppeComplianceSchema.index({ auditorName: 1 });
ppeComplianceSchema.index({ status: 1 });

// Virtual for audit duration
ppeComplianceSchema.virtual("auditDuration").get(function () {
  if (!this.createdAt) return 0;
  return Math.round((new Date() - this.createdAt) / 1000 / 60); // minutes
});

// Virtual for compliance status
ppeComplianceSchema.virtual("complianceStatus").get(function () {
  const rate =
    this.mode === "quick" ? this.complianceRate : this.overallComplianceRate;
  if (rate >= 90) return "excellent";
  if (rate >= 75) return "good";
  if (rate >= 60) return "fair";
  return "poor";
});

// Virtual for action items count
ppeComplianceSchema.virtual("actionItemsCount").get(function () {
  return this.actionItems.length;
});

// Virtual for pending action items count
ppeComplianceSchema.virtual("pendingActionItemsCount").get(function () {
  return this.actionItems.filter((item) => item.status === "pending").length;
});

// Method to calculate compliance statistics
ppeComplianceSchema.methods.calculateCompliance = function () {
  if (this.mode === "quick") {
    // Quick check mode
    if (this.workersCount > 0) {
      this.complianceRate = Math.round(
        (this.compliantCount / this.workersCount) * 100
      );
    }
  } else {
    // Detailed audit mode
    this.totalAudited = this.workerAudits.length;
    this.totalCompliant = this.workerAudits.filter(
      (worker) => worker.compliant
    ).length;
    this.totalIssues = this.totalAudited - this.totalCompliant;

    if (this.totalAudited > 0) {
      this.overallComplianceRate = Math.round(
        (this.totalCompliant / this.totalAudited) * 100
      );
    }
  }

  // Determine status based on compliance
  if (this.mode === "quick") {
    if (this.complianceRate < 75) {
      this.status = "action_required";
    } else if (this.complianceRate >= 90) {
      this.status = "completed";
    }
  } else {
    if (this.overallComplianceRate < 75) {
      this.status = "action_required";
    } else if (this.overallComplianceRate >= 90) {
      this.status = "completed";
    }
  }
};

// Method to add worker audit
ppeComplianceSchema.methods.addWorkerAudit = function (workerData) {
  const workerAudit = {
    workerId: workerData.workerId || "",
    name: workerData.name || "",
    photo: workerData.photo || "",
    ppeItems: workerData.ppeItems || [],
    compliant: workerData.compliant || false,
    compliancePercentage: workerData.compliancePercentage || 0,
    notes: workerData.notes || "",
  };

  this.workerAudits.push(workerAudit);
  this.calculateCompliance();
};

// Method to update worker audit
ppeComplianceSchema.methods.updateWorkerAudit = function (index, workerData) {
  if (index >= 0 && index < this.workerAudits.length) {
    const worker = this.workerAudits[index];
    worker.workerId = workerData.workerId || worker.workerId;
    worker.name = workerData.name || worker.name;
    worker.photo = workerData.photo || worker.photo;
    worker.ppeItems = workerData.ppeItems || worker.ppeItems;
    worker.compliant = workerData.compliant || worker.compliant;
    worker.compliancePercentage =
      workerData.compliancePercentage || worker.compliancePercentage;
    worker.notes = workerData.notes || worker.notes;

    this.calculateCompliance();
  }
};

// Method to add action item
ppeComplianceSchema.methods.addActionItem = function (itemData) {
  this.actionItems.push({
    workerId: itemData.workerId || "",
    description: itemData.description || "",
    priority: itemData.priority || "medium",
    status: "pending",
    assignedTo: itemData.assignedTo || "",
    dueDate: itemData.dueDate ? new Date(itemData.dueDate) : undefined,
    notes: itemData.notes || "",
  });
};

// Pre-save middleware to calculate compliance
ppeComplianceSchema.pre("save", function (next) {
  // Calculate compliance statistics
  this.calculateCompliance();

  // Validate required fields based on mode
  if (this.mode === "quick") {
    if (!this.workersCount || !this.area || !this.activity) {
      return next(
        new Error(
          "Area, activity, and workers count are required for quick check mode"
        )
      );
    }
  } else {
    if (!this.area || !this.activity) {
      return next(
        new Error("Area and activity are required for detailed audit mode")
      );
    }
  }

  // Validate audit date is not in the future
  if (this.auditDate > new Date()) {
    return next(new Error("Audit date cannot be in the future"));
  }

  next();
});

module.exports = mongoose.model("PPECompliance", ppeComplianceSchema);
