const mongoose = require("mongoose");

const checklistItemSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    trim: true,
  },
  item: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    trim: true,
    default: "",
  },
  requiresPhoto: {
    type: Boolean,
    default: false,
  },
  requiresAction: {
    type: Boolean,
    default: false,
  },
  critical: {
    type: Boolean,
    default: false,
  },
});

const inspectionCategorySchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    icon: {
      type: String,
      required: true,
      trim: true,
    },
    checklistItems: [checklistItemSchema],
    projectId: {
      type: String,
      required: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
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
inspectionCategorySchema.index({ projectId: 1, isActive: 1 });
inspectionCategorySchema.index({ title: 1 });
inspectionCategorySchema.index({ "checklistItems.id": 1 });

// Virtual for checklist items count
inspectionCategorySchema.virtual("checklistItemsCount").get(function () {
  return this.checklistItems.length;
});

// Virtual for critical items count
inspectionCategorySchema.virtual("criticalItemsCount").get(function () {
  return this.checklistItems.filter((item) => item.critical).length;
});

// Virtual for photo required items count
inspectionCategorySchema.virtual("photoRequiredItemsCount").get(function () {
  return this.checklistItems.filter((item) => item.requiresPhoto).length;
});

// Method to get checklist item by ID
inspectionCategorySchema.methods.getChecklistItem = function (itemId) {
  return this.checklistItems.find((item) => item.id === itemId);
};

// Method to validate checklist item
inspectionCategorySchema.methods.validateChecklistItem = function (itemId) {
  return this.checklistItems.some((item) => item.id === itemId);
};

// Pre-save validation
inspectionCategorySchema.pre("save", function (next) {
  // Validate checklist items have unique IDs
  const itemIds = this.checklistItems.map((item) => item.id);
  const uniqueItemIds = [...new Set(itemIds)];

  if (itemIds.length !== uniqueItemIds.length) {
    return next(new Error("Checklist items must have unique IDs"));
  }

  // Validate at least one checklist item
  if (this.checklistItems.length === 0) {
    return next(new Error("At least one checklist item is required"));
  }

  next();
});

module.exports = mongoose.model("InspectionCategory", inspectionCategorySchema);
