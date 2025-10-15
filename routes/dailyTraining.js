const express = require("express");
const { body, validationResult } = require("express-validator");
const DailyTraining = require("../models/DailyTraining");
const { auth } = require("../middleware/auth");

const router = express.Router();

// @route   POST /api/daily-training
// @desc    Create a new daily training record
// @access  Private
router.post(
  "/",
  [
    auth,
    [
      body("projectId").notEmpty().withMessage("Project ID is required"),
      body("date").isISO8601().withMessage("Valid training date is required"),
      body("topic").optional().notEmpty().withMessage("Topic is required"),
      body("duration")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Duration must be at least 1 minute"),
      body("trainer")
        .optional()
        .notEmpty()
        .withMessage("Trainer name is required"),
      body("attendeesCount")
        .optional()
        .isInt({ min: 0 })
        .withMessage("Attendees count must be a non-negative number"),
      body("keyPoints")
        .optional()
        .isArray()
        .withMessage("Key points must be an array"),
      body("keyPoints.*")
        .optional()
        .notEmpty()
        .withMessage("Key points cannot be empty"),
      body("photos")
        .optional()
        .isArray()
        .withMessage("Photos must be an array"),
      body("status")
        .optional()
        .isIn(["draft", "scheduled", "completed"])
        .withMessage("Status must be draft, scheduled, or completed"),
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
        photos = [],
        status = "draft",
      } = req.body;

      // Determine status based on completeness for automatic submission
      let finalStatus = status;
      if (
        status === "completed" ||
        (topic && duration && trainer && attendeesCount)
      ) {
        finalStatus = "completed";
      }

      // Filter out empty key points
      const validKeyPoints = keyPoints.filter(
        (point) => point && point.trim().length > 0
      );

      // Validate key points for submitted trainings
      if (finalStatus === "completed" && validKeyPoints.length === 0) {
        return res.status(400).json({
          message: "At least one valid key point is required",
        });
      }

      const dailyTraining = new DailyTraining({
        projectId,
        date: new Date(date),
        topic: topic || "",
        duration: duration || 0,
        trainer: trainer || "",
        attendeesCount: attendeesCount || 0,
        keyPoints: validKeyPoints,
        photos,
        status: finalStatus,
        createdBy: req.user.id,
      });

      await dailyTraining.save();

      res.status(201).json({
        message:
          finalStatus === "draft"
            ? "Daily training saved as draft"
            : "Daily training submitted successfully",
        data: dailyTraining,
      });
    } catch (error) {
      console.error("Error creating daily training:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// @route   POST /api/daily-training/save-draft
// @desc    Save daily training as draft (minimal validation)
// @access  Private
router.post(
  "/save-draft",
  [
    auth,
    [
      body("projectId").notEmpty().withMessage("Project ID is required"),
      body("date").isISO8601().withMessage("Valid training date is required"),
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
        topic = "",
        duration = 0,
        trainer = "",
        attendeesCount = 0,
        keyPoints = [],
        photos = [],
      } = req.body;

      const dailyTraining = new DailyTraining({
        projectId,
        date: new Date(date),
        topic,
        duration,
        trainer,
        attendeesCount,
        keyPoints,
        photos,
        status: "draft",
        createdBy: req.user.id,
      });

      await dailyTraining.save();

      res.status(201).json({
        message: "Draft saved successfully",
        data: dailyTraining,
      });
    } catch (error) {
      console.error("Error saving daily training draft:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// @route   GET /api/daily-training
// @desc    Get all daily training records with filtering and pagination
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      projectId,
      topic,
      trainer,
      status,
      sortBy = "date",
      sortOrder = "desc",
    } = req.query;

    const filter = {};
    if (projectId) filter.projectId = projectId;
    if (topic) filter.topic = new RegExp(topic, "i");
    if (trainer) filter.trainer = new RegExp(trainer, "i");
    if (status) filter.status = status;

    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const trainings = await DailyTraining.find(filter)
      .populate("createdBy", "name email employeeId")
      .populate("updatedBy", "name email employeeId")
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await DailyTraining.countDocuments(filter);

    res.json({
      data: trainings,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error("Error fetching daily trainings:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/daily-training/:id
// @desc    Get a specific daily training record
// @access  Private
router.get("/:id", auth, async (req, res) => {
  try {
    const training = await DailyTraining.findById(req.params.id)
      .populate("createdBy", "name email employeeId")
      .populate("updatedBy", "name email employeeId");

    if (!training) {
      return res.status(404).json({ message: "Daily training not found" });
    }

    res.json({ data: training });
  } catch (error) {
    console.error("Error fetching daily training:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   PUT /api/daily-training/:id
// @desc    Update a daily training record
// @access  Private
router.put(
  "/:id",
  [
    auth,
    [
      body("status")
        .optional()
        .isIn(["draft", "scheduled", "completed", "cancelled"]),
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
    ],
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { status, duration, attendeesCount, keyPoints, topic, trainer } =
        req.body;

      const training = await DailyTraining.findById(req.params.id);
      if (!training) {
        return res.status(404).json({ message: "Daily training not found" });
      }

      // Update fields
      if (status) training.status = status;
      if (duration) training.duration = duration;
      if (attendeesCount !== undefined)
        training.attendeesCount = attendeesCount;
      if (topic) training.topic = topic;
      if (trainer) training.trainer = trainer;

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
        message: "Daily training updated successfully",
        data: training,
      });
    } catch (error) {
      console.error("Error updating daily training:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// @route   DELETE /api/daily-training/:id
// @desc    Delete a daily training record
// @access  Private (Admin only)
router.delete("/:id", auth, async (req, res) => {
  try {
    const training = await DailyTraining.findById(req.params.id);
    if (!training) {
      return res.status(404).json({ message: "Daily training not found" });
    }

    // Check if user is admin or created the training
    if (
      req.user.role !== "admin" &&
      training.createdBy.toString() !== req.user.id
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this training record" });
    }

    await DailyTraining.findByIdAndDelete(req.params.id);

    res.json({ message: "Daily training deleted successfully" });
  } catch (error) {
    console.error("Error deleting daily training:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/daily-training/stats/overview
// @desc    Get daily training statistics
// @access  Private
router.get("/stats/overview", auth, async (req, res) => {
  try {
    const { projectId } = req.query;
    const filter = projectId ? { projectId } : {};

    const stats = await DailyTraining.aggregate([
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
        },
      },
    ]);

    res.json({ data: stats[0] || {} });
  } catch (error) {
    console.error("Error fetching daily training statistics:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/daily-training/topics/popular
// @desc    Get most popular training topics
// @access  Private
router.get("/topics/popular", auth, async (req, res) => {
  try {
    const { projectId, limit = 10 } = req.query;
    const filter = projectId ? { projectId } : {};

    const popularTopics = await DailyTraining.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$topic",
          count: { $sum: 1 },
          totalAttendees: { $sum: "$attendeesCount" },
          avgDuration: { $avg: "$duration" },
        },
      },
      { $sort: { count: -1 } },
      { $limit: parseInt(limit) },
    ]);

    res.json({ data: popularTopics });
  } catch (error) {
    console.error("Error fetching popular topics:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
