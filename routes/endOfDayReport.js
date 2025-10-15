const express = require("express");
const { body, validationResult } = require("express-validator");
const EndOfDayReport = require("../models/EndOfDayReport");
const { auth } = require("../middleware/auth");

const router = express.Router();

// @route   POST /api/end-of-day-report
// @desc    Create a new end of day report
// @access  Private
router.post(
  "/",
  [
    auth,
    [
      body("projectId").notEmpty().withMessage("Project ID is required"),
      body("reportDate")
        .isISO8601()
        .withMessage("Valid report date is required"),
      body("workStatistics.totalWorkers")
        .isInt({ min: 0 })
        .withMessage("Total workers must be a non-negative number"),
      body("workStatistics.meilEmployees")
        .isInt({ min: 0 })
        .withMessage("MEIL employees must be a non-negative number"),
      body("workStatistics.subcontractor")
        .isInt({ min: 0 })
        .withMessage("Subcontractor count must be a non-negative number"),
      body("workStatistics.visitors")
        .isInt({ min: 0 })
        .withMessage("Visitors count must be a non-negative number"),
      body("workStatistics.manHours")
        .isInt({ min: 0 })
        .withMessage("Man hours must be a non-negative number"),
      body("safetyPerformance.ppeCompliance")
        .isInt({ min: 0, max: 100 })
        .withMessage("PPE compliance must be between 0 and 100"),
      body("safetyPerformance.housekeeping")
        .isInt({ min: 0, max: 100 })
        .withMessage("Housekeeping score must be between 0 and 100"),
      body("safetyPerformance.equipmentSafety")
        .isInt({ min: 0, max: 100 })
        .withMessage("Equipment safety score must be between 0 and 100"),
      body("ssoReview.siteStatus")
        .optional()
        .isIn(["excellent", "good", "satisfactory", "needs_improvement"])
        .withMessage("Invalid site status"),
      body("ssoReview.highlights")
        .optional()
        .notEmpty()
        .withMessage("Highlights cannot be empty"),
      body("ssoReview.photos")
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
        reportDate,
        workStatistics,
        safetyPerformance,
        activitiesSummary = {},
        ssoReview,
        status = "submitted",
      } = req.body;

      // Generate unique report ID if not provided
      const reportId =
        req.body.reportId ||
        `DR-${new Date().getFullYear()}-${String(
          new Date().getMonth() + 1
        ).padStart(2, "0")}${String(new Date().getDate()).padStart(
          2,
          "0"
        )}-${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`;

      const endOfDayReport = new EndOfDayReport({
        projectId,
        reportId,
        reportDate: new Date(reportDate),
        workStatistics,
        safetyPerformance,
        activitiesSummary,
        ssoReview,
        status,
        createdBy: req.user.id,
      });

      await endOfDayReport.save();

      let responseMessage =
        status === "draft"
          ? "End of day report saved as draft"
          : "End of day report submitted successfully";

      res.status(201).json({
        message: responseMessage,
        data: endOfDayReport,
        status,
      });
    } catch (error) {
      console.error("Error creating end of day report:", error);
      if (error.code === 11000) {
        return res.status(400).json({
          message: "Report ID already exists. Please try again.",
        });
      }
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// @route   POST /api/end-of-day-report/save-draft
// @desc    Save end of day report as draft
// @access  Private
router.post(
  "/save-draft",
  [
    auth,
    [
      body("projectId").notEmpty().withMessage("Project ID is required"),
      body("reportDate")
        .isISO8601()
        .withMessage("Valid report date is required"),
      body("workStatistics.totalWorkers")
        .optional()
        .isInt({ min: 0 })
        .withMessage("Total workers must be a non-negative number"),
      body("workStatistics.meilEmployees")
        .optional()
        .isInt({ min: 0 })
        .withMessage("MEIL employees must be a non-negative number"),
      body("workStatistics.subcontractor")
        .optional()
        .isInt({ min: 0 })
        .withMessage("Subcontractor count must be a non-negative number"),
      body("workStatistics.visitors")
        .optional()
        .isInt({ min: 0 })
        .withMessage("Visitors count must be a non-negative number"),
      body("workStatistics.manHours")
        .optional()
        .isInt({ min: 0 })
        .withMessage("Man hours must be a non-negative number"),
      body("safetyPerformance.ppeCompliance")
        .optional()
        .isInt({ min: 0, max: 100 })
        .withMessage("PPE compliance must be between 0 and 100"),
      body("safetyPerformance.housekeeping")
        .optional()
        .isInt({ min: 0, max: 100 })
        .withMessage("Housekeeping score must be between 0 and 100"),
      body("safetyPerformance.equipmentSafety")
        .optional()
        .isInt({ min: 0, max: 100 })
        .withMessage("Equipment safety score must be between 0 and 100"),
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
        reportDate,
        workStatistics = {
          totalWorkers: 0,
          meilEmployees: 0,
          subcontractor: 0,
          visitors: 0,
          manHours: 0,
          safeDays: 0,
          highRiskActivities: [],
          workPermits: {
            height: 0,
            hotWork: 0,
            excavation: 0,
          },
        },
        safetyPerformance = {
          safetyScore: 0,
          ppeCompliance: 0,
          housekeeping: 0,
          equipmentSafety: 0,
          scoreBreakdown: {
            briefingCompletion: { score: 0, maxScore: 20 },
            inspectionQuality: { score: 0, maxScore: 25 },
            ppeCompliance: { score: 0, maxScore: 20 },
            observationsLogged: { score: 0, maxScore: 15 },
            zeroIncidents: { score: 0, maxScore: 20 },
          },
        },
        activitiesSummary = {
          toolboxTalks: { count: 0, attendees: 0, topics: [] },
          siteInspections: { count: 0, categories: [] },
          incidentsReported: { count: 0, types: [] },
          observationsLogged: { count: 0, safe: 0, unsafe: 0 },
          openActions: { count: 0, critical: 0, high: 0, medium: 0, low: 0 },
        },
        ssoReview = {
          siteStatus: "",
          highlights: "",
          concerns: "",
          tomorrowPlan: "",
          weatherImpact: "",
          equipmentIssues: "",
          photos: [],
          ssoSignature: "",
        },
      } = req.body;

      // Generate unique report ID if not provided
      const reportId =
        req.body.reportId ||
        `DR-${new Date().getFullYear()}-${String(
          new Date().getMonth() + 1
        ).padStart(2, "0")}${String(new Date().getDate()).padStart(
          2,
          "0"
        )}-${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`;

      const endOfDayReport = new EndOfDayReport({
        projectId,
        reportId,
        reportDate: new Date(reportDate),
        workStatistics,
        safetyPerformance,
        activitiesSummary,
        ssoReview,
        status: "draft",
        createdBy: req.user.id,
      });

      await endOfDayReport.save();

      res.status(201).json({
        message: "End of day report saved as draft",
        data: endOfDayReport,
      });
    } catch (error) {
      console.error("Error saving end of day report draft:", error);
      if (error.code === 11000) {
        return res.status(400).json({
          message: "Report ID already exists. Please try again.",
        });
      }
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// @route   GET /api/end-of-day-report
// @desc    Get all end of day reports with filtering and pagination
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      projectId,
      status,
      startDate,
      endDate,
      sortBy = "reportDate",
      sortOrder = "desc",
    } = req.query;

    const filter = {};
    if (projectId) filter.projectId = projectId;
    if (status) filter.status = status;

    if (startDate || endDate) {
      filter.reportDate = {};
      if (startDate) filter.reportDate.$gte = new Date(startDate);
      if (endDate) filter.reportDate.$lte = new Date(endDate);
    }

    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const endOfDayReports = await EndOfDayReport.find(filter)
      .populate("createdBy", "name email employeeId")
      .populate("updatedBy", "name email employeeId")
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await EndOfDayReport.countDocuments(filter);

    res.json({
      data: endOfDayReports,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error("Error fetching end of day reports:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/end-of-day-report/:id
// @desc    Get a specific end of day report
// @access  Private
router.get("/:id", auth, async (req, res) => {
  try {
    const endOfDayReport = await EndOfDayReport.findById(req.params.id)
      .populate("createdBy", "name email employeeId")
      .populate("updatedBy", "name email employeeId");

    if (!endOfDayReport) {
      return res.status(404).json({ message: "End of day report not found" });
    }

    res.json({ data: endOfDayReport });
  } catch (error) {
    console.error("Error fetching end of day report:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   PUT /api/end-of-day-report/:id
// @desc    Update an end of day report
// @access  Private
router.put(
  "/:id",
  [
    auth,
    [
      body("status")
        .optional()
        .isIn(["draft", "submitted", "approved", "archived"]),
      body("workStatistics.totalWorkers")
        .optional()
        .isInt({ min: 0 })
        .withMessage("Total workers must be a non-negative number"),
      body("safetyPerformance.ppeCompliance")
        .optional()
        .isInt({ min: 0, max: 100 })
        .withMessage("PPE compliance must be between 0 and 100"),
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
        workStatistics,
        safetyPerformance,
        activitiesSummary,
        ssoReview,
        approvedBy,
        approvalNotes,
      } = req.body;

      const endOfDayReport = await EndOfDayReport.findById(req.params.id);
      if (!endOfDayReport) {
        return res.status(404).json({ message: "End of day report not found" });
      }

      // Update fields
      if (workStatistics) {
        Object.assign(endOfDayReport.workStatistics, workStatistics);
      }
      if (safetyPerformance) {
        Object.assign(endOfDayReport.safetyPerformance, safetyPerformance);
      }
      if (activitiesSummary) {
        Object.assign(endOfDayReport.activitiesSummary, activitiesSummary);
      }
      if (ssoReview) {
        Object.assign(endOfDayReport.ssoReview, ssoReview);
      }

      // Handle status changes
      if (status) {
        if (status === "approved") {
          if (!approvedBy) {
            return res.status(400).json({
              message: "Approved by field is required when approving report",
            });
          }
          endOfDayReport.approve(approvedBy, approvalNotes || "");
        } else if (status === "archived") {
          endOfDayReport.archive();
        } else {
          endOfDayReport.status = status;
        }
      }

      endOfDayReport.updatedBy = req.user.id;

      await endOfDayReport.save();

      res.json({
        message: "End of day report updated successfully",
        data: endOfDayReport,
      });
    } catch (error) {
      console.error("Error updating end of day report:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// @route   DELETE /api/end-of-day-report/:id
// @desc    Delete an end of day report
// @access  Private (Admin only)
router.delete("/:id", auth, async (req, res) => {
  try {
    const endOfDayReport = await EndOfDayReport.findById(req.params.id);
    if (!endOfDayReport) {
      return res.status(404).json({ message: "End of day report not found" });
    }

    // Check if user is admin or created the report
    if (
      req.user.role !== "admin" &&
      endOfDayReport.createdBy.toString() !== req.user.id
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this end of day report" });
    }

    await EndOfDayReport.findByIdAndDelete(req.params.id);

    res.json({ message: "End of day report deleted successfully" });
  } catch (error) {
    console.error("Error deleting end of day report:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/end-of-day-report/stats/overview
// @desc    Get end of day report statistics
// @access  Private
router.get("/stats/overview", auth, async (req, res) => {
  try {
    const { projectId, startDate, endDate } = req.query;
    const filter = {};
    if (projectId) filter.projectId = projectId;
    if (startDate || endDate) {
      filter.reportDate = {};
      if (startDate) filter.reportDate.$gte = new Date(startDate);
      if (endDate) filter.reportDate.$lte = new Date(endDate);
    }

    const stats = await EndOfDayReport.aggregate([
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
          approved: {
            $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] },
          },
          archived: {
            $sum: { $cond: [{ $eq: ["$status", "archived"] }, 1, 0] },
          },
          totalWorkers: { $sum: "$workStatistics.totalWorkers" },
          totalManHours: { $sum: "$workStatistics.manHours" },
          avgSafetyScore: { $avg: "$safetyPerformance.safetyScore" },
          avgPpeCompliance: { $avg: "$safetyPerformance.ppeCompliance" },
          avgHousekeeping: { $avg: "$safetyPerformance.housekeeping" },
          avgEquipmentSafety: { $avg: "$safetyPerformance.equipmentSafety" },
          totalToolboxTalks: { $sum: "$activitiesSummary.toolboxTalks.count" },
          totalSiteInspections: {
            $sum: "$activitiesSummary.siteInspections.count",
          },
          totalIncidents: {
            $sum: "$activitiesSummary.incidentsReported.count",
          },
          totalObservations: {
            $sum: "$activitiesSummary.observationsLogged.count",
          },
          totalOpenActions: { $sum: "$activitiesSummary.openActions.count" },
        },
      },
    ]);

    res.json({ data: stats[0] || {} });
  } catch (error) {
    console.error("Error fetching end of day report statistics:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/end-of-day-report/performance/trends
// @desc    Get safety performance trends
// @access  Private
router.get("/performance/trends", auth, async (req, res) => {
  try {
    const { projectId, days = 30 } = req.query;
    const filter = { projectId };
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    filter.reportDate = { $gte: startDate, $lte: endDate };

    const trends = await EndOfDayReport.find(filter)
      .select(
        "reportDate safetyPerformance.ppeCompliance safetyPerformance.housekeeping safetyPerformance.equipmentSafety safetyPerformance.safetyScore"
      )
      .sort({ reportDate: 1 });

    res.json({ data: trends });
  } catch (error) {
    console.error("Error fetching performance trends:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/end-of-day-report/workforce/analytics
// @desc    Get workforce analytics
// @access  Private
router.get("/workforce/analytics", auth, async (req, res) => {
  try {
    const { projectId, startDate, endDate } = req.query;
    const filter = { projectId };
    if (startDate || endDate) {
      filter.reportDate = {};
      if (startDate) filter.reportDate.$gte = new Date(startDate);
      if (endDate) filter.reportDate.$lte = new Date(endDate);
    }

    const analytics = await EndOfDayReport.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          avgTotalWorkers: { $avg: "$workStatistics.totalWorkers" },
          avgMeilEmployees: { $avg: "$workStatistics.meilEmployees" },
          avgSubcontractors: { $avg: "$workStatistics.subcontractor" },
          avgVisitors: { $avg: "$workStatistics.visitors" },
          avgManHours: { $avg: "$workStatistics.manHours" },
          avgHoursPerWorker: {
            $avg: {
              $divide: [
                "$workStatistics.manHours",
                "$workStatistics.totalWorkers",
              ],
            },
          },
          totalManHours: { $sum: "$workStatistics.manHours" },
          maxWorkers: { $max: "$workStatistics.totalWorkers" },
          minWorkers: { $min: "$workStatistics.totalWorkers" },
        },
      },
    ]);

    res.json({ data: analytics[0] || {} });
  } catch (error) {
    console.error("Error fetching workforce analytics:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/end-of-day-report/latest
// @desc    Get latest end of day report for a project
// @access  Private
router.get("/latest", auth, async (req, res) => {
  try {
    const { projectId } = req.query;
    if (!projectId) {
      return res.status(400).json({ message: "Project ID is required" });
    }

    const latestReport = await EndOfDayReport.findOne({ projectId })
      .populate("createdBy", "name email employeeId")
      .sort({ reportDate: -1 });

    if (!latestReport) {
      return res
        .status(404)
        .json({ message: "No reports found for this project" });
    }

    res.json({ data: latestReport });
  } catch (error) {
    console.error("Error fetching latest end of day report:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
