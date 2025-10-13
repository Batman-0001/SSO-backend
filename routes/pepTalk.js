const express = require("express");
const { body, validationResult } = require("express-validator");
const PEPTalk = require("../models/PEPTalk");
const { auth } = require("../middleware/auth");

const router = express.Router();

// @route   POST /api/pep-talk
// @desc    Create a new PEP talk record
// @access  Private
router.post(
  "/",
  [
    auth,
    [
      body("projectId").notEmpty().withMessage("Project ID is required"),
      body("date").isISO8601().withMessage("Valid PEP talk date is required"),
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
        photos = [],
      } = req.body;

      // Filter out empty key points
      const validKeyPoints = keyPoints.filter(
        (point) => point && point.trim().length > 0
      );

      if (validKeyPoints.length === 0) {
        return res.status(400).json({
          message: "At least one valid key point is required",
        });
      }

      const pepTalk = new PEPTalk({
        projectId,
        date: new Date(date),
        topic,
        duration,
        trainer,
        attendeesCount,
        keyPoints: validKeyPoints,
        photos,
        createdBy: req.user.id,
      });

      await pepTalk.save();

      res.status(201).json({
        message: "PEP talk created successfully",
        data: pepTalk,
      });
    } catch (error) {
      console.error("Error creating PEP talk:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// @route   GET /api/pep-talk
// @desc    Get all PEP talk records with filtering and pagination
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

    const pepTalks = await PEPTalk.find(filter)
      .populate("createdBy", "name email employeeId")
      .populate("updatedBy", "name email employeeId")
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await PEPTalk.countDocuments(filter);

    res.json({
      data: pepTalks,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error("Error fetching PEP talks:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/pep-talk/:id
// @desc    Get a specific PEP talk record
// @access  Private
router.get("/:id", auth, async (req, res) => {
  try {
    const pepTalk = await PEPTalk.findById(req.params.id)
      .populate("createdBy", "name email employeeId")
      .populate("updatedBy", "name email employeeId");

    if (!pepTalk) {
      return res.status(404).json({ message: "PEP talk not found" });
    }

    res.json({ data: pepTalk });
  } catch (error) {
    console.error("Error fetching PEP talk:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   PUT /api/pep-talk/:id
// @desc    Update a PEP talk record
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

      const pepTalk = await PEPTalk.findById(req.params.id);
      if (!pepTalk) {
        return res.status(404).json({ message: "PEP talk not found" });
      }

      // Update fields
      if (status) pepTalk.status = status;
      if (duration) pepTalk.duration = duration;
      if (attendeesCount !== undefined) pepTalk.attendeesCount = attendeesCount;
      if (topic) pepTalk.topic = topic;
      if (trainer) pepTalk.trainer = trainer;

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
        pepTalk.keyPoints = validKeyPoints;
      }

      pepTalk.updatedBy = req.user.id;

      await pepTalk.save();

      res.json({
        message: "PEP talk updated successfully",
        data: pepTalk,
      });
    } catch (error) {
      console.error("Error updating PEP talk:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// @route   DELETE /api/pep-talk/:id
// @desc    Delete a PEP talk record
// @access  Private (Admin only)
router.delete("/:id", auth, async (req, res) => {
  try {
    const pepTalk = await PEPTalk.findById(req.params.id);
    if (!pepTalk) {
      return res.status(404).json({ message: "PEP talk not found" });
    }

    // Check if user is admin or created the talk
    if (
      req.user.role !== "admin" &&
      pepTalk.createdBy.toString() !== req.user.id
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this PEP talk record" });
    }

    await PEPTalk.findByIdAndDelete(req.params.id);

    res.json({ message: "PEP talk deleted successfully" });
  } catch (error) {
    console.error("Error deleting PEP talk:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/pep-talk/stats/overview
// @desc    Get PEP talk statistics
// @access  Private
router.get("/stats/overview", auth, async (req, res) => {
  try {
    const { projectId } = req.query;
    const filter = projectId ? { projectId } : {};

    const stats = await PEPTalk.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
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
    console.error("Error fetching PEP talk statistics:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/pep-talk/topics/popular
// @desc    Get most popular PEP talk topics
// @access  Private
router.get("/topics/popular", auth, async (req, res) => {
  try {
    const { projectId, limit = 10 } = req.query;
    const filter = projectId ? { projectId } : {};

    const popularTopics = await PEPTalk.aggregate([
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
    console.error("Error fetching popular PEP talk topics:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
