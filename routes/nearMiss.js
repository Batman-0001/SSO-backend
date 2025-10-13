const express = require("express");
const { body, validationResult } = require("express-validator");
const NearMiss = require("../models/NearMiss");
const { auth } = require("../middleware/auth");

const router = express.Router();

// @route   POST /api/near-miss
// @desc    Create a new near miss report
// @access  Private
router.post(
  "/",
  [
    auth,
    [
      body("projectId").notEmpty().withMessage("Project ID is required"),
      body("dateTime")
        .isISO8601()
        .withMessage("Valid date and time is required"),
      body("location").notEmpty().withMessage("Location is required"),
      body("situation")
        .notEmpty()
        .withMessage("Situation description is required"),
      body("potentialConsequence")
        .notEmpty()
        .withMessage("Potential consequence is required"),
      body("preventiveActions")
        .notEmpty()
        .withMessage("Preventive actions are required"),
      body("reportedBy").notEmpty().withMessage("Reported by is required"),
      body("severity")
        .optional()
        .isIn(["low", "medium", "high", "critical"])
        .withMessage("Invalid severity level"),
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
        dateTime,
        location,
        situation,
        potentialConsequence,
        preventiveActions,
        reportedBy,
        severity = "medium",
        photos = [],
      } = req.body;

      const nearMiss = new NearMiss({
        projectId,
        dateTime: new Date(dateTime),
        location,
        situation,
        potentialConsequence,
        preventiveActions,
        reportedBy,
        severity,
        photos,
        createdBy: req.user.id,
      });

      await nearMiss.save();

      res.status(201).json({
        message: "Near miss report created successfully",
        data: nearMiss,
      });
    } catch (error) {
      console.error("Error creating near miss report:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// @route   GET /api/near-miss
// @desc    Get all near miss reports with filtering and pagination
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      projectId,
      severity,
      status = "reported",
      location,
      sortBy = "dateTime",
      sortOrder = "desc",
    } = req.query;

    const filter = {};
    if (projectId) filter.projectId = projectId;
    if (severity) filter.severity = severity;
    if (status) filter.status = status;
    if (location) filter.location = new RegExp(location, "i");

    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const nearMisses = await NearMiss.find(filter)
      .populate("createdBy", "name email employeeId")
      .populate("updatedBy", "name email employeeId")
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await NearMiss.countDocuments(filter);

    res.json({
      data: nearMisses,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error("Error fetching near miss reports:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/near-miss/:id
// @desc    Get a specific near miss report
// @access  Private
router.get("/:id", auth, async (req, res) => {
  try {
    const nearMiss = await NearMiss.findById(req.params.id)
      .populate("createdBy", "name email employeeId")
      .populate("updatedBy", "name email employeeId");

    if (!nearMiss) {
      return res.status(404).json({ message: "Near miss report not found" });
    }

    res.json({ data: nearMiss });
  } catch (error) {
    console.error("Error fetching near miss report:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   PUT /api/near-miss/:id
// @desc    Update a near miss report
// @access  Private
router.put(
  "/:id",
  [
    auth,
    [
      body("status")
        .optional()
        .isIn(["reported", "under_review", "action_taken", "closed"]),
      body("severity").optional().isIn(["low", "medium", "high", "critical"]),
      body("actionDeadline")
        .optional()
        .isISO8601()
        .withMessage("Valid action deadline is required"),
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
        location,
        situation,
        potentialConsequence,
        preventiveActions,
        reviewNotes,
        actionsTaken,
        actionOwner,
        actionDeadline,
        actionCompleted,
        lessonsLearned,
        sharedWithTeam,
      } = req.body;

      const nearMiss = await NearMiss.findById(req.params.id);
      if (!nearMiss) {
        return res.status(404).json({ message: "Near miss report not found" });
      }

      // Update fields
      if (severity) nearMiss.severity = severity;
      if (location) nearMiss.location = location;
      if (situation) nearMiss.situation = situation;
      if (potentialConsequence)
        nearMiss.potentialConsequence = potentialConsequence;
      if (preventiveActions) nearMiss.preventiveActions = preventiveActions;

      // Handle status changes
      if (status) {
        if (status === "under_review") {
          nearMiss.markUnderReview(reviewNotes || "");
        } else if (status === "action_taken") {
          if (!actionsTaken || !actionOwner || !actionDeadline) {
            return res.status(400).json({
              message:
                "Actions taken, action owner, and action deadline are required when assigning action",
            });
          }
          nearMiss.assignAction(actionsTaken, actionOwner, actionDeadline);
        } else if (status === "closed") {
          if (actionCompleted) {
            nearMiss.completeAction(lessonsLearned || "");
          } else {
            nearMiss.status = status;
          }
        } else {
          nearMiss.status = status;
        }
      }

      // Handle action completion
      if (actionCompleted !== undefined) {
        nearMiss.actionCompleted = actionCompleted;
        if (actionCompleted) {
          nearMiss.completeAction(lessonsLearned || "");
        }
      }

      // Handle team sharing
      if (sharedWithTeam !== undefined && sharedWithTeam) {
        nearMiss.shareWithTeam();
      }

      // Update action details
      if (actionsTaken) nearMiss.actionsTaken = actionsTaken;
      if (actionOwner) nearMiss.actionOwner = actionOwner;
      if (actionDeadline) nearMiss.actionDeadline = new Date(actionDeadline);
      if (lessonsLearned) nearMiss.lessonsLearned = lessonsLearned;

      nearMiss.updatedBy = req.user.id;

      await nearMiss.save();

      res.json({
        message: "Near miss report updated successfully",
        data: nearMiss,
      });
    } catch (error) {
      console.error("Error updating near miss report:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// @route   DELETE /api/near-miss/:id
// @desc    Delete a near miss report
// @access  Private (Admin only)
router.delete("/:id", auth, async (req, res) => {
  try {
    const nearMiss = await NearMiss.findById(req.params.id);
    if (!nearMiss) {
      return res.status(404).json({ message: "Near miss report not found" });
    }

    // Check if user is admin or created the report
    if (
      req.user.role !== "admin" &&
      nearMiss.createdBy.toString() !== req.user.id
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this near miss report" });
    }

    await NearMiss.findByIdAndDelete(req.params.id);

    res.json({ message: "Near miss report deleted successfully" });
  } catch (error) {
    console.error("Error deleting near miss report:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/near-miss/stats/overview
// @desc    Get near miss statistics
// @access  Private
router.get("/stats/overview", auth, async (req, res) => {
  try {
    const { projectId } = req.query;
    const filter = projectId ? { projectId } : {};

    const stats = await NearMiss.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          reported: {
            $sum: { $cond: [{ $eq: ["$status", "reported"] }, 1, 0] },
          },
          underReview: {
            $sum: { $cond: [{ $eq: ["$status", "under_review"] }, 1, 0] },
          },
          actionTaken: {
            $sum: { $cond: [{ $eq: ["$status", "action_taken"] }, 1, 0] },
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
          critical: {
            $sum: { $cond: [{ $eq: ["$severity", "critical"] }, 1, 0] },
          },
          actionsCompleted: {
            $sum: { $cond: [{ $eq: ["$actionCompleted", true] }, 1, 0] },
          },
          actionsOverdue: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$actionCompleted", false] },
                    { $ne: ["$actionDeadline", null] },
                    { $lt: ["$actionDeadline", new Date()] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          sharedWithTeam: {
            $sum: { $cond: [{ $eq: ["$sharedWithTeam", true] }, 1, 0] },
          },
        },
      },
    ]);

    res.json({ data: stats[0] || {} });
  } catch (error) {
    console.error("Error fetching near miss statistics:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/near-miss/actions/overdue
// @desc    Get near misses with overdue actions
// @access  Private
router.get("/actions/overdue", auth, async (req, res) => {
  try {
    const { projectId } = req.query;
    const filter = {
      actionCompleted: false,
      actionDeadline: { $lt: new Date() },
      projectId: projectId || { $exists: true },
    };

    const overdueActions = await NearMiss.find(filter)
      .populate("createdBy", "name email employeeId")
      .sort({ actionDeadline: 1 });

    res.json({ data: overdueActions });
  } catch (error) {
    console.error("Error fetching overdue actions:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/near-miss/lessons/popular
// @desc    Get popular lessons learned
// @access  Private
router.get("/lessons/popular", auth, async (req, res) => {
  try {
    const { projectId, limit = 10 } = req.query;
    const filter = {
      lessonsLearned: { $ne: "" },
      projectId: projectId || { $exists: true },
    };

    const lessons = await NearMiss.find(filter)
      .select("lessonsLearned location severity dateTime")
      .sort({ dateTime: -1 })
      .limit(parseInt(limit));

    res.json({ data: lessons });
  } catch (error) {
    console.error("Error fetching popular lessons:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/near-miss/locations/frequent
// @desc    Get most frequent near miss locations
// @access  Private
router.get("/locations/frequent", auth, async (req, res) => {
  try {
    const { projectId, limit = 10 } = req.query;
    const filter = projectId ? { projectId } : {};

    const locationStats = await NearMiss.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$location",
          count: { $sum: 1 },
          avgSeverity: {
            $avg: {
              $switch: {
                branches: [
                  { case: { $eq: ["$severity", "low"] }, then: 1 },
                  { case: { $eq: ["$severity", "medium"] }, then: 2 },
                  { case: { $eq: ["$severity", "high"] }, then: 3 },
                  { case: { $eq: ["$severity", "critical"] }, then: 4 },
                ],
                default: 2,
              },
            },
          },
          criticalCount: {
            $sum: { $cond: [{ $eq: ["$severity", "critical"] }, 1, 0] },
          },
        },
      },
      { $sort: { count: -1 } },
      { $limit: parseInt(limit) },
    ]);

    res.json({ data: locationStats });
  } catch (error) {
    console.error("Error fetching frequent locations:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
