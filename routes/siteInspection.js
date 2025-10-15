const express = require("express");
const { body, validationResult } = require("express-validator");
const InspectionCategory = require("../models/InspectionCategory");
const InspectionResult = require("../models/InspectionResult");
const { auth } = require("../middleware/auth");

const router = express.Router();

// ================================
// INSPECTION CATEGORIES ROUTES
// ================================

// @route   POST /api/site-inspection/categories
// @desc    Create a new inspection category
// @access  Private
router.post(
  "/categories",
  [
    auth,
    [
      body("id").notEmpty().withMessage("Category ID is required"),
      body("title").notEmpty().withMessage("Category title is required"),
      body("description")
        .notEmpty()
        .withMessage("Category description is required"),
      body("icon").notEmpty().withMessage("Category icon is required"),
      body("projectId").notEmpty().withMessage("Project ID is required"),
      body("checklistItems")
        .isArray({ min: 1 })
        .withMessage("At least one checklist item is required"),
      body("checklistItems.*.id")
        .notEmpty()
        .withMessage("Checklist item ID is required"),
      body("checklistItems.*.item")
        .notEmpty()
        .withMessage("Checklist item description is required"),
    ],
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id, title, description, icon, projectId, checklistItems } =
        req.body;

      const inspectionCategory = new InspectionCategory({
        id,
        title,
        description,
        icon,
        projectId,
        checklistItems,
        createdBy: req.user.id,
      });

      await inspectionCategory.save();

      res.status(201).json({
        message: "Inspection category created successfully",
        data: inspectionCategory,
      });
    } catch (error) {
      console.error("Error creating inspection category:", error);
      if (error.code === 11000) {
        return res.status(400).json({ message: "Category ID already exists" });
      }
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// @route   GET /api/site-inspection/categories
// @desc    Get all inspection categories
// @access  Private
router.get("/categories", auth, async (req, res) => {
  try {
    const { projectId, search } = req.query;
    const filter = { isActive: true };

    if (projectId) filter.projectId = projectId;

    let categories = await InspectionCategory.find(filter)
      .populate("createdBy", "name email employeeId")
      .sort({ title: 1 });

    // Apply search filter if provided
    if (search) {
      const searchRegex = new RegExp(search, "i");
      categories = categories.filter(
        (cat) =>
          searchRegex.test(cat.title) || searchRegex.test(cat.description)
      );
    }

    res.json({ data: categories });
  } catch (error) {
    console.error("Error fetching inspection categories:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/site-inspection/categories/:id
// @desc    Get a specific inspection category
// @access  Private
router.get("/categories/:id", auth, async (req, res) => {
  try {
    const category = await InspectionCategory.findOne({
      id: req.params.id,
      isActive: true,
    }).populate("createdBy", "name email employeeId");

    if (!category) {
      return res.status(404).json({ message: "Inspection category not found" });
    }

    res.json({ data: category });
  } catch (error) {
    console.error("Error fetching inspection category:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ================================
// INSPECTION RESULTS ROUTES
// ================================

// @route   POST /api/site-inspection/results
// @desc    Create a new inspection result
// @access  Private
router.post(
  "/results",
  [
    auth,
    [
      body("projectId").notEmpty().withMessage("Project ID is required"),
      body("categoryId").notEmpty().withMessage("Category ID is required"),
      body("categoryTitle")
        .notEmpty()
        .withMessage("Category title is required"),
      body("location").notEmpty().withMessage("Location is required"),
      body("inspectorName")
        .notEmpty()
        .withMessage("Inspector name is required"),
      body("itemResults")
        .isArray({ min: 1 })
        .withMessage("At least one item result is required"),
      body("itemResults.*.itemId")
        .notEmpty()
        .withMessage("Item ID is required"),
      body("itemResults.*.status")
        .isIn(["pass", "fail", "na"])
        .withMessage("Invalid item status"),
    ],
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        projectId,
        categoryId,
        categoryTitle,
        location,
        inspectorName,
        inspectorId,
        itemResults,
        photos = [],
        notes = "",
        weatherConditions = "",
        overallStatus = "draft",
      } = req.body;

      const inspectionResult = new InspectionResult({
        projectId,
        categoryId,
        categoryTitle,
        location,
        inspectorName,
        inspectorId: inspectorId || "",
        itemResults,
        photos,
        notes,
        weatherConditions,
        overallStatus,
        createdBy: req.user.id,
      });

      await inspectionResult.save();

      res.status(201).json({
        message:
          overallStatus === "draft"
            ? "Inspection result saved as draft"
            : "Inspection result submitted successfully",
        data: inspectionResult,
      });
    } catch (error) {
      console.error("Error creating inspection result:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// @route   POST /api/site-inspection/results/save-draft
// @desc    Save inspection result as draft
// @access  Private
router.post(
  "/results/save-draft",
  [
    auth,
    [
      body("projectId").notEmpty().withMessage("Project ID is required"),
      body("categoryId").notEmpty().withMessage("Category ID is required"),
      body("categoryTitle")
        .notEmpty()
        .withMessage("Category title is required"),
      body("location").notEmpty().withMessage("Location is required"),
      body("inspectorName")
        .notEmpty()
        .withMessage("Inspector name is required"),
    ],
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        projectId,
        categoryId,
        categoryTitle,
        location,
        inspectorName,
        inspectorId = "",
        itemResults = [],
        photos = [],
        notes = "",
        weatherConditions = "",
      } = req.body;

      const inspectionResult = new InspectionResult({
        projectId,
        categoryId,
        categoryTitle,
        location,
        inspectorName,
        inspectorId,
        itemResults,
        photos,
        notes,
        weatherConditions,
        overallStatus: "draft",
        createdBy: req.user.id,
      });

      await inspectionResult.save();

      res.status(201).json({
        message: "Draft saved successfully",
        data: inspectionResult,
      });
    } catch (error) {
      console.error("Error saving inspection draft:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// @route   GET /api/site-inspection/results
// @desc    Get all inspection results with filtering and pagination
// @access  Private
router.get("/results", auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      projectId,
      categoryId,
      inspectorName,
      overallStatus,
      location,
      sortBy = "inspectionDate",
      sortOrder = "desc",
    } = req.query;

    const filter = {};
    if (projectId) filter.projectId = projectId;
    if (categoryId) filter.categoryId = categoryId;
    if (inspectorName) filter.inspectorName = new RegExp(inspectorName, "i");
    if (overallStatus) filter.overallStatus = overallStatus;
    if (location) filter.location = new RegExp(location, "i");

    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const results = await InspectionResult.find(filter)
      .populate("createdBy", "name email employeeId")
      .populate("updatedBy", "name email employeeId")
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await InspectionResult.countDocuments(filter);

    res.json({
      data: results,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error("Error fetching inspection results:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/site-inspection/results/:id
// @desc    Get a specific inspection result
// @access  Private
router.get("/results/:id", auth, async (req, res) => {
  try {
    const result = await InspectionResult.findById(req.params.id)
      .populate("createdBy", "name email employeeId")
      .populate("updatedBy", "name email employeeId");

    if (!result) {
      return res.status(404).json({ message: "Inspection result not found" });
    }

    res.json({ data: result });
  } catch (error) {
    console.error("Error fetching inspection result:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   PUT /api/site-inspection/results/:id
// @desc    Update an inspection result
// @access  Private
router.put(
  "/results/:id",
  [
    auth,
    [
      body("overallStatus")
        .optional()
        .isIn(["draft", "in_progress", "completed", "needs_action", "closed"]),
      body("itemResults.*.itemId").optional().notEmpty(),
      body("itemResults.*.status").optional().isIn(["pass", "fail", "na"]),
    ],
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { overallStatus, itemResults, photos, notes, weatherConditions } =
        req.body;

      const result = await InspectionResult.findById(req.params.id);
      if (!result) {
        return res.status(404).json({ message: "Inspection result not found" });
      }

      // Update fields
      if (overallStatus) result.overallStatus = overallStatus;
      if (itemResults) result.itemResults = itemResults;
      if (photos) result.photos = photos;
      if (notes !== undefined) result.notes = notes;
      if (weatherConditions !== undefined)
        result.weatherConditions = weatherConditions;

      result.updatedBy = req.user.id;

      await result.save();

      res.json({
        message: "Inspection result updated successfully",
        data: result,
      });
    } catch (error) {
      console.error("Error updating inspection result:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// @route   PUT /api/site-inspection/results/:id/item/:itemId
// @desc    Update a specific item result
// @access  Private
router.put(
  "/results/:id/item/:itemId",
  [
    auth,
    [
      body("status").isIn(["pass", "fail", "na"]).withMessage("Invalid status"),
      body("notes").optional().isString(),
      body("photos").optional().isArray(),
      body("actionRequired").optional().isBoolean(),
    ],
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        status,
        notes = "",
        photos = [],
        actionRequired = false,
      } = req.body;

      const result = await InspectionResult.findById(req.params.id);
      if (!result) {
        return res.status(404).json({ message: "Inspection result not found" });
      }

      // Update the specific item result
      result.updateItemResult(
        req.params.itemId,
        status,
        notes,
        photos,
        actionRequired
      );
      result.updatedBy = req.user.id;

      await result.save();

      res.json({
        message: "Item result updated successfully",
        data: result,
      });
    } catch (error) {
      console.error("Error updating item result:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// @route   POST /api/site-inspection/results/:id/action-items
// @desc    Add action item to inspection result
// @access  Private
router.post(
  "/results/:id/action-items",
  [
    auth,
    [
      body("itemId").notEmpty().withMessage("Item ID is required"),
      body("description").notEmpty().withMessage("Description is required"),
      body("priority")
        .optional()
        .isIn(["low", "medium", "high", "critical"])
        .withMessage("Invalid priority"),
    ],
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        itemId,
        description,
        priority = "medium",
        assignedTo,
        dueDate,
      } = req.body;

      const result = await InspectionResult.findById(req.params.id);
      if (!result) {
        return res.status(404).json({ message: "Inspection result not found" });
      }

      result.addActionItem(itemId, description, priority);

      // Set additional fields if provided
      const actionItem = result.actionItems.find(
        (item) => item.itemId === itemId
      );
      if (actionItem) {
        if (assignedTo) actionItem.assignedTo = assignedTo;
        if (dueDate) actionItem.dueDate = new Date(dueDate);
      }

      result.updatedBy = req.user.id;
      await result.save();

      res.json({
        message: "Action item added successfully",
        data: result,
      });
    } catch (error) {
      console.error("Error adding action item:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// @route   DELETE /api/site-inspection/results/:id
// @desc    Delete an inspection result
// @access  Private (Admin only)
router.delete("/results/:id", auth, async (req, res) => {
  try {
    const result = await InspectionResult.findById(req.params.id);
    if (!result) {
      return res.status(404).json({ message: "Inspection result not found" });
    }

    // Check if user is admin or created the result
    if (
      req.user.role !== "admin" &&
      result.createdBy.toString() !== req.user.id
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this inspection result" });
    }

    await InspectionResult.findByIdAndDelete(req.params.id);

    res.json({ message: "Inspection result deleted successfully" });
  } catch (error) {
    console.error("Error deleting inspection result:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ================================
// STATISTICS AND ANALYTICS ROUTES
// ================================

// @route   GET /api/site-inspection/stats/overview
// @desc    Get inspection statistics overview
// @access  Private
router.get("/stats/overview", auth, async (req, res) => {
  try {
    const { projectId, categoryId } = req.query;
    const filter = {};
    if (projectId) filter.projectId = projectId;
    if (categoryId) filter.categoryId = categoryId;

    const stats = await InspectionResult.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          draft: {
            $sum: { $cond: [{ $eq: ["$overallStatus", "draft"] }, 1, 0] },
          },
          inProgress: {
            $sum: { $cond: [{ $eq: ["$overallStatus", "in_progress"] }, 1, 0] },
          },
          completed: {
            $sum: { $cond: [{ $eq: ["$overallStatus", "completed"] }, 1, 0] },
          },
          needsAction: {
            $sum: {
              $cond: [{ $eq: ["$overallStatus", "needs_action"] }, 1, 0],
            },
          },
          closed: {
            $sum: { $cond: [{ $eq: ["$overallStatus", "closed"] }, 1, 0] },
          },
          totalPass: { $sum: "$passCount" },
          totalFail: { $sum: "$failCount" },
          totalNA: { $sum: "$naCount" },
          totalItems: { $sum: "$totalItems" },
          avgPassPercentage: { $avg: "$passPercentage" },
          criticalFailures: { $sum: "$criticalFailures" },
        },
      },
    ]);

    res.json({ data: stats[0] || {} });
  } catch (error) {
    console.error("Error fetching inspection statistics:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/site-inspection/stats/categories
// @desc    Get statistics by inspection category
// @access  Private
router.get("/stats/categories", auth, async (req, res) => {
  try {
    const { projectId } = req.query;
    const filter = projectId ? { projectId } : {};

    const categoryStats = await InspectionResult.aggregate([
      { $match: filter },
      {
        $group: {
          _id: { categoryId: "$categoryId", categoryTitle: "$categoryTitle" },
          count: { $sum: 1 },
          totalPass: { $sum: "$passCount" },
          totalFail: { $sum: "$failCount" },
          totalNA: { $sum: "$naCount" },
          totalItems: { $sum: "$totalItems" },
          avgPassPercentage: { $avg: "$passPercentage" },
          criticalFailures: { $sum: "$criticalFailures" },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json({ data: categoryStats });
  } catch (error) {
    console.error("Error fetching category statistics:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/site-inspection/stats/inspectors
// @desc    Get statistics by inspector
// @access  Private
router.get("/stats/inspectors", auth, async (req, res) => {
  try {
    const { projectId } = req.query;
    const filter = projectId ? { projectId } : {};

    const inspectorStats = await InspectionResult.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$inspectorName",
          count: { $sum: 1 },
          totalPass: { $sum: "$passCount" },
          totalFail: { $sum: "$failCount" },
          totalNA: { $sum: "$naCount" },
          totalItems: { $sum: "$totalItems" },
          avgPassPercentage: { $avg: "$passPercentage" },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json({ data: inspectorStats });
  } catch (error) {
    console.error("Error fetching inspector statistics:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
