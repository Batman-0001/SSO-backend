const mongoose = require("mongoose");

const itemResultSchema = new mongoose.Schema({
  itemId: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    required: true,
    enum: ["pass", "fail", "na"],
  },
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
  actionRequired: {
    type: Boolean,
    default: false,
  },
  actionTaken: {
    type: String,
    trim: true,
    default: "",
  },
  actionDate: {
    type: Date,
  },
});

const inspectionResultSchema = new mongoose.Schema(
  {
    projectId: {
      type: String,
      required: true,
      trim: true,
    },
    categoryId: {
      type: String,
      required: true,
      trim: true,
    },
    categoryTitle: {
      type: String,
      required: true,
      trim: true,
    },
    inspectionDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    inspectorName: {
      type: String,
      required: true,
      trim: true,
    },
    inspectorId: {
      type: String,
      trim: true,
      default: "",
    },
    itemResults: [itemResultSchema],
    overallStatus: {
      type: String,
      enum: ["draft", "in_progress", "completed", "needs_action", "closed"],
      default: "draft",
    },
    passCount: {
      type: Number,
      default: 0,
    },
    failCount: {
      type: Number,
      default: 0,
    },
    naCount: {
      type: Number,
      default: 0,
    },
    totalItems: {
      type: Number,
      default: 0,
    },
    passPercentage: {
      type: Number,
      default: 0,
    },
    criticalFailures: {
      type: Number,
      default: 0,
    },
    actionItems: [
      {
        itemId: String,
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
inspectionResultSchema.index({ projectId: 1, inspectionDate: -1 });
inspectionResultSchema.index({ categoryId: 1, inspectionDate: -1 });
inspectionResultSchema.index({ inspectorName: 1 });
inspectionResultSchema.index({ overallStatus: 1 });
inspectionResultSchema.index({ location: 1 });

// Virtual for inspection completion percentage
inspectionResultSchema.virtual("completionPercentage").get(function () {
  if (this.totalItems === 0) return 0;
  return Math.round(
    ((this.passCount + this.failCount + this.naCount) / this.totalItems) * 100
  );
});

// Virtual for critical action items count
inspectionResultSchema.virtual("criticalActionItemsCount").get(function () {
  return this.actionItems.filter(
    (item) => item.priority === "critical" && item.status !== "completed"
  ).length;
});

// Virtual for pending action items count
inspectionResultSchema.virtual("pendingActionItemsCount").get(function () {
  return this.actionItems.filter((item) => item.status === "pending").length;
});

// Method to calculate statistics
inspectionResultSchema.methods.calculateStatistics = function () {
  const passCount = this.itemResults.filter(
    (item) => item.status === "pass"
  ).length;
  const failCount = this.itemResults.filter(
    (item) => item.status === "fail"
  ).length;
  const naCount = this.itemResults.filter(
    (item) => item.status === "na"
  ).length;
  const totalItems = this.itemResults.length;
  const passPercentage =
    totalItems > 0 ? Math.round((passCount / totalItems) * 100) : 0;

  this.passCount = passCount;
  this.failCount = failCount;
  this.naCount = naCount;
  this.totalItems = totalItems;
  this.passPercentage = passPercentage;

  // Determine overall status
  if (failCount > 0) {
    this.overallStatus = "needs_action";
  } else if (totalItems > 0 && passCount + naCount === totalItems) {
    this.overallStatus = "completed";
  }
};

// Method to add action item
inspectionResultSchema.methods.addActionItem = function (
  itemId,
  description,
  priority = "medium"
) {
  const existingItem = this.actionItems.find((item) => item.itemId === itemId);

  if (existingItem) {
    existingItem.description = description;
    existingItem.priority = priority;
    existingItem.status = "pending";
  } else {
    this.actionItems.push({
      itemId,
      description,
      priority,
      status: "pending",
    });
  }
};

// Method to get item result
inspectionResultSchema.methods.getItemResult = function (itemId) {
  return this.itemResults.find((result) => result.itemId === itemId);
};

// Method to update item result
inspectionResultSchema.methods.updateItemResult = function (
  itemId,
  status,
  notes = "",
  photos = [],
  actionRequired = false
) {
  const existingResult = this.getItemResult(itemId);

  if (existingResult) {
    existingResult.status = status;
    existingResult.notes = notes;
    existingResult.photos = photos;
    existingResult.actionRequired = actionRequired;
  } else {
    this.itemResults.push({
      itemId,
      status,
      notes,
      photos,
      actionRequired,
    });
  }

  // Recalculate statistics
  this.calculateStatistics();
};

// Pre-save middleware to calculate statistics
inspectionResultSchema.pre("save", function (next) {
  // Calculate statistics
  this.calculateStatistics();

  // Validate item results
  if (this.itemResults.length === 0) {
    return next(new Error("At least one item result is required"));
  }

  // Validate inspection date is not in the future for completed inspections
  if (this.overallStatus === "completed" && this.inspectionDate > new Date()) {
    return next(
      new Error(
        "Inspection date cannot be in the future for completed inspections"
      )
    );
  }

  next();
});

module.exports = mongoose.model("InspectionResult", inspectionResultSchema);
