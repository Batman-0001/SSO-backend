const express = require("express");
const { body, validationResult } = require("express-validator");
const SpecialTraining = require("../models/SpecialTraining");
const { auth } = require("../middleware/auth");

const router = express.Router();

// @route   POST /api/special-training
// @desc    Create a new special training record
// @access  Private
router.post(
  "/",
  [
    auth,
    [
      body("projectId").notEmpty().withMessage("Project ID is required"),
      body("date").isISO8601().withMessage("Valid training date is required"),
      body("topic").notEmpty().withMessage("Topic is required"),
      body("duration")
        .isInt({ min: 1 })
        .withMessage("Duration must be at least 1 minute"),
      body("trainer").notEmpty().withMessage("Trainer name is required"),
      body("attendeesCount")
        .isInt({ min: 0 })
        .withMessage("Attendees count must be a non-negative number"),
      body("keyPoints")
        .isArray({ min: 1 })
        .withMessage("At least one key point is required"),
      body("keyPoints.*").notEmpty().withMessage("Key points cannot be empty"),
      body("certificationsIssued")
        .optional()
        .isBoolean()
        .withMessage("Certifications issued must be a boolean"),
      body("permitRequired")
        .optional()
        .isBoolean()
        .withMessage("Permit required must be a boolean"),
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
        topic,
        duration,
        trainer,
        attendeesCount,
        keyPoints = [],
        certificationsIssued = false,
        permitRequired = false,
        photos = [],
        status = "completed",
      } = req.body;

      // Filter out empty key points
      const validKeyPoints = keyPoints.filter(
        (point) => point && point.trim().length > 0
      );

      // Determine final status based on completeness
      let finalStatus = status;
      if (validKeyPoints.length === 0) {
        finalStatus = "draft";
      }

      const specialTraining = new SpecialTraining({
        projectId,
        date: new Date(date),
        topic,
        duration,
        trainer,
        attendeesCount,
        keyPoints: validKeyPoints,
        certificationsIssued,
        permitRequired,
        photos,
        status: finalStatus,
        createdBy: req.user.id,
      });

      await specialTraining.save();

      let responseMessage =
        finalStatus === "draft"
          ? "Special training saved as draft"
          : "Special training submitted successfully";

      res.status(201).json({
        message: responseMessage,
        data: specialTraining,
        status: finalStatus,
      });
    } catch (error) {
      console.error("Error creating special training:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// @route   POST /api/special-training/save-draft
// @desc    Save special training as draft
// @access  Private
router.post(
  "/save-draft",
  [
    auth,
    [
      body("projectId").notEmpty().withMessage("Project ID is required"),
      body("date").isISO8601().withMessage("Valid training date is required"),
      body("topic").notEmpty().withMessage("Topic is required"),
      body("duration")
        .isInt({ min: 1 })
        .withMessage("Duration must be at least 1 minute"),
      body("trainer").notEmpty().withMessage("Trainer name is required"),
      body("attendeesCount")
        .isInt({ min: 0 })
        .withMessage("Attendees count must be a non-negative number"),
      body("certificationsIssued")
        .optional()
        .isBoolean()
        .withMessage("Certifications issued must be a boolean"),
      body("permitRequired")
        .optional()
        .isBoolean()
        .withMessage("Permit required must be a boolean"),
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
        topic,
        duration,
        trainer,
        attendeesCount,
        keyPoints = [],
        certificationsIssued = false,
        permitRequired = false,
        photos = [],
      } = req.body;

      // Filter out empty key points
      const validKeyPoints = keyPoints.filter(
        (point) => point && point.trim().length > 0
      );

      const specialTraining = new SpecialTraining({
        projectId,
        date: new Date(date),
        topic,
        duration,
        trainer,
        attendeesCount,
        keyPoints: validKeyPoints,
        certificationsIssued,
        permitRequired,
        photos,
        status: "draft",
        createdBy: req.user.id,
      });

      await specialTraining.save();

      res.status(201).json({
        message: "Special training saved as draft",
        data: specialTraining,
      });
    } catch (error) {
      console.error("Error saving special training draft:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// @route   GET /api/special-training
// @desc    Get all special training records with filtering and pagination
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      projectId,
      topic,
      trainer,
      status = "completed",
      certificationsIssued,
      permitRequired,
      sortBy = "date",
      sortOrder = "desc",
    } = req.query;

    const filter = {};
    if (projectId) filter.projectId = projectId;
    if (topic) filter.topic = new RegExp(topic, "i");
    if (trainer) filter.trainer = new RegExp(trainer, "i");
    if (status) filter.status = status;
    if (certificationsIssued !== undefined)
      filter.certificationsIssued = certificationsIssued === "true";
    if (permitRequired !== undefined)
      filter.permitRequired = permitRequired === "true";

    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const trainings = await SpecialTraining.find(filter)
      .populate("createdBy", "name email employeeId")
      .populate("updatedBy", "name email employeeId")
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await SpecialTraining.countDocuments(filter);

    res.json({
      data: trainings,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error("Error fetching special trainings:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/special-training/:id
// @desc    Get a specific special training record
// @access  Private
router.get("/:id", auth, async (req, res) => {
  try {
    const training = await SpecialTraining.findById(req.params.id)
      .populate("createdBy", "name email employeeId")
      .populate("updatedBy", "name email employeeId");

    if (!training) {
      return res.status(404).json({ message: "Special training not found" });
    }

    res.json({ data: training });
  } catch (error) {
    console.error("Error fetching special training:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   PUT /api/special-training/:id
// @desc    Update a special training record
// @access  Private
router.put(
  "/:id",
  [
    auth,
    [
      body("status").optional().isIn(["scheduled", "completed", "cancelled"]),
      body("duration")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Duration must be at least 1 minute"),
      body("attendeesCount")
        .optional()
        .isInt({ min: 0 })
        .withMessage("Attendees count must be a non-negative number"),
      body("keyPoints")
        .optional()
        .isArray({ min: 1 })
        .withMessage("At least one key point is required"),
      body("keyPoints.*")
        .optional()
        .notEmpty()
        .withMessage("Key points cannot be empty"),
      body("certificationsIssued")
        .optional()
        .isBoolean()
        .withMessage("Certifications issued must be a boolean"),
      body("permitRequired")
        .optional()
        .isBoolean()
        .withMessage("Permit required must be a boolean"),
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
        duration,
        attendeesCount,
        keyPoints,
        topic,
        trainer,
        certificationsIssued,
        permitRequired,
      } = req.body;

      const training = await SpecialTraining.findById(req.params.id);
      if (!training) {
        return res.status(404).json({ message: "Special training not found" });
      }

      // Update fields
      if (status) training.status = status;
      if (duration) training.duration = duration;
      if (attendeesCount !== undefined)
        training.attendeesCount = attendeesCount;
      if (topic) training.topic = topic;
      if (trainer) training.trainer = trainer;
      if (certificationsIssued !== undefined)
        training.certificationsIssued = certificationsIssued;
      if (permitRequired !== undefined)
        training.permitRequired = permitRequired;

      // Handle key points update
      if (keyPoints) {
        const validKeyPoints = keyPoints.filter(
          (point) => point && point.trim().length > 0
        );
        if (validKeyPoints.length === 0) {
          return res.status(400).json({
            message: "At least one valid key point is required",
          });
        }
        training.keyPoints = validKeyPoints;
      }

      training.updatedBy = req.user.id;

      await training.save();

      res.json({
        message: "Special training updated successfully",
        data: training,
      });
    } catch (error) {
      console.error("Error updating special training:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// @route   DELETE /api/special-training/:id
// @desc    Delete a special training record
// @access  Private (Admin only)
router.delete("/:id", auth, async (req, res) => {
  try {
    const training = await SpecialTraining.findById(req.params.id);
    if (!training) {
      return res.status(404).json({ message: "Special training not found" });
    }

    // Check if user is admin or created the training
    if (
      req.user.role !== "admin" &&
      training.createdBy.toString() !== req.user.id
    ) {
      return res.status(403).json({
        message: "Not authorized to delete this special training record",
      });
    }

    await SpecialTraining.findByIdAndDelete(req.params.id);

    res.json({ message: "Special training deleted successfully" });
  } catch (error) {
    console.error("Error deleting special training:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/special-training/stats/overview
// @desc    Get special training statistics
// @access  Private
router.get("/stats/overview", auth, async (req, res) => {
  try {
    const { projectId } = req.query;
    const filter = projectId ? { projectId } : {};

    const stats = await SpecialTraining.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          draft: {
            $sum: { $cond: [{ $eq: ["$status", "draft"] }, 1, 0] },
          },
          scheduled: {
            $sum: { $cond: [{ $eq: ["$status", "scheduled"] }, 1, 0] },
          },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
          cancelled: {
            $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
          },
          totalAttendees: { $sum: "$attendeesCount" },
          totalDuration: { $sum: "$duration" },
          avgDuration: { $avg: "$duration" },
          totalKeyPoints: { $sum: { $size: "$keyPoints" } },
          certificationTrainings: {
            $sum: { $cond: [{ $eq: ["$certificationsIssued", true] }, 1, 0] },
          },
          permitRequiredTrainings: {
            $sum: { $cond: [{ $eq: ["$permitRequired", true] }, 1, 0] },
          },
        },
      },
    ]);

    res.json({ data: stats[0] || {} });
  } catch (error) {
    console.error("Error fetching special training statistics:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/special-training/topics/popular
// @desc    Get most popular special training topics
// @access  Private
router.get("/topics/popular", auth, async (req, res) => {
  try {
    const { projectId, limit = 10 } = req.query;
    const filter = projectId ? { projectId } : {};

    const popularTopics = await SpecialTraining.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$topic",
          count: { $sum: 1 },
          totalAttendees: { $sum: "$attendeesCount" },
          avgDuration: { $avg: "$duration" },
          certificationRate: {
            $avg: { $cond: [{ $eq: ["$certificationsIssued", true] }, 1, 0] },
          },
          permitRequiredRate: {
            $avg: { $cond: [{ $eq: ["$permitRequired", true] }, 1, 0] },
          },
        },
      },
      { $sort: { count: -1 } },
      { $limit: parseInt(limit) },
    ]);

    res.json({ data: popularTopics });
  } catch (error) {
    console.error("Error fetching popular special training topics:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/special-training/certifications/summary
// @desc    Get certification training summary
// @access  Private
router.get("/certifications/summary", auth, async (req, res) => {
  try {
    const { projectId } = req.query;
    const filter = projectId ? { projectId } : {};

    const certificationStats = await SpecialTraining.aggregate([
      { $match: { ...filter, certificationsIssued: true } },
      {
        $group: {
          _id: null,
          totalCertificationTrainings: { $sum: 1 },
          totalCertifiedAttendees: { $sum: "$attendeesCount" },
          avgCertificationDuration: { $avg: "$duration" },
          topics: { $addToSet: "$topic" },
        },
      },
    ]);

    res.json({ data: certificationStats[0] || {} });
  } catch (error) {
    console.error("Error fetching certification summary:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
