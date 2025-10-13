const express = require("express");
const { body, validationResult } = require("express-validator");
const InductionTraining = require("../models/InductionTraining");
const auth = require("../middleware/auth");

const router = express.Router();

// @route   POST /api/induction-training
// @desc    Create a new induction training record
// @access  Private
router.post(
  "/",
  [
    auth,
    [
      body("projectId").notEmpty().withMessage("Project ID is required"),
      body("trainingDate")
        .isISO8601()
        .withMessage("Valid training date is required"),
      body("duration")
        .isInt({ min: 1 })
        .withMessage("Duration must be at least 1 minute"),
      body("trainerName").notEmpty().withMessage("Trainer name is required"),
      body("attendanceCount")
        .isInt({ min: 0 })
        .withMessage("Attendance count must be a non-negative number"),
      body("attendees").isArray().withMessage("Attendees must be an array"),
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
        trainingDate,
        duration,
        contractor,
        trainerName,
        attendanceCount,
        attendees = [],
        notes = "",
        photos = [],
      } = req.body;

      // Validate attendance count matches attendees array
      if (attendanceCount !== attendees.length) {
        return res.status(400).json({
          message:
            "Attendance count must match the number of attendees in the list",
        });
      }

      const inductionTraining = new InductionTraining({
        projectId,
        trainingDate: new Date(trainingDate),
        duration,
        contractor,
        trainerName,
        attendanceCount,
        attendees,
        notes,
        photos,
        createdBy: req.user.id,
      });

      await inductionTraining.save();

      res.status(201).json({
        message: "Induction training created successfully",
        data: inductionTraining,
      });
    } catch (error) {
      console.error("Error creating induction training:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// @route   GET /api/induction-training
// @desc    Get all induction training records with filtering and pagination
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      projectId,
      contractor,
      trainerName,
      status = "completed",
      sortBy = "trainingDate",
      sortOrder = "desc",
    } = req.query;

    const filter = {};
    if (projectId) filter.projectId = projectId;
    if (contractor) filter.contractor = contractor;
    if (trainerName) filter.trainerName = new RegExp(trainerName, "i");
    if (status) filter.status = status;

    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const trainings = await InductionTraining.find(filter)
      .populate("createdBy", "name email employeeId")
      .populate("updatedBy", "name email employeeId")
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await InductionTraining.countDocuments(filter);

    res.json({
      data: trainings,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error("Error fetching induction trainings:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/induction-training/:id
// @desc    Get a specific induction training record
// @access  Private
router.get("/:id", auth, async (req, res) => {
  try {
    const training = await InductionTraining.findById(req.params.id)
      .populate("createdBy", "name email employeeId")
      .populate("updatedBy", "name email employeeId");

    if (!training) {
      return res.status(404).json({ message: "Induction training not found" });
    }

    res.json({ data: training });
  } catch (error) {
    console.error("Error fetching induction training:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   PUT /api/induction-training/:id
// @desc    Update an induction training record
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
      body("attendanceCount")
        .optional()
        .isInt({ min: 0 })
        .withMessage("Attendance count must be a non-negative number"),
    ],
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { status, duration, attendanceCount, attendees, notes } = req.body;

      const training = await InductionTraining.findById(req.params.id);
      if (!training) {
        return res
          .status(404)
          .json({ message: "Induction training not found" });
      }

      // Update fields
      if (status) training.status = status;
      if (duration) training.duration = duration;
      if (attendanceCount !== undefined)
        training.attendanceCount = attendanceCount;
      if (attendees) training.attendees = attendees;
      if (notes !== undefined) training.notes = notes;

      // Validate attendance count if attendees are updated
      if (attendees && training.attendanceCount !== attendees.length) {
        return res.status(400).json({
          message:
            "Attendance count must match the number of attendees in the list",
        });
      }

      training.updatedBy = req.user.id;

      await training.save();

      res.json({
        message: "Induction training updated successfully",
        data: training,
      });
    } catch (error) {
      console.error("Error updating induction training:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// @route   DELETE /api/induction-training/:id
// @desc    Delete an induction training record
// @access  Private (Admin only)
router.delete("/:id", auth, async (req, res) => {
  try {
    const training = await InductionTraining.findById(req.params.id);
    if (!training) {
      return res.status(404).json({ message: "Induction training not found" });
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

    await InductionTraining.findByIdAndDelete(req.params.id);

    res.json({ message: "Induction training deleted successfully" });
  } catch (error) {
    console.error("Error deleting induction training:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/induction-training/stats/overview
// @desc    Get induction training statistics
// @access  Private
router.get("/stats/overview", auth, async (req, res) => {
  try {
    const { projectId } = req.query;
    const filter = projectId ? { projectId } : {};

    const stats = await InductionTraining.aggregate([
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
          totalAttendees: { $sum: "$attendanceCount" },
          totalDuration: { $sum: "$duration" },
          avgDuration: { $avg: "$duration" },
        },
      },
    ]);

    res.json({ data: stats[0] || {} });
  } catch (error) {
    console.error("Error fetching induction training statistics:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
