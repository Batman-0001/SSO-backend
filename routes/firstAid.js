const express = require("express");
const { body, validationResult } = require("express-validator");
const FirstAid = require("../models/FirstAid");
const { auth } = require("../middleware/auth");

const router = express.Router();

// @route   POST /api/first-aid
// @desc    Create a new first-aid case
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
      body("victimName")
        .optional()
        .notEmpty()
        .withMessage("Victim name is required"),
      body("victimEmpId")
        .optional()
        .notEmpty()
        .withMessage("Victim employee ID is required"),
      body("victimContractor")
        .optional()
        .notEmpty()
        .withMessage("Victim contractor is required"),
      body("injuryLocation")
        .optional()
        .notEmpty()
        .withMessage("Injury location is required"),
      body("injuryDescription")
        .optional()
        .notEmpty()
        .withMessage("Injury description is required"),
      body("severity")
        .optional()
        .isIn(["minor","moderate","serious", "critical"])
        .withMessage("Severity must be minor, serious, or critical"),
      body("cause").optional().notEmpty().withMessage("Cause is required"),
      body("treatment").optional().notEmpty().withMessage("Treatment is required"),
      body("treatedBy")
        .optional()
        .notEmpty()
        .withMessage("Treated by is required"),
      body("transportToHospital")
        .optional()
        .isBoolean()
        .withMessage("Transport to hospital must be a boolean"),
      body("hospitalName")
        .optional()
        .custom((value, { req }) => {
          if (req.body.transportToHospital && (!value || value.trim().length === 0)) {
            throw new Error("Hospital name is required when victim was transported to hospital");
          }
          return true;
        }),
      body("hospitalDetails")
        .optional()
        .custom((value, { req }) => {
          if (req.body.transportToHospital && (!value || value.trim().length === 0)) {
            throw new Error("Hospital details are required when victim was transported to hospital");
          }
          return true;
        }),
      body("witnessNames")
        .optional()
        .isArray()
        .withMessage("Witness names must be an array"),
      body("photos")
        .optional()
        .isArray()
        .withMessage("Photos must be an array"),
      body("status")
        .optional()
        .isIn(["draft", "reported"])
        .withMessage("Status must be draft or reported"),
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
        victimName,
        victimEmpId,
        victimContractor = "",
        injuryType,
        injuryLocation = "",
        injuryDescription = "",
        severity = "minor",
        cause = injuryDescription, // Map injuryDescription to cause
        treatment: treatmentGiven = "", // Map treatment to treatmentGiven
        treatedBy = "",
        transportToHospital = false,
        hospitalName = "",
        hospitalDetails = "",
        witnessNames = [],
        photos = [],
        status = "draft",
      } = req.body;

      // Determine status based on completeness for automatic submission
      let finalStatus = status;
      if (
        status === "reported" ||
        (victimName && victimEmpId && injuryType && cause && treatmentGiven)
      ) {
        finalStatus = "reported";
      }

      // Filter out empty witness names
      const validWitnessNames = witnessNames.filter(
        (name) => name && name.trim().length > 0
      );

      const firstAid = new FirstAid({
        projectId,
        dateTime: new Date(dateTime),
        victimName: victimName || "",
        victimEmpId: victimEmpId || "",
        victimContractor,
        injuryType: injuryType || "",
        injuryLocation,
        injuryDescription,
        severity,
        cause: cause || "",
        treatmentGiven: treatmentGiven || "",
        treatedBy,
        transportToHospital,
        hospitalName,
        hospitalDetails,
        witnessNames: validWitnessNames,
        photos,
        status: finalStatus,
        createdBy: req.user.id,
      });

      await firstAid.save();

      res.status(201).json({
        message:
          finalStatus === "draft"
            ? "First-aid case saved as draft"
            : "First-aid case submitted successfully",
        data: firstAid,
      });
    } catch (error) {
      console.error("Error creating first-aid case:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// @route   POST /api/first-aid/save-draft
// @desc    Save first-aid case as draft (minimal validation)
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
        victimName = "",
        victimEmpId = "",
        victimContractor = "",
        injuryType = "",
        injuryLocation = "",
        injuryDescription = "",
        severity = "minor",
        cause = injuryDescription, // Map injuryDescription to cause
        treatment: treatmentGiven = "", // Map treatment to treatmentGiven
        treatedBy = "",
        transportToHospital = false,
        hospitalName = "",
        hospitalDetails = "",
        witnessNames = [],
        photos = [],
      } = req.body;

      // Filter out empty witness names
      const validWitnessNames = witnessNames.filter(
        (name) => name && name.trim().length > 0
      );

      const firstAid = new FirstAid({
        projectId,
        dateTime: new Date(dateTime),
        victimName,
        victimEmpId,
        victimContractor,
        injuryType,
        injuryLocation,
        injuryDescription,
        severity,
        cause,
        treatmentGiven,
        treatedBy,
        transportToHospital,
        hospitalName,
        hospitalDetails,
        witnessNames: validWitnessNames,
        photos,
        status: "draft",
        createdBy: req.user.id,
      });

      await firstAid.save();

      res.status(201).json({
        message: "Draft saved successfully",
        data: firstAid,
      });
    } catch (error) {
      console.error("Error saving first-aid draft:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// @route   GET /api/first-aid
// @desc    Get all first-aid cases with filtering and pagination
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      projectId,
      injuryType,
      status,
      transportToHospital,
      victimEmpId,
      sortBy = "dateTime",
      sortOrder = "desc",
    } = req.query;

    const filter = {};
    if (projectId) filter.projectId = projectId;
    if (injuryType) filter.injuryType = new RegExp(injuryType, "i");
    if (status) filter.status = status;
    if (transportToHospital !== undefined)
      filter.transportToHospital = transportToHospital === "true";
    if (victimEmpId) filter.victimEmpId = new RegExp(victimEmpId, "i");

    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const firstAidCases = await FirstAid.find(filter)
      .populate("createdBy", "name email employeeId")
      .populate("updatedBy", "name email employeeId")
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await FirstAid.countDocuments(filter);

    res.json({
      data: firstAidCases,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error("Error fetching first-aid cases:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/first-aid/:id
// @desc    Get a specific first-aid case
// @access  Private
router.get("/:id", auth, async (req, res) => {
  try {
    const firstAid = await FirstAid.findById(req.params.id)
      .populate("createdBy", "name email employeeId")
      .populate("updatedBy", "name email employeeId");

    if (!firstAid) {
      return res.status(404).json({ message: "First-aid case not found" });
    }

    res.json({ data: firstAid });
  } catch (error) {
    console.error("Error fetching first-aid case:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   PUT /api/first-aid/:id
// @desc    Update a first-aid case
// @access  Private
router.put(
  "/:id",
  [
    auth,
    [
      body("status")
        .optional()
        .isIn(["draft", "reported", "investigated", "closed"]),
      body("transportToHospital")
        .optional()
        .isBoolean()
        .withMessage("Transport to hospital must be a boolean"),
      body("hospitalName")
        .optional()
        .custom((value, { req }) => {
          if (req.body.transportToHospital && (!value || value.trim().length === 0)) {
            throw new Error("Hospital name is required when victim was transported to hospital");
          }
          return true;
        }),
      body("hospitalDetails")
        .optional()
        .custom((value, { req }) => {
          if (req.body.transportToHospital && (!value || value.trim().length === 0)) {
            throw new Error("Hospital details are required when victim was transported to hospital");
          }
          return true;
        }),
      body("followUpRequired")
        .optional()
        .isBoolean()
        .withMessage("Follow-up required must be a boolean"),
      body("followUpDate")
        .optional()
        .isISO8601()
        .withMessage("Valid follow-up date is required"),
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
        victimContractor,
        injuryLocation,
        injuryDescription,
        severity,
        cause,
        treatment: treatmentGiven, // Map treatment to treatmentGiven
        treatedBy,
        injuryType,
        transportToHospital,
        hospitalName,
        hospitalDetails,
        witnessNames,
        investigationNotes,
        followUpRequired,
        followUpDate,
        followUpNotes,
      } = req.body;

      const firstAid = await FirstAid.findById(req.params.id);
      if (!firstAid) {
        return res.status(404).json({ message: "First-aid case not found" });
      }

      // Update fields
      if (victimContractor !== undefined) firstAid.victimContractor = victimContractor;
      if (injuryLocation !== undefined) firstAid.injuryLocation = injuryLocation;
      if (injuryDescription !== undefined) firstAid.injuryDescription = injuryDescription;
      if (severity) firstAid.severity = severity;
      if (cause !== undefined) firstAid.cause = cause;
      if (treatmentGiven !== undefined) firstAid.treatmentGiven = treatmentGiven;
      if (treatedBy !== undefined) firstAid.treatedBy = treatedBy;
      if (injuryType) firstAid.injuryType = injuryType;
      if (transportToHospital !== undefined)
        firstAid.transportToHospital = transportToHospital;
      if (hospitalName) firstAid.hospitalName = hospitalName;
      if (hospitalDetails) firstAid.hospitalDetails = hospitalDetails;
      if (witnessNames) {
        const validWitnessNames = witnessNames.filter(
          (name) => name && name.trim().length > 0
        );
        firstAid.witnessNames = validWitnessNames;
      }

      // Handle status changes
      if (status) {
        if (status === "investigated") {
          firstAid.investigate(investigationNotes || "");
        } else if (status === "closed") {
          firstAid.close(followUpNotes || "");
        } else {
          firstAid.status = status;
        }
      }

      // Handle follow-up scheduling
      if (followUpRequired !== undefined) {
        firstAid.followUpRequired = followUpRequired;
        if (followUpRequired && followUpDate) {
          firstAid.scheduleFollowUp(followUpDate, followUpNotes || "");
        }
      }

      firstAid.updatedBy = req.user.id;

      await firstAid.save();

      res.json({
        message: "First-aid case updated successfully",
        data: firstAid,
      });
    } catch (error) {
      console.error("Error updating first-aid case:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// @route   DELETE /api/first-aid/:id
// @desc    Delete a first-aid case
// @access  Private (Admin only)
router.delete("/:id", auth, async (req, res) => {
  try {
    const firstAid = await FirstAid.findById(req.params.id);
    if (!firstAid) {
      return res.status(404).json({ message: "First-aid case not found" });
    }

    // Check if user is admin or created the case
    if (
      req.user.role !== "admin" &&
      firstAid.createdBy.toString() !== req.user.id
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this first-aid case" });
    }

    await FirstAid.findByIdAndDelete(req.params.id);

    res.json({ message: "First-aid case deleted successfully" });
  } catch (error) {
    console.error("Error deleting first-aid case:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/first-aid/stats/overview
// @desc    Get first-aid case statistics
// @access  Private
router.get("/stats/overview", auth, async (req, res) => {
  try {
    const { projectId } = req.query;
    const filter = projectId ? { projectId } : {};

    const stats = await FirstAid.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          draft: {
            $sum: { $cond: [{ $eq: ["$status", "draft"] }, 1, 0] },
          },
          reported: {
            $sum: { $cond: [{ $eq: ["$status", "reported"] }, 1, 0] },
          },
          investigated: {
            $sum: { $cond: [{ $eq: ["$status", "investigated"] }, 1, 0] },
          },
          closed: {
            $sum: { $cond: [{ $eq: ["$status", "closed"] }, 1, 0] },
          },
          hospitalTransports: {
            $sum: { $cond: [{ $eq: ["$transportToHospital", true] }, 1, 0] },
          },
          followUpRequired: {
            $sum: { $cond: [{ $eq: ["$followUpRequired", true] }, 1, 0] },
          },
          followUpDue: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$followUpRequired", true] },
                    { $lte: ["$followUpDate", new Date()] },
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
    console.error("Error fetching first-aid statistics:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/first-aid/injury-types/popular
// @desc    Get most common injury types
// @access  Private
router.get("/injury-types/popular", auth, async (req, res) => {
  try {
    const { projectId, limit = 10 } = req.query;
    const filter = projectId ? { projectId } : {};

    const injuryStats = await FirstAid.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$injuryType",
          count: { $sum: 1 },
          hospitalTransports: {
            $sum: { $cond: [{ $eq: ["$transportToHospital", true] }, 1, 0] },
          },
          avgWitnessCount: { $avg: { $size: "$witnessNames" } },
        },
      },
      { $sort: { count: -1 } },
      { $limit: parseInt(limit) },
    ]);

    res.json({ data: injuryStats });
  } catch (error) {
    console.error("Error fetching injury type statistics:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/first-aid/follow-up/due
// @desc    Get cases with due follow-ups
// @access  Private
router.get("/follow-up/due", auth, async (req, res) => {
  try {
    const { projectId } = req.query;
    const filter = {
      followUpRequired: true,
      status: { $ne: "closed" },
      projectId: projectId || { $exists: true },
    };

    const now = new Date();
    filter.followUpDate = { $lte: now };

    const dueFollowUps = await FirstAid.find(filter)
      .populate("createdBy", "name email employeeId")
      .sort({ followUpDate: 1 });

    res.json({ data: dueFollowUps });
  } catch (error) {
    console.error("Error fetching due follow-ups:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
