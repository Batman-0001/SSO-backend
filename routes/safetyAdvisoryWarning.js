const express = require("express");
const { body, validationResult } = require("express-validator");
const SafetyAdvisoryWarning = require("../models/SafetyAdvisoryWarning");
const { auth } = require("../middleware/auth");

const router = express.Router();

// @route   POST /api/safety-advisory-warning
// @desc    Create a new safety advisory warning
// @access  Private
router.post(
  "/",
  [
    auth,
    [
      body("projectId").notEmpty().withMessage("Project ID is required"),
      body("date").isISO8601().withMessage("Valid date is required"),
      body("warningTitle").notEmpty().withMessage("Warning title is required"),
      body("severity")
        .isIn(["low", "medium", "high", "critical"])
        .withMessage("Invalid severity level"),
      body("affectedArea").notEmpty().withMessage("Affected area is required"),
      body("description").notEmpty().withMessage("Description is required"),
      body("validityFrom")
        .isISO8601()
        .withMessage("Valid validity from date is required"),
      body("validityTo")
        .optional()
        .isISO8601()
        .withMessage("Valid validity to date is required"),
      body("actionsRequired")
        .notEmpty()
        .withMessage("Actions required is required"),
      body("owner").notEmpty().withMessage("Action owner is required"),
      body("photos")
        .optional()
        .isArray()
        .withMessage("Photos must be an array"),
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
        date,
        warningTitle,
        severity,
        affectedArea,
        description,
        validityFrom,
        validityTo,
        actionsRequired,
        owner,
        photos = [],
      } = req.body;

      // Validate validity dates
      if (validityTo && new Date(validityTo) <= new Date(validityFrom)) {
        return res.status(400).json({
          message: "Validity end date must be after validity start date",
        });
      }

      const safetyAdvisoryWarning = new SafetyAdvisoryWarning({
        projectId,
        date: new Date(date),
        warningTitle,
        severity,
        affectedArea,
        description,
        validityFrom: new Date(validityFrom),
        validityTo: validityTo ? new Date(validityTo) : undefined,
        actionsRequired,
        owner,
        photos,
        createdBy: req.user.id,
      });

      await safetyAdvisoryWarning.save();

      res.status(201).json({
        message: "Safety advisory warning created successfully",
        data: safetyAdvisoryWarning,
      });
    } catch (error) {
      console.error("Error creating safety advisory warning:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// @route   GET /api/safety-advisory-warning
// @desc    Get all safety advisory warnings with filtering and pagination
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      projectId,
      severity,
      status = "active",
      affectedArea,
      sortBy = "date",
      sortOrder = "desc",
    } = req.query;

    const filter = {};
    if (projectId) filter.projectId = projectId;
    if (severity) filter.severity = severity;
    if (status) filter.status = status;
    if (affectedArea) filter.affectedArea = new RegExp(affectedArea, "i");

    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const warnings = await SafetyAdvisoryWarning.find(filter)
      .populate("createdBy", "name email employeeId")
      .populate("updatedBy", "name email employeeId")
      .populate("acknowledgedBy.user", "name email employeeId")
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await SafetyAdvisoryWarning.countDocuments(filter);

    res.json({
      data: warnings,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error("Error fetching safety advisory warnings:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/safety-advisory-warning/:id
// @desc    Get a specific safety advisory warning
// @access  Private
router.get("/:id", auth, async (req, res) => {
  try {
    const warning = await SafetyAdvisoryWarning.findById(req.params.id)
      .populate("createdBy", "name email employeeId")
      .populate("updatedBy", "name email employeeId")
      .populate("acknowledgedBy.user", "name email employeeId");

    if (!warning) {
      return res
        .status(404)
        .json({ message: "Safety advisory warning not found" });
    }

    res.json({ data: warning });
  } catch (error) {
    console.error("Error fetching safety advisory warning:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   PUT /api/safety-advisory-warning/:id
// @desc    Update a safety advisory warning
// @access  Private
router.put(
  "/:id",
  [
    auth,
    [
      body("status")
        .optional()
        .isIn(["active", "expired", "cancelled", "resolved"]),
      body("severity").optional().isIn(["low", "medium", "high", "critical"]),
      body("validityTo")
        .optional()
        .isISO8601()
        .withMessage("Valid validity to date is required"),
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
        severity,
        affectedArea,
        description,
        actionsRequired,
        owner,
        validityTo,
      } = req.body;

      const warning = await SafetyAdvisoryWarning.findById(req.params.id);
      if (!warning) {
        return res
          .status(404)
          .json({ message: "Safety advisory warning not found" });
      }

      // Update fields
      if (status) warning.status = status;
      if (severity) warning.severity = severity;
      if (affectedArea) warning.affectedArea = affectedArea;
      if (description) warning.description = description;
      if (actionsRequired) warning.actionsRequired = actionsRequired;
      if (owner) warning.owner = owner;
      if (validityTo) warning.validityTo = new Date(validityTo);

      // Validate validity dates
      if (warning.validityTo && warning.validityTo <= warning.validityFrom) {
        return res.status(400).json({
          message: "Validity end date must be after validity start date",
        });
      }

      warning.updatedBy = req.user.id;

      await warning.save();

      res.json({
        message: "Safety advisory warning updated successfully",
        data: warning,
      });
    } catch (error) {
      console.error("Error updating safety advisory warning:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// @route   POST /api/safety-advisory-warning/:id/acknowledge
// @desc    Acknowledge a safety advisory warning
// @access  Private
router.post(
  "/:id/acknowledge",
  [
    auth,
    [body("notes").optional().isString().withMessage("Notes must be a string")],
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { notes = "" } = req.body;

      const warning = await SafetyAdvisoryWarning.findById(req.params.id);
      if (!warning) {
        return res
          .status(404)
          .json({ message: "Safety advisory warning not found" });
      }

      // Acknowledge the warning
      warning.acknowledge(req.user.id, notes);

      await warning.save();

      res.json({
        message: "Safety advisory warning acknowledged successfully",
        data: warning,
      });
    } catch (error) {
      console.error("Error acknowledging safety advisory warning:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// @route   DELETE /api/safety-advisory-warning/:id
// @desc    Delete a safety advisory warning
// @access  Private (Admin only)
router.delete("/:id", auth, async (req, res) => {
  try {
    const warning = await SafetyAdvisoryWarning.findById(req.params.id);
    if (!warning) {
      return res
        .status(404)
        .json({ message: "Safety advisory warning not found" });
    }

    // Check if user is admin or created the warning
    if (
      req.user.role !== "admin" &&
      warning.createdBy.toString() !== req.user.id
    ) {
      return res.status(403).json({
        message: "Not authorized to delete this safety advisory warning",
      });
    }

    await SafetyAdvisoryWarning.findByIdAndDelete(req.params.id);

    res.json({ message: "Safety advisory warning deleted successfully" });
  } catch (error) {
    console.error("Error deleting safety advisory warning:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/safety-advisory-warning/stats/overview
// @desc    Get safety advisory warning statistics
// @access  Private
router.get("/stats/overview", auth, async (req, res) => {
  try {
    const { projectId } = req.query;
    const filter = projectId ? { projectId } : {};

    const stats = await SafetyAdvisoryWarning.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: {
            $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] },
          },
          expired: {
            $sum: { $cond: [{ $eq: ["$status", "expired"] }, 1, 0] },
          },
          cancelled: {
            $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
          },
          resolved: {
            $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] },
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
          critical: {
            $sum: { $cond: [{ $eq: ["$severity", "critical"] }, 1, 0] },
          },
        },
      },
    ]);

    res.json({ data: stats[0] || {} });
  } catch (error) {
    console.error("Error fetching safety advisory warning statistics:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/safety-advisory-warning/active/current
// @desc    Get currently active warnings
// @access  Private
router.get("/active/current", auth, async (req, res) => {
  try {
    const { projectId } = req.query;
    const filter = {
      status: "active",
      projectId: projectId || { $exists: true },
    };

    const now = new Date();
    filter.validityFrom = { $lte: now };
    filter.$or = [
      { validityTo: { $gte: now } },
      { validityTo: { $exists: false } },
    ];

    const activeWarnings = await SafetyAdvisoryWarning.find(filter)
      .populate("createdBy", "name email employeeId")
      .populate("acknowledgedBy.user", "name email employeeId")
      .sort({ severity: -1, date: -1 });

    res.json({ data: activeWarnings });
  } catch (error) {
    console.error("Error fetching active warnings:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
