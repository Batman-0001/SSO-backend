const express = require("express");
const { body, validationResult } = require("express-validator");
const SICMeeting = require("../models/SICMeeting");
const { auth } = require("../middleware/auth");

const router = express.Router();

// @route   POST /api/sic-meeting
// @desc    Create a new SIC meeting
// @access  Private
router.post(
  "/",
  [
    auth,
    [
      body("projectId").notEmpty().withMessage("Project ID is required"),
      body("meetingDateTime")
        .isISO8601()
        .withMessage("Valid meeting date and time is required"),
      body("attendees")
        .isArray({ min: 1 })
        .withMessage("At least one attendee is required"),
      body("decisions").notEmpty().withMessage("Decisions are required"),
      body("sicSignature").notEmpty().withMessage("SIC signature is required"),
      body("agendaPoints")
        .optional()
        .isArray()
        .withMessage("Agenda points must be an array"),
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
        meetingDateTime,
        attendees,
        agendaPoints = [],
        decisions,
        actionOwners = "",
        photos = [],
        sicSignature,
        meetingType = "daily",
        location = "",
        meetingDuration = 0,
        nextMeetingDate,
        followUpRequired = false,
        followUpNotes = "",
        actionItems = [],
        status = "completed",
      } = req.body;

      // Filter out empty agenda points
      const validAgendaPoints = agendaPoints.filter(
        (point) => point && point.trim().length > 0
      );

      // Validate attendees only for completed status
      if (status === "completed" && (!attendees || attendees.length === 0)) {
        return res.status(400).json({
          message: "At least one attendee is required",
        });
      }

      // Validate action items if provided
      if (actionItems && actionItems.length > 0) {
        for (let i = 0; i < actionItems.length; i++) {
          const item = actionItems[i];
          if (!item.description || !item.owner || !item.deadline) {
            return res.status(400).json({
              message: `Action item ${
                i + 1
              } is missing required fields (description, owner, deadline)`,
            });
          }
        }
      }

      const sicMeeting = new SICMeeting({
        projectId,
        meetingDateTime: new Date(meetingDateTime),
        attendees,
        agendaPoints: validAgendaPoints,
        decisions,
        actionOwners,
        photos,
        sicSignature,
        meetingType,
        location,
        meetingDuration,
        nextMeetingDate: nextMeetingDate
          ? new Date(nextMeetingDate)
          : undefined,
        followUpRequired,
        followUpNotes,
        actionItems,
        status,
        createdBy: req.user.id,
      });

      await sicMeeting.save();

      let responseMessage =
        status === "draft"
          ? "SIC meeting saved as draft"
          : "SIC meeting submitted successfully";

      res.status(201).json({
        message: responseMessage,
        data: sicMeeting,
        status,
      });
    } catch (error) {
      console.error("Error creating SIC meeting:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// @route   POST /api/sic-meeting/save-draft
// @desc    Save SIC meeting as draft
// @access  Private
router.post(
  "/save-draft",
  [
    auth,
    [
      body("projectId").notEmpty().withMessage("Project ID is required"),
      body("meetingDateTime")
        .isISO8601()
        .withMessage("Valid meeting date and time is required"),
      body("agendaPoints")
        .optional()
        .isArray()
        .withMessage("Agenda points must be an array"),
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
        meetingDateTime,
        attendees = [],
        agendaPoints = [],
        decisions = "",
        actionOwners = "",
        photos = [],
        sicSignature = "",
      } = req.body;

      // Filter out empty agenda points
      const validAgendaPoints = agendaPoints.filter(
        (point) => point && point.trim().length > 0
      );

      const sicMeeting = new SICMeeting({
        projectId,
        meetingDateTime: new Date(meetingDateTime),
        attendees,
        agendaPoints: validAgendaPoints,
        decisions,
        actionOwners,
        photos,
        sicSignature,
        status: "draft",
        createdBy: req.user.id,
      });

      await sicMeeting.save();

      res.status(201).json({
        message: "SIC meeting saved as draft",
        data: sicMeeting,
      });
    } catch (error) {
      console.error("Error saving SIC meeting draft:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// @route   GET /api/sic-meeting
// @desc    Get all SIC meetings with filtering and pagination
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      projectId,
      meetingType,
      status,
      sortBy = "meetingDateTime",
      sortOrder = "desc",
    } = req.query;

    const filter = {};
    if (projectId) filter.projectId = projectId;
    if (meetingType) filter.meetingType = meetingType;
    if (status) filter.status = status;

    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const sicMeetings = await SICMeeting.find(filter)
      .populate("createdBy", "name email employeeId")
      .populate("updatedBy", "name email employeeId")
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await SICMeeting.countDocuments(filter);

    res.json({
      data: sicMeetings,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error("Error fetching SIC meetings:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/sic-meeting/:id
// @desc    Get a specific SIC meeting
// @access  Private
router.get("/:id", auth, async (req, res) => {
  try {
    const sicMeeting = await SICMeeting.findById(req.params.id)
      .populate("createdBy", "name email employeeId")
      .populate("updatedBy", "name email employeeId");

    if (!sicMeeting) {
      return res.status(404).json({ message: "SIC meeting not found" });
    }

    res.json({ data: sicMeeting });
  } catch (error) {
    console.error("Error fetching SIC meeting:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   PUT /api/sic-meeting/:id
// @desc    Update a SIC meeting
// @access  Private
router.put(
  "/:id",
  [
    auth,
    [
      body("status").optional().isIn(["draft", "completed", "archived"]),
      body("meetingType")
        .optional()
        .isIn(["daily", "weekly", "monthly", "special", "emergency"]),
      body("nextMeetingDate")
        .optional()
        .isISO8601()
        .withMessage("Valid next meeting date is required"),
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
        meetingType,
        location,
        meetingDuration,
        nextMeetingDate,
        followUpRequired,
        followUpNotes,
        actionItems,
        agendaPoints,
        decisions,
        actionOwners,
      } = req.body;

      const sicMeeting = await SICMeeting.findById(req.params.id);
      if (!sicMeeting) {
        return res.status(404).json({ message: "SIC meeting not found" });
      }

      // Update fields
      if (status) sicMeeting.status = status;
      if (meetingType) sicMeeting.meetingType = meetingType;
      if (location) sicMeeting.location = location;
      if (meetingDuration !== undefined)
        sicMeeting.meetingDuration = meetingDuration;
      if (decisions) sicMeeting.decisions = decisions;
      if (actionOwners) sicMeeting.actionOwners = actionOwners;

      // Handle agenda points
      if (agendaPoints) {
        const validAgendaPoints = agendaPoints.filter(
          (point) => point && point.trim().length > 0
        );
        sicMeeting.agendaPoints = validAgendaPoints;
      }

      // Handle follow-up scheduling
      if (followUpRequired !== undefined) {
        sicMeeting.followUpRequired = followUpRequired;
        if (followUpRequired && nextMeetingDate) {
          sicMeeting.scheduleFollowUp(nextMeetingDate, followUpNotes || "");
        }
      }

      // Handle action items
      if (actionItems) {
        // Validate action items
        for (let i = 0; i < actionItems.length; i++) {
          const item = actionItems[i];
          if (!item.description || !item.owner || !item.deadline) {
            return res.status(400).json({
              message: `Action item ${
                i + 1
              } is missing required fields (description, owner, deadline)`,
            });
          }
        }
        sicMeeting.actionItems = actionItems;
      }

      sicMeeting.updatedBy = req.user.id;

      await sicMeeting.save();

      res.json({
        message: "SIC meeting updated successfully",
        data: sicMeeting,
      });
    } catch (error) {
      console.error("Error updating SIC meeting:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// @route   DELETE /api/sic-meeting/:id
// @desc    Delete a SIC meeting
// @access  Private (Admin only)
router.delete("/:id", auth, async (req, res) => {
  try {
    const sicMeeting = await SICMeeting.findById(req.params.id);
    if (!sicMeeting) {
      return res.status(404).json({ message: "SIC meeting not found" });
    }

    // Check if user is admin or created the meeting
    if (
      req.user.role !== "admin" &&
      sicMeeting.createdBy.toString() !== req.user.id
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this SIC meeting" });
    }

    await SICMeeting.findByIdAndDelete(req.params.id);

    res.json({ message: "SIC meeting deleted successfully" });
  } catch (error) {
    console.error("Error deleting SIC meeting:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/sic-meeting/stats/overview
// @desc    Get SIC meeting statistics
// @access  Private
router.get("/stats/overview", auth, async (req, res) => {
  try {
    const { projectId } = req.query;
    const filter = projectId ? { projectId } : {};

    const stats = await SICMeeting.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          draft: {
            $sum: { $cond: [{ $eq: ["$status", "draft"] }, 1, 0] },
          },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
          archived: {
            $sum: { $cond: [{ $eq: ["$status", "archived"] }, 1, 0] },
          },
          daily: {
            $sum: { $cond: [{ $eq: ["$meetingType", "daily"] }, 1, 0] },
          },
          weekly: {
            $sum: { $cond: [{ $eq: ["$meetingType", "weekly"] }, 1, 0] },
          },
          monthly: {
            $sum: { $cond: [{ $eq: ["$meetingType", "monthly"] }, 1, 0] },
          },
          special: {
            $sum: { $cond: [{ $eq: ["$meetingType", "special"] }, 1, 0] },
          },
          emergency: {
            $sum: { $cond: [{ $eq: ["$meetingType", "emergency"] }, 1, 0] },
          },
          followUpRequired: {
            $sum: { $cond: [{ $eq: ["$followUpRequired", true] }, 1, 0] },
          },
          totalActionItems: {
            $sum: { $size: "$actionItems" },
          },
          completedActionItems: {
            $sum: {
              $size: {
                $filter: {
                  input: "$actionItems",
                  cond: { $eq: ["$$this.status", "completed"] },
                },
              },
            },
          },
          pendingActionItems: {
            $sum: {
              $size: {
                $filter: {
                  input: "$actionItems",
                  cond: { $ne: ["$$this.status", "completed"] },
                },
              },
            },
          },
        },
      },
    ]);

    res.json({ data: stats[0] || {} });
  } catch (error) {
    console.error("Error fetching SIC meeting statistics:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/sic-meeting/action-items/pending
// @desc    Get pending action items across all meetings
// @access  Private
router.get("/action-items/pending", auth, async (req, res) => {
  try {
    const { projectId } = req.query;
    const filter = projectId ? { projectId } : {};

    const meetingsWithPendingActions = await SICMeeting.find(filter)
      .populate("createdBy", "name email employeeId")
      .select("meetingDateTime projectId actionItems")
      .sort({ meetingDateTime: -1 });

    const pendingActions = [];
    meetingsWithPendingActions.forEach((meeting) => {
      meeting.actionItems.forEach((actionItem) => {
        if (actionItem.status !== "completed") {
          pendingActions.push({
            meetingId: meeting._id,
            meetingDateTime: meeting.meetingDateTime,
            projectId: meeting.projectId,
            ...actionItem.toObject(),
          });
        }
      });
    });

    res.json({ data: pendingActions });
  } catch (error) {
    console.error("Error fetching pending action items:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/sic-meeting/action-items/overdue
// @desc    Get overdue action items
// @access  Private
router.get("/action-items/overdue", auth, async (req, res) => {
  try {
    const { projectId } = req.query;
    const filter = projectId ? { projectId } : {};

    const meetingsWithOverdueActions = await SICMeeting.find(filter)
      .populate("createdBy", "name email employeeId")
      .select("meetingDateTime projectId actionItems")
      .sort({ meetingDateTime: -1 });

    const overdueActions = [];
    const now = new Date();

    meetingsWithOverdueActions.forEach((meeting) => {
      meeting.actionItems.forEach((actionItem) => {
        if (actionItem.status !== "completed" && actionItem.deadline < now) {
          overdueActions.push({
            meetingId: meeting._id,
            meetingDateTime: meeting.meetingDateTime,
            projectId: meeting.projectId,
            ...actionItem.toObject(),
          });
        }
      });
    });

    res.json({ data: overdueActions });
  } catch (error) {
    console.error("Error fetching overdue action items:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   PUT /api/sic-meeting/:id/action-item/:actionItemId
// @desc    Update action item status
// @access  Private
router.put("/:id/action-item/:actionItemId", auth, async (req, res) => {
  try {
    const { status, notes } = req.body;

    if (!status || !["pending", "in_progress", "completed"].includes(status)) {
      return res.status(400).json({
        message: "Valid status is required (pending, in_progress, completed)",
      });
    }

    const sicMeeting = await SICMeeting.findById(req.params.id);
    if (!sicMeeting) {
      return res.status(404).json({ message: "SIC meeting not found" });
    }

    sicMeeting.updateActionItemStatus(
      req.params.actionItemId,
      status,
      notes || ""
    );
    sicMeeting.updatedBy = req.user.id;

    await sicMeeting.save();

    res.json({
      message: "Action item updated successfully",
      data: sicMeeting,
    });
  } catch (error) {
    console.error("Error updating action item:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
