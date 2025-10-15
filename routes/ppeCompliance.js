const express = require("express");
const { body, validationResult } = require("express-validator");
const PPECompliance = require("../models/PPECompliance");
const { auth } = require("../middleware/auth");

const router = express.Router();

// ================================
// PPE COMPLIANCE ROUTES
// ================================

// @route   POST /api/ppe-compliance
// @desc    Create a new PPE compliance check (both quick and detailed modes)
// @access  Private
router.post(
  "/",
  [
    auth,
    [
      body("projectId").notEmpty().withMessage("Project ID is required"),
      body("mode")
        .isIn(["quick", "detailed"])
        .withMessage("Mode must be quick or detailed"),
      body("area").notEmpty().withMessage("Area is required"),
      body("activity").notEmpty().withMessage("Activity is required"),
      body("auditorName").notEmpty().withMessage("Auditor name is required"),
      // Quick mode validation
      body("workersCount")
        .if(body("mode").equals("quick"))
        .isInt({ min: 1 })
        .withMessage("Workers count must be at least 1 for quick mode"),
      body("compliantCount")
        .if(body("mode").equals("quick"))
        .isInt({ min: 0 })
        .withMessage("Compliant count must be non-negative"),
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
        mode,
        area,
        activity,
        auditorName,
        auditorId,
        workersCount,
        compliantCount,
        groupPhoto,
        averagePpeChecks,
        workerAudits,
        photos = [],
        notes = "",
        weatherConditions = "",
        status = "draft",
      } = req.body;

      const ppeCompliance = new PPECompliance({
        projectId,
        mode,
        area,
        activity,
        auditorName,
        auditorId: auditorId || "",
        workersCount: workersCount || 0,
        compliantCount: compliantCount || 0,
        groupPhoto: groupPhoto || "",
        averagePpeChecks: averagePpeChecks || {},
        workerAudits: workerAudits || [],
        photos,
        notes,
        weatherConditions,
        status,
        createdBy: req.user.id,
      });

      await ppeCompliance.save();

      res.status(201).json({
        message:
          status === "draft"
            ? "PPE compliance check saved as draft"
            : "PPE compliance check submitted successfully",
        data: ppeCompliance,
      });
    } catch (error) {
      console.error("Error creating PPE compliance check:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// @route   POST /api/ppe-compliance/save-draft
// @desc    Save PPE compliance check as draft
// @access  Private
router.post(
  "/save-draft",
  [
    auth,
    [
      body("projectId").notEmpty().withMessage("Project ID is required"),
      body("mode")
        .isIn(["quick", "detailed"])
        .withMessage("Mode must be quick or detailed"),
      body("area").notEmpty().withMessage("Area is required"),
      body("activity").notEmpty().withMessage("Activity is required"),
      body("auditorName").notEmpty().withMessage("Auditor name is required"),
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
        mode,
        area,
        activity,
        auditorName,
        auditorId = "",
        workersCount = 0,
        compliantCount = 0,
        groupPhoto = "",
        averagePpeChecks = {},
        workerAudits = [],
        photos = [],
        notes = "",
        weatherConditions = "",
      } = req.body;

      const ppeCompliance = new PPECompliance({
        projectId,
        mode,
        area,
        activity,
        auditorName,
        auditorId,
        workersCount,
        compliantCount,
        groupPhoto,
        averagePpeChecks,
        workerAudits,
        photos,
        notes,
        weatherConditions,
        status: "draft",
        createdBy: req.user.id,
      });

      await ppeCompliance.save();

      res.status(201).json({
        message: "Draft saved successfully",
        data: ppeCompliance,
      });
    } catch (error) {
      console.error("Error saving PPE compliance draft:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// @route   GET /api/ppe-compliance
// @desc    Get all PPE compliance checks with filtering and pagination
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      projectId,
      mode,
      area,
      auditorName,
      status,
      sortBy = "auditDate",
      sortOrder = "desc",
    } = req.query;

    const filter = {};
    if (projectId) filter.projectId = projectId;
    if (mode) filter.mode = mode;
    if (area) filter.area = new RegExp(area, "i");
    if (auditorName) filter.auditorName = new RegExp(auditorName, "i");
    if (status) filter.status = status;

    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const results = await PPECompliance.find(filter)
      .populate("createdBy", "name email employeeId")
      .populate("updatedBy", "name email employeeId")
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await PPECompliance.countDocuments(filter);

    res.json({
      data: results,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error("Error fetching PPE compliance checks:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/ppe-compliance/:id
// @desc    Get a specific PPE compliance check
// @access  Private
router.get("/:id", auth, async (req, res) => {
  try {
    const result = await PPECompliance.findById(req.params.id)
      .populate("createdBy", "name email employeeId")
      .populate("updatedBy", "name email employeeId");

    if (!result) {
      return res
        .status(404)
        .json({ message: "PPE compliance check not found" });
    }

    res.json({ data: result });
  } catch (error) {
    console.error("Error fetching PPE compliance check:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   PUT /api/ppe-compliance/:id
// @desc    Update a PPE compliance check
// @access  Private
router.put(
  "/:id",
  [
    auth,
    [
      body("status")
        .optional()
        .isIn(["draft", "completed", "reviewed", "action_required"]),
      body("workersCount").optional().isInt({ min: 0 }),
      body("compliantCount").optional().isInt({ min: 0 }),
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
        workersCount,
        compliantCount,
        groupPhoto,
        averagePpeChecks,
        workerAudits,
        photos,
        notes,
        weatherConditions,
      } = req.body;

      const result = await PPECompliance.findById(req.params.id);
      if (!result) {
        return res
          .status(404)
          .json({ message: "PPE compliance check not found" });
      }

      // Update fields
      if (status) result.status = status;
      if (workersCount !== undefined) result.workersCount = workersCount;
      if (compliantCount !== undefined) result.compliantCount = compliantCount;
      if (groupPhoto !== undefined) result.groupPhoto = groupPhoto;
      if (averagePpeChecks) result.averagePpeChecks = averagePpeChecks;
      if (workerAudits) result.workerAudits = workerAudits;
      if (photos) result.photos = photos;
      if (notes !== undefined) result.notes = notes;
      if (weatherConditions !== undefined)
        result.weatherConditions = weatherConditions;

      result.updatedBy = req.user.id;

      await result.save();

      res.json({
        message: "PPE compliance check updated successfully",
        data: result,
      });
    } catch (error) {
      console.error("Error updating PPE compliance check:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// @route   POST /api/ppe-compliance/:id/workers
// @desc    Add worker audit to detailed mode compliance check
// @access  Private
router.post(
  "/:id/workers",
  [
    auth,
    [
      body("workerId").optional().isString(),
      body("name").optional().isString(),
      body("photo").optional().isString(),
      body("ppeItems").optional().isArray(),
      body("compliant").optional().isBoolean(),
      body("notes").optional().isString(),
    ],
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { workerId, name, photo, ppeItems, compliant, notes } = req.body;

      const result = await PPECompliance.findById(req.params.id);
      if (!result) {
        return res
          .status(404)
          .json({ message: "PPE compliance check not found" });
      }

      if (result.mode !== "detailed") {
        return res.status(400).json({
          message:
            "Worker audits can only be added to detailed mode compliance checks",
        });
      }

      // Calculate compliance percentage for this worker
      let compliancePercentage = 0;
      if (ppeItems && ppeItems.length > 0) {
        const compliantItems = ppeItems.filter((item) => item.compliant).length;
        compliancePercentage = Math.round(
          (compliantItems / ppeItems.length) * 100
        );
      }

      const workerData = {
        workerId,
        name,
        photo,
        ppeItems,
        compliant: compliant || compliancePercentage >= 80,
        compliancePercentage,
        notes,
      };

      result.addWorkerAudit(workerData);
      result.updatedBy = req.user.id;

      await result.save();

      res.json({
        message: "Worker audit added successfully",
        data: result,
      });
    } catch (error) {
      console.error("Error adding worker audit:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// @route   PUT /api/ppe-compliance/:id/workers/:workerIndex
// @desc    Update a specific worker audit
// @access  Private
router.put(
  "/:id/workers/:workerIndex",
  [
    auth,
    [
      body("workerId").optional().isString(),
      body("name").optional().isString(),
      body("photo").optional().isString(),
      body("ppeItems").optional().isArray(),
      body("compliant").optional().isBoolean(),
      body("notes").optional().isString(),
    ],
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { workerId, name, photo, ppeItems, compliant, notes } = req.body;
      const workerIndex = parseInt(req.params.workerIndex);

      const result = await PPECompliance.findById(req.params.id);
      if (!result) {
        return res
          .status(404)
          .json({ message: "PPE compliance check not found" });
      }

      if (result.mode !== "detailed") {
        return res.status(400).json({
          message:
            "Worker audits can only be updated in detailed mode compliance checks",
        });
      }

      // Calculate compliance percentage for this worker
      let compliancePercentage = 0;
      if (ppeItems && ppeItems.length > 0) {
        const compliantItems = ppeItems.filter((item) => item.compliant).length;
        compliancePercentage = Math.round(
          (compliantItems / ppeItems.length) * 100
        );
      }

      const workerData = {
        workerId,
        name,
        photo,
        ppeItems,
        compliant: compliant || compliancePercentage >= 80,
        compliancePercentage,
        notes,
      };

      result.updateWorkerAudit(workerIndex, workerData);
      result.updatedBy = req.user.id;

      await result.save();

      res.json({
        message: "Worker audit updated successfully",
        data: result,
      });
    } catch (error) {
      console.error("Error updating worker audit:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// @route   POST /api/ppe-compliance/:id/action-items
// @desc    Add action item to PPE compliance check
// @access  Private
router.post(
  "/:id/action-items",
  [
    auth,
    [
      body("workerId").optional().isString(),
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
        workerId,
        description,
        priority = "medium",
        assignedTo,
        dueDate,
        notes,
      } = req.body;

      const result = await PPECompliance.findById(req.params.id);
      if (!result) {
        return res
          .status(404)
          .json({ message: "PPE compliance check not found" });
      }

      const actionItemData = {
        workerId,
        description,
        priority,
        assignedTo,
        dueDate,
        notes,
      };

      result.addActionItem(actionItemData);
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

// @route   DELETE /api/ppe-compliance/:id
// @desc    Delete a PPE compliance check
// @access  Private (Admin only)
router.delete("/:id", auth, async (req, res) => {
  try {
    const result = await PPECompliance.findById(req.params.id);
    if (!result) {
      return res
        .status(404)
        .json({ message: "PPE compliance check not found" });
    }

    // Check if user is admin or created the result
    if (
      req.user.role !== "admin" &&
      result.createdBy.toString() !== req.user.id
    ) {
      return res
        .status(403)
        .json({
          message: "Not authorized to delete this PPE compliance check",
        });
    }

    await PPECompliance.findByIdAndDelete(req.params.id);

    res.json({ message: "PPE compliance check deleted successfully" });
  } catch (error) {
    console.error("Error deleting PPE compliance check:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ================================
// STATISTICS AND ANALYTICS ROUTES
// ================================

// @route   GET /api/ppe-compliance/stats/overview
// @desc    Get PPE compliance statistics overview
// @access  Private
router.get("/stats/overview", auth, async (req, res) => {
  try {
    const { projectId, mode } = req.query;
    const filter = {};
    if (projectId) filter.projectId = projectId;
    if (mode) filter.mode = mode;

    const stats = await PPECompliance.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          quickChecks: {
            $sum: { $cond: [{ $eq: ["$mode", "quick"] }, 1, 0] },
          },
          detailedAudits: {
            $sum: { $cond: [{ $eq: ["$mode", "detailed"] }, 1, 0] },
          },
          draft: {
            $sum: { $cond: [{ $eq: ["$status", "draft"] }, 1, 0] },
          },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
          actionRequired: {
            $sum: { $cond: [{ $eq: ["$status", "action_required"] }, 1, 0] },
          },
          totalWorkers: { $sum: "$workersCount" },
          totalCompliant: { $sum: "$compliantCount" },
          totalAudited: { $sum: "$totalAudited" },
          avgComplianceRate: { $avg: "$complianceRate" },
          avgOverallComplianceRate: { $avg: "$overallComplianceRate" },
        },
      },
    ]);

    res.json({ data: stats[0] || {} });
  } catch (error) {
    console.error("Error fetching PPE compliance statistics:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/ppe-compliance/stats/areas
// @desc    Get PPE compliance statistics by area
// @access  Private
router.get("/stats/areas", auth, async (req, res) => {
  try {
    const { projectId } = req.query;
    const filter = projectId ? { projectId } : {};

    const areaStats = await PPECompliance.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$area",
          count: { $sum: 1 },
          quickChecks: {
            $sum: { $cond: [{ $eq: ["$mode", "quick"] }, 1, 0] },
          },
          detailedAudits: {
            $sum: { $cond: [{ $eq: ["$mode", "detailed"] }, 1, 0] },
          },
          totalWorkers: { $sum: "$workersCount" },
          totalCompliant: { $sum: "$compliantCount" },
          avgComplianceRate: { $avg: "$complianceRate" },
          avgOverallComplianceRate: { $avg: "$overallComplianceRate" },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json({ data: areaStats });
  } catch (error) {
    console.error("Error fetching area statistics:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/ppe-compliance/stats/auditors
// @desc    Get PPE compliance statistics by auditor
// @access  Private
router.get("/stats/auditors", auth, async (req, res) => {
  try {
    const { projectId } = req.query;
    const filter = projectId ? { projectId } : {};

    const auditorStats = await PPECompliance.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$auditorName",
          count: { $sum: 1 },
          quickChecks: {
            $sum: { $cond: [{ $eq: ["$mode", "quick"] }, 1, 0] },
          },
          detailedAudits: {
            $sum: { $cond: [{ $eq: ["$mode", "detailed"] }, 1, 0] },
          },
          totalWorkers: { $sum: "$workersCount" },
          totalCompliant: { $sum: "$compliantCount" },
          avgComplianceRate: { $avg: "$complianceRate" },
          avgOverallComplianceRate: { $avg: "$overallComplianceRate" },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json({ data: auditorStats });
  } catch (error) {
    console.error("Error fetching auditor statistics:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/ppe-compliance/stats/compliance-trends
// @desc    Get PPE compliance trends over time
// @access  Private
router.get("/stats/compliance-trends", auth, async (req, res) => {
  try {
    const { projectId, days = 30 } = req.query;
    const filter = { projectId };

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - parseInt(days));

    filter.auditDate = { $gte: startDate, $lte: endDate };

    const trends = await PPECompliance.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            year: { $year: "$auditDate" },
            month: { $month: "$auditDate" },
            day: { $dayOfMonth: "$auditDate" },
          },
          count: { $sum: 1 },
          avgComplianceRate: { $avg: "$complianceRate" },
          avgOverallComplianceRate: { $avg: "$overallComplianceRate" },
          totalWorkers: { $sum: "$workersCount" },
          totalCompliant: { $sum: "$compliantCount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]);

    res.json({ data: trends });
  } catch (error) {
    console.error("Error fetching compliance trends:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
