const express = require("express");
const { body, validationResult } = require("express-validator");
const StopWorkOrder = require("../models/StopWorkOrder");
const auth = require("../middleware/auth");

const router = express.Router();

// @route   POST /api/stop-work-order
// @desc    Create a new stop work order
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
      body("areaStopped").notEmpty().withMessage("Area stopped is required"),
      body("activityStopped")
        .notEmpty()
        .withMessage("Activity stopped is required"),
      body("reasonCategory")
        .isIn([
          "unsafe_condition",
          "unsafe_act",
          "equipment_failure",
          "weather",
          "regulatory",
          "other",
        ])
        .withMessage("Invalid reason category"),
      body("reasonDescription")
        .notEmpty()
        .withMessage("Reason description is required"),
      body("issuedBy").notEmpty().withMessage("Issued by is required"),
      body("immediateActions")
        .notEmpty()
        .withMessage("Immediate actions are required"),
      body("sicSignature").notEmpty().withMessage("SIC signature is required"),
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
        dateTime,
        areaStopped,
        activityStopped,
        reasonCategory,
        reasonDescription,
        issuedBy,
        duration = "",
        immediateActions,
        photos = [],
        sicSignature,
      } = req.body;

      const stopWorkOrder = new StopWorkOrder({
        projectId,
        dateTime: new Date(dateTime),
        areaStopped,
        activityStopped,
        reasonCategory,
        reasonDescription,
        issuedBy,
        duration,
        immediateActions,
        photos,
        sicSignature,
        createdBy: req.user.id,
      });

      await stopWorkOrder.save();

      res.status(201).json({
        message: "Stop Work Order created successfully",
        data: stopWorkOrder,
      });
    } catch (error) {
      console.error("Error creating stop work order:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// @route   GET /api/stop-work-order
// @desc    Get all stop work orders with filtering and pagination
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      projectId,
      reasonCategory,
      status = "active",
      areaStopped,
      sortBy = "dateTime",
      sortOrder = "desc",
    } = req.query;

    const filter = {};
    if (projectId) filter.projectId = projectId;
    if (reasonCategory) filter.reasonCategory = reasonCategory;
    if (status) filter.status = status;
    if (areaStopped) filter.areaStopped = new RegExp(areaStopped, "i");

    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const stopWorkOrders = await StopWorkOrder.find(filter)
      .populate("createdBy", "name email employeeId")
      .populate("updatedBy", "name email employeeId")
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await StopWorkOrder.countDocuments(filter);

    res.json({
      data: stopWorkOrders,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error("Error fetching stop work orders:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/stop-work-order/:id
// @desc    Get a specific stop work order
// @access  Private
router.get("/:id", auth, async (req, res) => {
  try {
    const stopWorkOrder = await StopWorkOrder.findById(req.params.id)
      .populate("createdBy", "name email employeeId")
      .populate("updatedBy", "name email employeeId");

    if (!stopWorkOrder) {
      return res.status(404).json({ message: "Stop Work Order not found" });
    }

    res.json({ data: stopWorkOrder });
  } catch (error) {
    console.error("Error fetching stop work order:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   PUT /api/stop-work-order/:id
// @desc    Update a stop work order
// @access  Private
router.put(
  "/:id",
  [
    auth,
    [
      body("status").optional().isIn(["active", "resolved", "cancelled"]),
      body("reasonCategory")
        .optional()
        .isIn([
          "unsafe_condition",
          "unsafe_act",
          "equipment_failure",
          "weather",
          "regulatory",
          "other",
        ]),
      body("resolvedBy")
        .optional()
        .notEmpty()
        .withMessage("Resolved by is required when resolving SWO"),
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
        reasonCategory,
        areaStopped,
        activityStopped,
        reasonDescription,
        immediateActions,
        resolvedBy,
        resolutionNotes,
      } = req.body;

      const stopWorkOrder = await StopWorkOrder.findById(req.params.id);
      if (!stopWorkOrder) {
        return res.status(404).json({ message: "Stop Work Order not found" });
      }

      // Update fields
      if (reasonCategory) stopWorkOrder.reasonCategory = reasonCategory;
      if (areaStopped) stopWorkOrder.areaStopped = areaStopped;
      if (activityStopped) stopWorkOrder.activityStopped = activityStopped;
      if (reasonDescription)
        stopWorkOrder.reasonDescription = reasonDescription;
      if (immediateActions) stopWorkOrder.immediateActions = immediateActions;

      // Handle status changes
      if (status) {
        if (status === "resolved") {
          if (!resolvedBy) {
            return res.status(400).json({
              message: "Resolved by field is required when resolving SWO",
            });
          }
          stopWorkOrder.resolve(resolvedBy, resolutionNotes || "");
        } else if (status === "cancelled") {
          stopWorkOrder.cancel(resolutionNotes || "");
        } else {
          stopWorkOrder.status = status;
        }
      }

      stopWorkOrder.updatedBy = req.user.id;

      await stopWorkOrder.save();

      res.json({
        message: "Stop Work Order updated successfully",
        data: stopWorkOrder,
      });
    } catch (error) {
      console.error("Error updating stop work order:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// @route   DELETE /api/stop-work-order/:id
// @desc    Delete a stop work order
// @access  Private (Admin only)
router.delete("/:id", auth, async (req, res) => {
  try {
    const stopWorkOrder = await StopWorkOrder.findById(req.params.id);
    if (!stopWorkOrder) {
      return res.status(404).json({ message: "Stop Work Order not found" });
    }

    // Check if user is admin or created the SWO
    if (
      req.user.role !== "admin" &&
      stopWorkOrder.createdBy.toString() !== req.user.id
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this Stop Work Order" });
    }

    await StopWorkOrder.findByIdAndDelete(req.params.id);

    res.json({ message: "Stop Work Order deleted successfully" });
  } catch (error) {
    console.error("Error deleting stop work order:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/stop-work-order/stats/overview
// @desc    Get stop work order statistics
// @access  Private
router.get("/stats/overview", auth, async (req, res) => {
  try {
    const { projectId } = req.query;
    const filter = projectId ? { projectId } : {};

    const stats = await StopWorkOrder.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: {
            $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] },
          },
          resolved: {
            $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] },
          },
          cancelled: {
            $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
          },
          unsafeCondition: {
            $sum: {
              $cond: [{ $eq: ["$reasonCategory", "unsafe_condition"] }, 1, 0],
            },
          },
          unsafeAct: {
            $sum: { $cond: [{ $eq: ["$reasonCategory", "unsafe_act"] }, 1, 0] },
          },
          equipmentFailure: {
            $sum: {
              $cond: [{ $eq: ["$reasonCategory", "equipment_failure"] }, 1, 0],
            },
          },
          weather: {
            $sum: { $cond: [{ $eq: ["$reasonCategory", "weather"] }, 1, 0] },
          },
          regulatory: {
            $sum: { $cond: [{ $eq: ["$reasonCategory", "regulatory"] }, 1, 0] },
          },
          other: {
            $sum: { $cond: [{ $eq: ["$reasonCategory", "other"] }, 1, 0] },
          },
        },
      },
    ]);

    res.json({ data: stats[0] || {} });
  } catch (error) {
    console.error("Error fetching stop work order statistics:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/stop-work-order/active/current
// @desc    Get currently active stop work orders
// @access  Private
router.get("/active/current", auth, async (req, res) => {
  try {
    const { projectId } = req.query;
    const filter = {
      status: "active",
      projectId: projectId || { $exists: true },
    };

    const activeSWOs = await StopWorkOrder.find(filter)
      .populate("createdBy", "name email employeeId")
      .sort({ dateTime: -1 });

    res.json({ data: activeSWOs });
  } catch (error) {
    console.error("Error fetching active stop work orders:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/stop-work-order/reasons/categories
// @desc    Get stop work order reason categories with counts
// @access  Private
router.get("/reasons/categories", auth, async (req, res) => {
  try {
    const { projectId } = req.query;
    const filter = projectId ? { projectId } : {};

    const reasonStats = await StopWorkOrder.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$reasonCategory",
          count: { $sum: 1 },
          active: {
            $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] },
          },
          resolved: {
            $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] },
          },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json({ data: reasonStats });
  } catch (error) {
    console.error("Error fetching reason categories:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
