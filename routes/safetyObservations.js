const express = require("express");
const { body, validationResult } = require("express-validator");
const SafetyObservation = require("../models/SafetyObservation");
const { auth } = require("../middleware/auth");

const router = express.Router();

// @route   POST /api/safety-observations
// @desc    Create a new safety observation
// @access  Private
router.post(
  "/",
  [
    auth,
    [
      body("projectId").notEmpty().withMessage("Project ID is required"),
      body("type")
        .optional()
        .isIn(["unsafe_act", "unsafe_condition"])
        .withMessage("Invalid observation type"),
      body("dateTime")
        .isISO8601()
        .withMessage("Valid date and time is required"),
      body("location")
        .optional()
        .notEmpty()
        .withMessage("Location is required"),
      body("observedBy")
        .optional()
        .notEmpty()
        .withMessage("Observed by is required"),
      body("severity")
        .optional()
        .isIn(["Low", "Medium", "High", "Critical"])
        .withMessage("Invalid severity level"),
      body("description")
        .optional()
        .isLength({ min: 10 })
        .withMessage("Description must be at least 10 characters"),
      body("actionOwner")
        .optional()
        .isIn(["site_incharge", "contractor_rep", "other"])
        .withMessage("Invalid action owner"),
      body("photos")
        .optional()
        .isArray()
        .withMessage("Photos must be an array"),
      body("targetClosureDate")
        .optional()
        .isISO8601()
        .withMessage("Invalid target closure date"),
      body("status")
        .optional()
        .isIn(["draft", "open"])
        .withMessage("Status must be draft or open"),
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
        type,
        dateTime,
        location,
        observedBy,
        observedPerson,
        severity,
        description,
        correctiveAction,
        actionOwner,
        targetClosureDate,
        photos = [],
        status = "draft",
      } = req.body;

      // Determine status based on completeness for automatic submission
      let finalStatus = status;
      if (
        status === "open" ||
        (type &&
          location &&
          observedBy &&
          severity &&
          description &&
          actionOwner)
      ) {
        finalStatus = "open";
      }

      // Validate corrective action requirement for submitted observations
      if (
        finalStatus === "open" &&
        ["Medium", "High", "Critical"].includes(severity) &&
        !correctiveAction
      ) {
        return res.status(400).json({
          message:
            "Corrective action is required for Medium/High/Critical severity",
        });
      }

      const safetyObservation = new SafetyObservation({
        projectId,
        type: type || "",
        dateTime: new Date(dateTime),
        location: location || "",
        observedBy: observedBy || "",
        observedPerson: observedPerson || "",
        severity: severity || "",
        description: description || "",
        correctiveAction: correctiveAction || "",
        actionOwner: actionOwner || "",
        targetClosureDate: targetClosureDate
          ? new Date(targetClosureDate)
          : undefined,
        photos,
        status: finalStatus,
        createdBy: req.user.id,
      });

      await safetyObservation.save();

      res.status(201).json({
        message:
          finalStatus === "draft"
            ? "Safety observation saved as draft"
            : "Safety observation submitted successfully",
        data: safetyObservation,
      });
    } catch (error) {
      console.error("Error creating safety observation:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// @route   POST /api/safety-observations/save-draft
// @desc    Save safety observation as draft (minimal validation)
// @access  Private
router.post(
  "/save-draft",
  [
    auth,
    [
      body("projectId").notEmpty().withMessage("Project ID is required"),
      body("dateTime")
        .isISO8601()
        .withMessage("Valid date and time is required"),
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
        type = "",
        location = "",
        observedBy = "",
        observedPerson = "",
        severity = "",
        description = "",
        correctiveAction = "",
        actionOwner = "",
        targetClosureDate,
        photos = [],
      } = req.body;

      const safetyObservation = new SafetyObservation({
        projectId,
        type,
        dateTime: new Date(dateTime),
        location,
        observedBy,
        observedPerson,
        severity,
        description,
        correctiveAction,
        actionOwner,
        targetClosureDate: targetClosureDate
          ? new Date(targetClosureDate)
          : undefined,
        photos,
        status: "draft",
        createdBy: req.user.id,
      });

      await safetyObservation.save();

      res.status(201).json({
        message: "Draft saved successfully",
        data: safetyObservation,
      });
    } catch (error) {
      console.error("Error saving safety observation draft:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// @route   GET /api/safety-observations
// @desc    Get all safety observations with filtering and pagination
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      projectId,
      severity,
      status,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const filter = {};
    if (projectId) filter.projectId = projectId;
    if (severity) filter.severity = severity;
    if (status) filter.status = status;

    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const observations = await SafetyObservation.find(filter)
      .populate("createdBy", "name email employeeId")
      .populate("updatedBy", "name email employeeId")
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await SafetyObservation.countDocuments(filter);

    res.json({
      data: observations,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error("Error fetching safety observations:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/safety-observations/:id
// @desc    Get a specific safety observation
// @access  Private
router.get("/:id", auth, async (req, res) => {
  try {
    const observation = await SafetyObservation.findById(req.params.id)
      .populate("createdBy", "name email employeeId")
      .populate("updatedBy", "name email employeeId");

    if (!observation) {
      return res.status(404).json({ message: "Safety observation not found" });
    }

    res.json({ data: observation });
  } catch (error) {
    console.error("Error fetching safety observation:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   PUT /api/safety-observations/:id
// @desc    Update a safety observation
// @access  Private
router.put(
  "/:id",
  [
    auth,
    [
      body("status")
        .optional()
        .isIn(["draft", "open", "in_progress", "closed", "cancelled"]),
      body("assignedTo").optional().notEmpty(),
      body("closureNotes").optional().notEmpty(),
    ],
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { status, assignedTo, closureNotes } = req.body;

      const observation = await SafetyObservation.findById(req.params.id);
      if (!observation) {
        return res
          .status(404)
          .json({ message: "Safety observation not found" });
      }

      // Update fields
      if (status) observation.status = status;
      if (assignedTo) observation.assignedTo = assignedTo;
      if (closureNotes) observation.closureNotes = closureNotes;

      // Set closure date if status is closed
      if (status === "closed" && !observation.closureDate) {
        observation.closureDate = new Date();
      }

      observation.updatedBy = req.user.id;

      await observation.save();

      res.json({
        message: "Safety observation updated successfully",
        data: observation,
      });
    } catch (error) {
      console.error("Error updating safety observation:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// @route   DELETE /api/safety-observations/:id
// @desc    Delete a safety observation
// @access  Private (Admin only)
router.delete("/:id", auth, async (req, res) => {
  try {
    const observation = await SafetyObservation.findById(req.params.id);
    if (!observation) {
      return res.status(404).json({ message: "Safety observation not found" });
    }

    // Check if user is admin or created the observation
    if (
      req.user.role !== "admin" &&
      observation.createdBy.toString() !== req.user.id
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this observation" });
    }

    await SafetyObservation.findByIdAndDelete(req.params.id);

    res.json({ message: "Safety observation deleted successfully" });
  } catch (error) {
    console.error("Error deleting safety observation:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/safety-observations/stats/overview
// @desc    Get safety observation statistics
// @access  Private
router.get("/stats/overview", auth, async (req, res) => {
  try {
    const { projectId } = req.query;
    const filter = projectId ? { projectId } : {};

    const stats = await SafetyObservation.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          draft: { $sum: { $cond: [{ $eq: ["$status", "draft"] }, 1, 0] } },
          open: { $sum: { $cond: [{ $eq: ["$status", "open"] }, 1, 0] } },
          inProgress: {
            $sum: { $cond: [{ $eq: ["$status", "in_progress"] }, 1, 0] },
          },
          closed: { $sum: { $cond: [{ $eq: ["$status", "closed"] }, 1, 0] } },
          low: { $sum: { $cond: [{ $eq: ["$severity", "Low"] }, 1, 0] } },
          medium: { $sum: { $cond: [{ $eq: ["$severity", "Medium"] }, 1, 0] } },
          high: { $sum: { $cond: [{ $eq: ["$severity", "High"] }, 1, 0] } },
          critical: {
            $sum: { $cond: [{ $eq: ["$severity", "Critical"] }, 1, 0] },
          },
        },
      },
    ]);

    res.json({ data: stats[0] || {} });
  } catch (error) {
    console.error("Error fetching safety statistics:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
