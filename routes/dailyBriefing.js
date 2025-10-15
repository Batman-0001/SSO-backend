const express = require("express");
const { body, validationResult } = require("express-validator");
const DailyBriefing = require("../models/DailyBriefing");
const { auth } = require("../middleware/auth");

const router = express.Router();

// @route   POST /api/daily-briefing
// @desc    Create a new daily briefing record
// @access  Private
router.post(
  "/",
  [
    auth,
    [
      body("talkNumber").notEmpty().withMessage("Talk number is required"),
      body("dateTime")
        .isISO8601()
        .withMessage("Valid date and time is required"),
      body("location").notEmpty().withMessage("Location is required"),
      body("conductedBy").notEmpty().withMessage("Conducted by is required"),
      body("duration")
        .isIn(["15", "30", "45"])
        .withMessage("Valid duration is required"),
      body("topicCategory")
        .notEmpty()
        .withMessage("Topic category is required"),
      body("attendeesCount")
        .isInt({ min: 1 })
        .withMessage("Attendees count must be at least 1"),
      body("attendanceMethod")
        .isIn(["digital", "photo", "manual"])
        .withMessage("Valid attendance method is required"),
      body("keyPoints")
        .isArray({ min: 1 })
        .withMessage("At least one key point is required"),
      body("keyPoints.*").notEmpty().withMessage("Key points cannot be empty"),
      body("photos")
        .isArray({ min: 1 })
        .withMessage("At least one photo is required"),
      body("photos.*").notEmpty().withMessage("Photo URLs cannot be empty"),
    ],
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        talkNumber,
        dateTime,
        location,
        conductedBy,
        duration,
        topicCategory,
        customTopic,
        attendeesCount,
        attendanceMethod,
        digitalSignatures,
        attendancePhotos,
        attendeesList,
        keyPoints,
        hazardsDiscussed,
        controlMeasures,
        questionsRaised,
        photos,
        submittedAt,
      } = req.body;

      // Validate attendance method specific data
      if (
        attendanceMethod === "digital" &&
        (!digitalSignatures || digitalSignatures.length === 0)
      ) {
        return res.status(400).json({
          message:
            "Digital signatures are required when attendance method is digital",
        });
      }

      if (
        attendanceMethod === "photo" &&
        (!attendancePhotos || attendancePhotos.length === 0)
      ) {
        return res.status(400).json({
          message:
            "Attendance photos are required when attendance method is photo",
        });
      }

      if (
        attendanceMethod === "manual" &&
        (!attendeesList || attendeesList.trim().length === 0)
      ) {
        return res.status(400).json({
          message:
            "Attendees list is required when attendance method is manual",
        });
      }

      // Filter out empty key points
      const validKeyPoints = keyPoints.filter(
        (point) => point && point.trim().length > 0
      );

      if (validKeyPoints.length === 0) {
        return res.status(400).json({
          message: "At least one valid key point is required",
        });
      }

      const dailyBriefing = new DailyBriefing({
        talkNumber,
        dateTime: new Date(dateTime),
        location,
        conductedBy,
        duration,
        topicCategory,
        customTopic: topicCategory === "Custom Topic" ? customTopic : undefined,
        attendeesCount,
        attendanceMethod,
        digitalSignatures:
          attendanceMethod === "digital" ? digitalSignatures : undefined,
        attendancePhotos:
          attendanceMethod === "photo" ? attendancePhotos : undefined,
        attendeesList:
          attendanceMethod === "manual" ? attendeesList : undefined,
        keyPoints: validKeyPoints,
        hazardsDiscussed: hazardsDiscussed || "",
        controlMeasures: controlMeasures || "",
        questionsRaised: questionsRaised || "",
        photos,
        submittedAt: submittedAt ? new Date(submittedAt) : new Date(),
        createdBy: req.user.id,
      });

      await dailyBriefing.save();

      res.status(201).json({
        message: "Daily briefing created successfully",
        data: dailyBriefing,
      });
    } catch (error) {
      console.error("Error creating daily briefing:", error);

      // Handle duplicate talk number
      if (error.code === 11000) {
        return res.status(400).json({
          message: "Talk number already exists",
        });
      }

      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// @route   GET /api/daily-briefing
// @desc    Get all daily briefing records with filtering and pagination
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      location,
      topicCategory,
      conductedBy,
      status = "submitted",
      attendanceMethod,
      sortBy = "dateTime",
      sortOrder = "desc",
      dateFrom,
      dateTo,
    } = req.query;

    const filter = {};

    if (location) filter.location = new RegExp(location, "i");
    if (topicCategory) filter.topicCategory = topicCategory;
    if (conductedBy) filter.conductedBy = new RegExp(conductedBy, "i");
    if (status) filter.status = status;
    if (attendanceMethod) filter.attendanceMethod = attendanceMethod;

    // Date range filter
    if (dateFrom || dateTo) {
      filter.dateTime = {};
      if (dateFrom) filter.dateTime.$gte = new Date(dateFrom);
      if (dateTo) filter.dateTime.$lte = new Date(dateTo);
    }

    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const briefings = await DailyBriefing.find(filter)
      .populate("createdBy", "name email employeeId")
      .populate("updatedBy", "name email employeeId")
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await DailyBriefing.countDocuments(filter);

    res.json({
      data: briefings,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error("Error fetching daily briefings:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/daily-briefing/:id
// @desc    Get a specific daily briefing record
// @access  Private
router.get("/:id", auth, async (req, res) => {
  try {
    const briefing = await DailyBriefing.findById(req.params.id)
      .populate("createdBy", "name email employeeId")
      .populate("updatedBy", "name email employeeId");

    if (!briefing) {
      return res.status(404).json({ message: "Daily briefing not found" });
    }

    res.json({ data: briefing });
  } catch (error) {
    console.error("Error fetching daily briefing:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   PUT /api/daily-briefing/:id
// @desc    Update a daily briefing record
// @access  Private
router.put(
  "/:id",
  [
    auth,
    [
      body("status")
        .optional()
        .isIn(["draft", "submitted", "approved", "rejected"]),
      body("duration").optional().isIn(["15", "30", "45"]),
      body("attendeesCount").optional().isInt({ min: 1 }),
      body("keyPoints").optional().isArray({ min: 1 }),
      body("keyPoints.*").optional().notEmpty(),
      body("photos").optional().isArray({ min: 1 }),
      body("photos.*").optional().notEmpty(),
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
        hazardsDiscussed,
        controlMeasures,
        questionsRaised,
        photos,
        location,
        conductedBy,
        topicCategory,
        customTopic,
      } = req.body;

      const briefing = await DailyBriefing.findById(req.params.id);
      if (!briefing) {
        return res.status(404).json({ message: "Daily briefing not found" });
      }

      // Update fields
      if (status) briefing.status = status;
      if (duration) briefing.duration = duration;
      if (attendeesCount) briefing.attendeesCount = attendeesCount;
      if (location) briefing.location = location;
      if (conductedBy) briefing.conductedBy = conductedBy;
      if (topicCategory) {
        briefing.topicCategory = topicCategory;
        briefing.customTopic =
          topicCategory === "Custom Topic" ? customTopic : undefined;
      }
      if (hazardsDiscussed !== undefined)
        briefing.hazardsDiscussed = hazardsDiscussed;
      if (controlMeasures !== undefined)
        briefing.controlMeasures = controlMeasures;
      if (questionsRaised !== undefined)
        briefing.questionsRaised = questionsRaised;

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
        briefing.keyPoints = validKeyPoints;
      }

      // Handle photos update
      if (photos) {
        if (photos.length === 0) {
          return res.status(400).json({
            message: "At least one photo is required",
          });
        }
        briefing.photos = photos;
      }

      briefing.updatedBy = req.user.id;

      await briefing.save();

      res.json({
        message: "Daily briefing updated successfully",
        data: briefing,
      });
    } catch (error) {
      console.error("Error updating daily briefing:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// @route   DELETE /api/daily-briefing/:id
// @desc    Delete a daily briefing record
// @access  Private (Admin only)
router.delete("/:id", auth, async (req, res) => {
  try {
    const briefing = await DailyBriefing.findById(req.params.id);
    if (!briefing) {
      return res.status(404).json({ message: "Daily briefing not found" });
    }

    // Check if user is admin or created the briefing
    if (
      req.user.role !== "admin" &&
      briefing.createdBy.toString() !== req.user.id
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this briefing record" });
    }

    await DailyBriefing.findByIdAndDelete(req.params.id);

    res.json({ message: "Daily briefing deleted successfully" });
  } catch (error) {
    console.error("Error deleting daily briefing:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   POST /api/daily-briefing/generate-talk-number
// @desc    Generate a new talk number
// @access  Private
router.post("/generate-talk-number", auth, async (req, res) => {
  try {
    let talkNumber;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      talkNumber = DailyBriefing.generateTalkNumber();
      const existing = await DailyBriefing.findOne({ talkNumber });
      if (!existing) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return res.status(500).json({
        message: "Unable to generate unique talk number",
      });
    }

    res.json({
      talkNumber,
    });
  } catch (error) {
    console.error("Error generating talk number:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/daily-briefing/stats/overview
// @desc    Get daily briefing statistics
// @access  Private
router.get("/stats/overview", auth, async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;
    const filter = {};

    // Date range filter
    if (dateFrom || dateTo) {
      filter.dateTime = {};
      if (dateFrom) filter.dateTime.$gte = new Date(dateFrom);
      if (dateTo) filter.dateTime.$lte = new Date(dateTo);
    }

    const stats = await DailyBriefing.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          submitted: {
            $sum: { $cond: [{ $eq: ["$status", "submitted"] }, 1, 0] },
          },
          approved: {
            $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] },
          },
          rejected: {
            $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] },
          },
          totalAttendees: { $sum: "$attendeesCount" },
          totalDuration: { $sum: { $toInt: "$duration" } },
          avgDuration: { $avg: { $toInt: "$duration" } },
          totalKeyPoints: { $sum: { $size: "$keyPoints" } },
          totalPhotos: { $sum: { $size: "$photos" } },
        },
      },
    ]);

    // Get attendance method breakdown
    const attendanceStats = await DailyBriefing.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$attendanceMethod",
          count: { $sum: 1 },
        },
      },
    ]);

    // Get topic category breakdown
    const topicStats = await DailyBriefing.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$topicCategory",
          count: { $sum: 1 },
          totalAttendees: { $sum: "$attendeesCount" },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    res.json({
      data: {
        ...stats[0],
        attendanceMethods: attendanceStats,
        popularTopics: topicStats,
      },
    });
  } catch (error) {
    console.error("Error fetching daily briefing statistics:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/daily-briefing/topics/categories
// @desc    Get all available topic categories
// @access  Private
router.get("/topics/categories", auth, async (req, res) => {
  try {
    const topicCategories = [
      "Working at Height",
      "Electrical Safety",
      "Excavation Safety",
      "PPE Usage",
      "Manual Handling",
      "Hot Work Safety",
      "Confined Space Entry",
      "Scaffolding Safety",
      "Crane Operations",
      "Fall Protection",
      "Fire Safety",
      "Chemical Handling",
      "Machine Guarding",
      "Housekeeping",
      "Emergency Procedures",
      "Custom Topic",
    ];

    res.json({
      data: topicCategories,
    });
  } catch (error) {
    console.error("Error fetching topic categories:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/daily-briefing/attendance/methods
// @desc    Get all available attendance methods
// @access  Private
router.get("/attendance/methods", auth, async (req, res) => {
  try {
    const attendanceMethods = [
      {
        value: "digital",
        label: "Digital Signatures (Capture on mobile)",
        description: "Capture digital signatures from attendees",
      },
      {
        value: "photo",
        label: "Photo Upload (Group photo with workers)",
        description: "Upload group photo with workers",
      },
      {
        value: "manual",
        label: "Manual List (Names comma-separated)",
        description: "Enter names separated by commas",
      },
    ];

    res.json({
      data: attendanceMethods,
    });
  } catch (error) {
    console.error("Error fetching attendance methods:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   POST /api/daily-briefing/:id/approve
// @desc    Approve a daily briefing
// @access  Private (Admin/Manager)
router.post("/:id/approve", auth, async (req, res) => {
  try {
    const briefing = await DailyBriefing.findById(req.params.id);
    if (!briefing) {
      return res.status(404).json({ message: "Daily briefing not found" });
    }

    briefing.status = "approved";
    briefing.updatedBy = req.user.id;
    await briefing.save();

    res.json({
      message: "Daily briefing approved successfully",
      data: briefing,
    });
  } catch (error) {
    console.error("Error approving daily briefing:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   POST /api/daily-briefing/:id/reject
// @desc    Reject a daily briefing
// @access  Private (Admin/Manager)
router.post("/:id/reject", auth, async (req, res) => {
  try {
    const { reason } = req.body;

    const briefing = await DailyBriefing.findById(req.params.id);
    if (!briefing) {
      return res.status(404).json({ message: "Daily briefing not found" });
    }

    briefing.status = "rejected";
    briefing.rejectionReason = reason;
    briefing.updatedBy = req.user.id;
    await briefing.save();

    res.json({
      message: "Daily briefing rejected successfully",
      data: briefing,
    });
  } catch (error) {
    console.error("Error rejecting daily briefing:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
