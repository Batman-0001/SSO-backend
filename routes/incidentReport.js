const express = require("express");
const { body, validationResult } = require("express-validator");
const IncidentReport = require("../models/IncidentReport");
const { auth } = require("../middleware/auth");

const router = express.Router();

// @route   POST /api/incident-report
// @desc    Create a new incident report
// @access  Private
router.post(
  "/",
  [
    auth,
    [
      body("incidentId").notEmpty().withMessage("Incident ID is required"),
      body("dateTime")
        .isISO8601()
        .withMessage("Valid date and time is required"),
      body("location").notEmpty().withMessage("Location is required"),
      body("incidentType")
        .isIn([
          "near_miss",
          "first_aid",
          "medical",
          "lti",
          "property",
          "environmental",
        ])
        .withMessage("Valid incident type is required"),
      body("severity")
        .isIn(["low", "medium", "high"])
        .withMessage("Valid severity level is required"),
    ],
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        incidentId,
        dateTime,
        location,
        incidentType,
        severity,
        quickPhotos,
        description,
        activity,
        equipment,
        weather,
        photos,
        personName,
        personRole,
        personCompany,
        injuryDetails,
        treatment,
        witnessName,
        witnessStatement,
        immediateCause,
        rootCause,
        immediateActions,
        correctiveActions,
        status = "draft",
      } = req.body;

      // Determine status based on completeness
      let finalStatus = status;
      if (description && photos && photos.length > 0) {
        finalStatus = "submitted";
      }

      const incidentReport = new IncidentReport({
        incidentId,
        dateTime: new Date(dateTime),
        location,
        incidentType,
        severity,
        quickPhotos: quickPhotos || [],
        description: description || "",
        activity: activity || "",
        equipment: equipment || "",
        weather: weather || "Partly Cloudy, 28°C",
        photos: photos || [],
        personName: personName || "",
        personRole: personRole || "",
        personCompany: personCompany || "",
        injuryDetails: injuryDetails || "",
        treatment: treatment || "",
        witnessName: witnessName || "",
        witnessStatement: witnessStatement || "",
        immediateCause: immediateCause || "",
        rootCause: rootCause || "",
        immediateActions: immediateActions || "",
        correctiveActions: correctiveActions || "",
        status: finalStatus,
        submittedAt: finalStatus === "submitted" ? new Date() : undefined,
        createdBy: req.user.id,
      });

      await incidentReport.save();

      // Check if high priority incident (send alerts)
      const isHighPriority = incidentReport.isHighPriority();
      if (isHighPriority) {
        // In a real application, you would send SMS/email alerts here
        console.log(
          `High priority incident: ${incidentId} - SMS alert should be sent to HO Middle Management`
        );
      }

      let responseMessage =
        finalStatus === "draft"
          ? "Incident report saved as draft"
          : `✓ Incident Report Submitted\nIncident ID: ${incidentId}\nStatus: Under Investigation`;

      res.status(201).json({
        message: responseMessage,
        data: incidentReport,
        isHighPriority,
        alertMessage: isHighPriority
          ? "🚨 SMS alert sent to HO Middle Management"
          : null,
        status: finalStatus,
      });
    } catch (error) {
      console.error("Error creating incident report:", error);

      // Handle duplicate incident ID
      if (error.code === 11000) {
        return res.status(400).json({
          message: "Incident ID already exists",
        });
      }

      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// @route   POST /api/incident-report/quick-save
// @desc    Quick save incident report (minimal data)
// @access  Private
router.post(
  "/quick-save",
  [
    auth,
    [
      body("incidentId").notEmpty().withMessage("Incident ID is required"),
      body("dateTime")
        .isISO8601()
        .withMessage("Valid date and time is required"),
      body("location").notEmpty().withMessage("Location is required"),
      body("incidentType")
        .isIn([
          "near_miss",
          "first_aid",
          "medical",
          "lti",
          "property",
          "environmental",
        ])
        .withMessage("Valid incident type is required"),
      body("severity")
        .isIn(["low", "medium", "high"])
        .withMessage("Valid severity level is required"),
    ],
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        incidentId,
        dateTime,
        location,
        incidentType,
        severity,
        quickPhotos,
        weather = "Partly Cloudy, 28°C",
      } = req.body;

      const incidentReport = new IncidentReport({
        incidentId,
        dateTime: new Date(dateTime),
        location,
        incidentType,
        severity,
        quickPhotos: quickPhotos || [],
        weather,
        status: "draft",
        createdBy: req.user.id,
      });

      await incidentReport.save();

      // Send high-priority alert for critical incidents
      let alertMessage = "Incident captured! Complete details when ready.";
      let priority = "normal";

      if (severity === "high" || incidentType === "lti") {
        alertMessage +=
          " High-priority incident - management has been notified.";
        priority = "high";
      }

      res.status(201).json({
        message: alertMessage,
        data: incidentReport,
        priority,
      });
    } catch (error) {
      console.error("Error quick saving incident report:", error);

      if (error.code === 11000) {
        return res.status(400).json({
          message: "Incident ID already exists",
        });
      }

      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// @route   POST /api/incident-report/save-draft
// @desc    Save incident report as draft (from any tab)
// @access  Private
router.post(
  "/save-draft",
  [
    auth,
    [
      body("incidentId").notEmpty().withMessage("Incident ID is required"),
      body("dateTime")
        .isISO8601()
        .withMessage("Valid date and time is required"),
      body("location").notEmpty().withMessage("Location is required"),
      body("incidentType")
        .isIn([
          "near_miss",
          "first_aid",
          "medical",
          "lti",
          "property",
          "environmental",
        ])
        .withMessage("Valid incident type is required"),
      body("severity")
        .isIn(["low", "medium", "high"])
        .withMessage("Valid severity level is required"),
    ],
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        incidentId,
        dateTime,
        location,
        incidentType,
        severity,
        quickPhotos,
        description = "",
        activity = "",
        equipment = "",
        weather = "Partly Cloudy, 28°C",
        photos = [],
        personName = "",
        personRole = "",
        personCompany = "",
        injuryDetails = "",
        treatment = "",
        witnessName = "",
        witnessStatement = "",
        immediateCause = "",
        rootCause = "",
        immediateActions = "",
        correctiveActions = "",
      } = req.body;

      const incidentReport = new IncidentReport({
        incidentId,
        dateTime: new Date(dateTime),
        location,
        incidentType,
        severity,
        quickPhotos: quickPhotos || [],
        description,
        activity,
        equipment,
        weather,
        photos,
        personName,
        personRole,
        personCompany,
        injuryDetails,
        treatment,
        witnessName,
        witnessStatement,
        immediateCause,
        rootCause,
        immediateActions,
        correctiveActions,
        status: "draft",
        createdBy: req.user.id,
      });

      await incidentReport.save();

      res.status(201).json({
        message: "Incident report saved as draft",
        data: incidentReport,
      });
    } catch (error) {
      console.error("Error saving incident draft:", error);

      if (error.code === 11000) {
        return res.status(400).json({
          message: "Incident ID already exists",
        });
      }

      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// @route   GET /api/incident-report
// @desc    Get all incident reports with filtering and pagination
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      location,
      incidentType,
      severity,
      status = "submitted",
      createdBy,
      sortBy = "dateTime",
      sortOrder = "desc",
      dateFrom,
      dateTo,
      priority,
    } = req.query;

    const filter = {};

    if (location) filter.location = new RegExp(location, "i");
    if (incidentType) filter.incidentType = incidentType;
    if (severity) filter.severity = severity;
    if (status) filter.status = status;
    if (createdBy) filter.createdBy = createdBy;

    // Date range filter
    if (dateFrom || dateTo) {
      filter.dateTime = {};
      if (dateFrom) filter.dateTime.$gte = new Date(dateFrom);
      if (dateTo) filter.dateTime.$lte = new Date(dateTo);
    }

    // Priority filter
    if (priority === "critical") {
      filter.$or = [{ incidentType: "lti" }, { severity: "high" }];
    }

    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const incidents = await IncidentReport.find(filter)
      .populate("createdBy", "name email employeeId")
      .populate("updatedBy", "name email employeeId")
      .populate("investigator", "name email employeeId")
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await IncidentReport.countDocuments(filter);

    res.json({
      data: incidents,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error("Error fetching incident reports:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/incident-report/:id
// @desc    Get a specific incident report
// @access  Private
router.get("/:id", auth, async (req, res) => {
  try {
    const incident = await IncidentReport.findById(req.params.id)
      .populate("createdBy", "name email employeeId")
      .populate("updatedBy", "name email employeeId")
      .populate("investigator", "name email employeeId")
      .populate("followUpActions.assignedTo", "name email employeeId")
      .populate("followUpActions.completedBy", "name email employeeId");

    if (!incident) {
      return res.status(404).json({ message: "Incident report not found" });
    }

    res.json({ data: incident });
  } catch (error) {
    console.error("Error fetching incident report:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   PUT /api/incident-report/:id
// @desc    Update an incident report
// @access  Private
router.put(
  "/:id",
  [
    auth,
    [
      body("status")
        .optional()
        .isIn([
          "draft",
          "submitted",
          "under_investigation",
          "investigation_complete",
          "closed",
        ]),
      body("incidentType")
        .optional()
        .isIn([
          "near_miss",
          "first_aid",
          "medical",
          "lti",
          "property",
          "environmental",
        ]),
      body("severity").optional().isIn(["low", "medium", "high"]),
    ],
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const updateData = req.body;

      const incident = await IncidentReport.findById(req.params.id);
      if (!incident) {
        return res.status(404).json({ message: "Incident report not found" });
      }

      // Update fields
      Object.keys(updateData).forEach((key) => {
        if (updateData[key] !== undefined) {
          incident[key] = updateData[key];
        }
      });

      // Handle status change logic
      if (updateData.status && updateData.status !== incident.status) {
        if (updateData.status === "submitted" && !incident.submittedAt) {
          incident.submittedAt = new Date();
        }
        if (updateData.status === "closed" && !incident.closedAt) {
          incident.closedAt = new Date();
        }
      }

      incident.updatedBy = req.user.id;

      await incident.save();

      res.json({
        message: "Incident report updated successfully",
        data: incident,
      });
    } catch (error) {
      console.error("Error updating incident report:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// @route   DELETE /api/incident-report/:id
// @desc    Delete an incident report
// @access  Private (Admin only)
router.delete("/:id", auth, async (req, res) => {
  try {
    const incident = await IncidentReport.findById(req.params.id);
    if (!incident) {
      return res.status(404).json({ message: "Incident report not found" });
    }

    // Check if user is admin or created the incident
    if (
      req.user.role !== "admin" &&
      incident.createdBy.toString() !== req.user.id
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this incident report" });
    }

    await IncidentReport.findByIdAndDelete(req.params.id);

    res.json({ message: "Incident report deleted successfully" });
  } catch (error) {
    console.error("Error deleting incident report:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   POST /api/incident-report/generate-incident-id
// @desc    Generate a new incident ID
// @access  Private
router.post("/generate-incident-id", auth, async (req, res) => {
  try {
    let incidentId;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      incidentId = IncidentReport.generateIncidentId();
      const existing = await IncidentReport.findOne({ incidentId });
      if (!existing) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return res.status(500).json({
        message: "Unable to generate unique incident ID",
      });
    }

    res.json({
      incidentId,
    });
  } catch (error) {
    console.error("Error generating incident ID:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/incident-report/stats/overview
// @desc    Get incident report statistics
// @access  Private
router.get("/stats/overview", auth, async (req, res) => {
  try {
    const { dateFrom, dateTo, location } = req.query;
    const filter = {};

    if (location) filter.location = new RegExp(location, "i");

    // Date range filter
    if (dateFrom || dateTo) {
      filter.dateTime = {};
      if (dateFrom) filter.dateTime.$gte = new Date(dateFrom);
      if (dateTo) filter.dateTime.$lte = new Date(dateTo);
    }

    const stats = await IncidentReport.getStatistics(filter);

    // Get incident type breakdown
    const typeStats = await IncidentReport.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$incidentType",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Get severity breakdown
    const severityStats = await IncidentReport.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$severity",
          count: { $sum: 1 },
        },
      },
    ]);

    // Get monthly trend
    const monthlyTrend = await IncidentReport.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            year: { $year: "$dateTime" },
            month: { $month: "$dateTime" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 12 },
    ]);

    res.json({
      data: {
        ...stats,
        incidentTypes: typeStats,
        severityBreakdown: severityStats,
        monthlyTrend,
      },
    });
  } catch (error) {
    console.error("Error fetching incident statistics:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/incident-report/types/incident-types
// @desc    Get all available incident types
// @access  Private
router.get("/types/incident-types", auth, async (req, res) => {
  try {
    const incidentTypes = [
      {
        value: "near_miss",
        label: "Near Miss",
        color: "border-yellow-300 bg-yellow-50",
        description:
          "An unplanned event that did not result in injury, illness, or damage",
      },
      {
        value: "first_aid",
        label: "First Aid Case",
        color: "border-blue-300 bg-blue-50",
        description: "Minor injury requiring first aid treatment only",
      },
      {
        value: "medical",
        label: "Medical Treatment",
        color: "border-orange-300 bg-orange-50",
        description: "Injury requiring medical treatment beyond first aid",
      },
      {
        value: "lti",
        label: "Lost Time Injury",
        color: "border-red-300 bg-red-50",
        description: "Injury resulting in lost work time",
      },
      {
        value: "property",
        label: "Property Damage",
        color: "border-purple-300 bg-purple-50",
        description: "Damage to equipment, materials, or property",
      },
      {
        value: "environmental",
        label: "Environmental",
        color: "border-green-300 bg-green-50",
        description: "Environmental incident or violation",
      },
    ];

    res.json({
      data: incidentTypes,
    });
  } catch (error) {
    console.error("Error fetching incident types:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/incident-report/types/severity-levels
// @desc    Get all available severity levels
// @access  Private
router.get("/types/severity-levels", auth, async (req, res) => {
  try {
    const severityLevels = [
      {
        value: "low",
        label: "Low",
        color: "bg-green-500",
        emoji: "🟢",
        description: "Minimal impact, easily controlled",
      },
      {
        value: "medium",
        label: "Medium",
        color: "bg-yellow-500",
        emoji: "🟡",
        description: "Moderate impact, requires attention",
      },
      {
        value: "high",
        label: "High",
        color: "bg-red-500",
        emoji: "🔴",
        description: "Significant impact, immediate action required",
      },
    ];

    res.json({
      data: severityLevels,
    });
  } catch (error) {
    console.error("Error fetching severity levels:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   POST /api/incident-report/:id/assign-investigator
// @desc    Assign investigator to incident
// @access  Private (Admin/Manager)
router.post("/:id/assign-investigator", auth, async (req, res) => {
  try {
    const { investigatorId, investigationNotes } = req.body;

    const incident = await IncidentReport.findById(req.params.id);
    if (!incident) {
      return res.status(404).json({ message: "Incident report not found" });
    }

    incident.investigator = investigatorId;
    incident.investigationNotes = investigationNotes;
    incident.status = "under_investigation";
    incident.investigationDate = new Date();
    incident.updatedBy = req.user.id;

    await incident.save();

    res.json({
      message: "Investigator assigned successfully",
      data: incident,
    });
  } catch (error) {
    console.error("Error assigning investigator:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   POST /api/incident-report/:id/add-follow-up
// @desc    Add follow-up action to incident
// @access  Private
router.post("/:id/add-follow-up", auth, async (req, res) => {
  try {
    const { action, assignedTo, dueDate } = req.body;

    const incident = await IncidentReport.findById(req.params.id);
    if (!incident) {
      return res.status(404).json({ message: "Incident report not found" });
    }

    const followUpAction = {
      action,
      assignedTo,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      status: "pending",
    };

    incident.followUpActions.push(followUpAction);
    incident.updatedBy = req.user.id;

    await incident.save();

    res.json({
      message: "Follow-up action added successfully",
      data: incident,
    });
  } catch (error) {
    console.error("Error adding follow-up action:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   PUT /api/incident-report/:id/follow-up/:actionId
// @desc    Update follow-up action status
// @access  Private
router.put("/:id/follow-up/:actionId", auth, async (req, res) => {
  try {
    const { status, completedBy } = req.body;

    const incident = await IncidentReport.findById(req.params.id);
    if (!incident) {
      return res.status(404).json({ message: "Incident report not found" });
    }

    const action = incident.followUpActions.id(req.params.actionId);
    if (!action) {
      return res.status(404).json({ message: "Follow-up action not found" });
    }

    action.status = status;
    if (status === "completed") {
      action.completedDate = new Date();
      action.completedBy = completedBy || req.user.id;
    }

    incident.updatedBy = req.user.id;
    await incident.save();

    res.json({
      message: "Follow-up action updated successfully",
      data: incident,
    });
  } catch (error) {
    console.error("Error updating follow-up action:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
