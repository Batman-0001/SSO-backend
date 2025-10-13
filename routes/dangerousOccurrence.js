const express = require("express");
const { body, validationResult } = require("express-validator");
const DangerousOccurrence = require("../models/DangerousOccurrence");
const auth = require("../middleware/auth");

const router = express.Router();

// @route   POST /api/dangerous-occurrence
// @desc    Create a new dangerous occurrence report
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
      body("investigationRequired")
        .optional()
        .isBoolean()
        .withMessage("Investigation required must be a boolean"),
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
        investigationRequired = false,
        severity = "high",
        photos = [],
      } = req.body;

      const dangerousOccurrence = new DangerousOccurrence({
        projectId,
        dateTime: new Date(dateTime),
        location,
        situation,
        potentialConsequence,
        preventiveActions,
        reportedBy,
        investigationRequired,
        severity,
        photos,
        createdBy: req.user.id,
      });

      await dangerousOccurrence.save();

      // Auto-notify head office if investigation required
      if (investigationRequired) {
        dangerousOccurrence.notifyHeadOffice();
        await dangerousOccurrence.save();
      }

      res.status(201).json({
        message: investigationRequired
          ? "Dangerous occurrence created successfully. Head Office has been notified."
          : "Dangerous occurrence created successfully",
        data: dangerousOccurrence,
      });
    } catch (error) {
      console.error("Error creating dangerous occurrence:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// @route   GET /api/dangerous-occurrence
// @desc    Get all dangerous occurrence reports with filtering and pagination
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      projectId,
      severity,
      status = "reported",
      investigationRequired,
      headOfficeNotified,
      sortBy = "dateTime",
      sortOrder = "desc",
    } = req.query;

    const filter = {};
    if (projectId) filter.projectId = projectId;
    if (severity) filter.severity = severity;
    if (status) filter.status = status;
    if (investigationRequired !== undefined)
      filter.investigationRequired = investigationRequired === "true";
    if (headOfficeNotified !== undefined)
      filter.headOfficeNotified = headOfficeNotified === "true";

    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const dangerousOccurrences = await DangerousOccurrence.find(filter)
      .populate("createdBy", "name email employeeId")
      .populate("updatedBy", "name email employeeId")
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await DangerousOccurrence.countDocuments(filter);

    res.json({
      data: dangerousOccurrences,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error("Error fetching dangerous occurrences:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/dangerous-occurrence/:id
// @desc    Get a specific dangerous occurrence report
// @access  Private
router.get("/:id", auth, async (req, res) => {
  try {
    const dangerousOccurrence = await DangerousOccurrence.findById(
      req.params.id
    )
      .populate("createdBy", "name email employeeId")
      .populate("updatedBy", "name email employeeId");

    if (!dangerousOccurrence) {
      return res
        .status(404)
        .json({ message: "Dangerous occurrence not found" });
    }

    res.json({ data: dangerousOccurrence });
  } catch (error) {
    console.error("Error fetching dangerous occurrence:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   PUT /api/dangerous-occurrence/:id
// @desc    Update a dangerous occurrence report
// @access  Private
router.put(
  "/:id",
  [
    auth,
    [
      body("status")
        .optional()
        .isIn([
          "reported",
          "under_investigation",
          "investigation_complete",
          "closed",
        ]),
      body("severity").optional().isIn(["low", "medium", "high", "critical"]),
      body("investigationEndDate")
        .optional()
        .isISO8601()
        .withMessage("Valid investigation end date is required"),
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
        investigationNotes,
        investigator,
        investigationStartDate,
        investigationEndDate,
        investigationFindings,
        rootCause,
        correctiveActions,
        actionOwner,
        actionDeadline,
        actionCompleted,
        headOfficeResponse,
        regulatoryReportRequired,
        regulatoryReportSubmitted,
        lessonsLearned,
        sharedWithTeam,
      } = req.body;

      const dangerousOccurrence = await DangerousOccurrence.findById(
        req.params.id
      );
      if (!dangerousOccurrence) {
        return res
          .status(404)
          .json({ message: "Dangerous occurrence not found" });
      }

      // Update fields
      if (severity) dangerousOccurrence.severity = severity;
      if (location) dangerousOccurrence.location = location;
      if (situation) dangerousOccurrence.situation = situation;
      if (potentialConsequence)
        dangerousOccurrence.potentialConsequence = potentialConsequence;
      if (preventiveActions)
        dangerousOccurrence.preventiveActions = preventiveActions;

      // Handle status changes
      if (status) {
        if (status === "under_investigation") {
          if (!investigator) {
            return res.status(400).json({
              message: "Investigator is required when starting investigation",
            });
          }
          dangerousOccurrence.startInvestigation(
            investigator,
            investigationNotes || ""
          );
        } else if (status === "investigation_complete") {
          if (!investigationFindings || !rootCause || !correctiveActions) {
            return res.status(400).json({
              message:
                "Investigation findings, root cause, and corrective actions are required when completing investigation",
            });
          }
          dangerousOccurrence.completeInvestigation(
            investigationFindings,
            rootCause,
            correctiveActions
          );
        } else {
          dangerousOccurrence.status = status;
        }
      }

      // Handle investigation dates
      if (investigationStartDate)
        dangerousOccurrence.investigationStartDate = new Date(
          investigationStartDate
        );
      if (investigationEndDate)
        dangerousOccurrence.investigationEndDate = new Date(
          investigationEndDate
        );

      // Handle corrective action assignment
      if (actionOwner && actionDeadline) {
        dangerousOccurrence.assignCorrectiveAction(actionOwner, actionDeadline);
      }

      // Handle action completion
      if (actionCompleted !== undefined) {
        dangerousOccurrence.actionCompleted = actionCompleted;
        if (actionCompleted) {
          dangerousOccurrence.completeCorrectiveAction(lessonsLearned || "");
        }
      }

      // Handle head office response
      if (headOfficeResponse)
        dangerousOccurrence.headOfficeResponse = headOfficeResponse;

      // Handle regulatory reporting
      if (regulatoryReportRequired !== undefined) {
        dangerousOccurrence.regulatoryReportRequired = regulatoryReportRequired;
      }
      if (
        regulatoryReportSubmitted !== undefined &&
        regulatoryReportSubmitted
      ) {
        dangerousOccurrence.submitRegulatoryReport();
      }

      // Handle team sharing
      if (sharedWithTeam !== undefined && sharedWithTeam) {
        dangerousOccurrence.shareWithTeam();
      }

      // Update other fields
      if (investigationNotes)
        dangerousOccurrence.investigationNotes = investigationNotes;
      if (investigationFindings)
        dangerousOccurrence.investigationFindings = investigationFindings;
      if (rootCause) dangerousOccurrence.rootCause = rootCause;
      if (correctiveActions)
        dangerousOccurrence.correctiveActions = correctiveActions;
      if (lessonsLearned) dangerousOccurrence.lessonsLearned = lessonsLearned;

      dangerousOccurrence.updatedBy = req.user.id;

      await dangerousOccurrence.save();

      res.json({
        message: "Dangerous occurrence updated successfully",
        data: dangerousOccurrence,
      });
    } catch (error) {
      console.error("Error updating dangerous occurrence:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// @route   DELETE /api/dangerous-occurrence/:id
// @desc    Delete a dangerous occurrence report
// @access  Private (Admin only)
router.delete("/:id", auth, async (req, res) => {
  try {
    const dangerousOccurrence = await DangerousOccurrence.findById(
      req.params.id
    );
    if (!dangerousOccurrence) {
      return res
        .status(404)
        .json({ message: "Dangerous occurrence not found" });
    }

    // Check if user is admin or created the report
    if (
      req.user.role !== "admin" &&
      dangerousOccurrence.createdBy.toString() !== req.user.id
    ) {
      return res.status(403).json({
        message: "Not authorized to delete this dangerous occurrence report",
      });
    }

    await DangerousOccurrence.findByIdAndDelete(req.params.id);

    res.json({ message: "Dangerous occurrence deleted successfully" });
  } catch (error) {
    console.error("Error deleting dangerous occurrence:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/dangerous-occurrence/stats/overview
// @desc    Get dangerous occurrence statistics
// @access  Private
router.get("/stats/overview", auth, async (req, res) => {
  try {
    const { projectId } = req.query;
    const filter = projectId ? { projectId } : {};

    const stats = await DangerousOccurrence.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          reported: {
            $sum: { $cond: [{ $eq: ["$status", "reported"] }, 1, 0] },
          },
          underInvestigation: {
            $sum: {
              $cond: [{ $eq: ["$status", "under_investigation"] }, 1, 0],
            },
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
          critical: {
            $sum: { $cond: [{ $eq: ["$severity", "critical"] }, 1, 0] },
          },
          investigationRequired: {
            $sum: { $cond: [{ $eq: ["$investigationRequired", true] }, 1, 0] },
          },
          headOfficeNotified: {
            $sum: { $cond: [{ $eq: ["$headOfficeNotified", true] }, 1, 0] },
          },
          regulatoryReportRequired: {
            $sum: {
              $cond: [{ $eq: ["$regulatoryReportRequired", true] }, 1, 0],
            },
          },
          regulatoryReportSubmitted: {
            $sum: {
              $cond: [{ $eq: ["$regulatoryReportSubmitted", true] }, 1, 0],
            },
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
        },
      },
    ]);

    res.json({ data: stats[0] || {} });
  } catch (error) {
    console.error("Error fetching dangerous occurrence statistics:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/dangerous-occurrence/investigations/active
// @desc    Get active investigations
// @access  Private
router.get("/investigations/active", auth, async (req, res) => {
  try {
    const { projectId } = req.query;
    const filter = {
      status: "under_investigation",
      projectId: projectId || { $exists: true },
    };

    const activeInvestigations = await DangerousOccurrence.find(filter)
      .populate("createdBy", "name email employeeId")
      .sort({ investigationStartDate: 1 });

    res.json({ data: activeInvestigations });
  } catch (error) {
    console.error("Error fetching active investigations:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/dangerous-occurrence/actions/overdue
// @desc    Get dangerous occurrences with overdue actions
// @access  Private
router.get("/actions/overdue", auth, async (req, res) => {
  try {
    const { projectId } = req.query;
    const filter = {
      actionCompleted: false,
      actionDeadline: { $lt: new Date() },
      projectId: projectId || { $exists: true },
    };

    const overdueActions = await DangerousOccurrence.find(filter)
      .populate("createdBy", "name email employeeId")
      .sort({ actionDeadline: 1 });

    res.json({ data: overdueActions });
  } catch (error) {
    console.error("Error fetching overdue actions:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/dangerous-occurrence/regulatory/pending
// @desc    Get dangerous occurrences requiring regulatory reports
// @access  Private
router.get("/regulatory/pending", auth, async (req, res) => {
  try {
    const { projectId } = req.query;
    const filter = {
      regulatoryReportRequired: true,
      regulatoryReportSubmitted: false,
      projectId: projectId || { $exists: true },
    };

    const pendingReports = await DangerousOccurrence.find(filter)
      .populate("createdBy", "name email employeeId")
      .sort({ dateTime: -1 });

    res.json({ data: pendingReports });
  } catch (error) {
    console.error("Error fetching pending regulatory reports:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
