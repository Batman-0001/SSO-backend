const express = require("express");
const { body, validationResult } = require("express-validator");
const GoodPractice = require("../models/GoodPractice");
const auth = require("../middleware/auth");

const router = express.Router();

// @route   POST /api/good-practice
// @desc    Create a new good practice
// @access  Private
router.post(
  "/",
  [
    auth,
    [
      body("projectId").notEmpty().withMessage("Project ID is required"),
      body("date").isISO8601().withMessage("Valid date is required"),
      body("title").notEmpty().withMessage("Title is required"),
      body("description").notEmpty().withMessage("Description is required"),
      body("awardable")
        .optional()
        .isBoolean()
        .withMessage("Awardable must be a boolean"),
      body("category")
        .optional()
        .isIn([
          "safety",
          "environmental",
          "efficiency",
          "innovation",
          "teamwork",
          "leadership",
        ])
        .withMessage("Invalid category"),
      body("impactLevel")
        .optional()
        .isIn(["local", "project_wide", "company_wide", "industry_wide"])
        .withMessage("Invalid impact level"),
      body("photos")
        .optional()
        .isArray()
        .withMessage("Photos must be an array"),
      body("tags").optional().isArray().withMessage("Tags must be an array"),
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
        title,
        description,
        awardable = false,
        personsCredited = "",
        photos = [],
        category = "safety",
        impactLevel = "local",
        tags = [],
      } = req.body;

      // Filter out empty tags
      const validTags = tags.filter((tag) => tag && tag.trim().length > 0);

      const goodPractice = new GoodPractice({
        projectId,
        date: new Date(date),
        title,
        description,
        awardable,
        personsCredited,
        photos,
        category,
        impactLevel,
        tags: validTags,
        createdBy: req.user.id,
      });

      await goodPractice.save();

      res.status(201).json({
        message: "Good practice created successfully",
        data: goodPractice,
      });
    } catch (error) {
      console.error("Error creating good practice:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// @route   GET /api/good-practice
// @desc    Get all good practices with filtering and pagination
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      projectId,
      category,
      status = "submitted",
      awardable,
      impactLevel,
      sortBy = "date",
      sortOrder = "desc",
    } = req.query;

    const filter = {};
    if (projectId) filter.projectId = projectId;
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (awardable !== undefined) filter.awardable = awardable === "true";
    if (impactLevel) filter.impactLevel = impactLevel;

    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const goodPractices = await GoodPractice.find(filter)
      .populate("createdBy", "name email employeeId")
      .populate("updatedBy", "name email employeeId")
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await GoodPractice.countDocuments(filter);

    res.json({
      data: goodPractices,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error("Error fetching good practices:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/good-practice/:id
// @desc    Get a specific good practice
// @access  Private
router.get("/:id", auth, async (req, res) => {
  try {
    const goodPractice = await GoodPractice.findById(req.params.id)
      .populate("createdBy", "name email employeeId")
      .populate("updatedBy", "name email employeeId");

    if (!goodPractice) {
      return res.status(404).json({ message: "Good practice not found" });
    }

    // Increment views
    goodPractice.incrementViews();
    await goodPractice.save();

    res.json({ data: goodPractice });
  } catch (error) {
    console.error("Error fetching good practice:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   PUT /api/good-practice/:id
// @desc    Update a good practice
// @access  Private
router.put(
  "/:id",
  [
    auth,
    [
      body("status")
        .optional()
        .isIn(["submitted", "under_review", "approved", "awarded", "rejected"]),
      body("category")
        .optional()
        .isIn([
          "safety",
          "environmental",
          "efficiency",
          "innovation",
          "teamwork",
          "leadership",
        ]),
      body("impactLevel")
        .optional()
        .isIn(["local", "project_wide", "company_wide", "industry_wide"]),
      body("awardType")
        .optional()
        .isIn(["recognition", "monetary", "certificate", "trophy", "other"]),
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
        category,
        impactLevel,
        title,
        description,
        personsCredited,
        reviewNotes,
        reviewedBy,
        awardType,
        awardValue,
        awardNotes,
        sharedWithTeam,
        sharedNotes,
        tags,
      } = req.body;

      const goodPractice = await GoodPractice.findById(req.params.id);
      if (!goodPractice) {
        return res.status(404).json({ message: "Good practice not found" });
      }

      // Update fields
      if (category) goodPractice.category = category;
      if (impactLevel) goodPractice.impactLevel = impactLevel;
      if (title) goodPractice.title = title;
      if (description) goodPractice.description = description;
      if (personsCredited) goodPractice.personsCredited = personsCredited;

      // Handle status changes
      if (status) {
        if (status === "approved") {
          if (!reviewedBy) {
            return res.status(400).json({
              message: "Reviewed by is required when approving practice",
            });
          }
          goodPractice.approve(reviewedBy, reviewNotes || "");
        } else if (status === "awarded") {
          if (!awardType) {
            return res.status(400).json({
              message: "Award type is required when awarding practice",
            });
          }
          goodPractice.award(awardType, awardValue || 0, awardNotes || "");
        } else if (status === "rejected") {
          if (!reviewedBy) {
            return res.status(400).json({
              message: "Reviewed by is required when rejecting practice",
            });
          }
          goodPractice.reject(reviewedBy, reviewNotes || "");
        } else {
          goodPractice.status = status;
        }
      }

      // Handle team sharing
      if (sharedWithTeam !== undefined && sharedWithTeam) {
        goodPractice.shareWithTeam(sharedNotes || "");
      }

      // Handle tags
      if (tags) {
        const validTags = tags.filter((tag) => tag && tag.trim().length > 0);
        goodPractice.tags = validTags;
      }

      // Update other fields
      if (reviewNotes) goodPractice.reviewNotes = reviewNotes;
      if (awardType) goodPractice.awardType = awardType;
      if (awardValue !== undefined) goodPractice.awardValue = awardValue;
      if (awardNotes) goodPractice.awardNotes = awardNotes;

      goodPractice.updatedBy = req.user.id;

      await goodPractice.save();

      res.json({
        message: "Good practice updated successfully",
        data: goodPractice,
      });
    } catch (error) {
      console.error("Error updating good practice:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// @route   DELETE /api/good-practice/:id
// @desc    Delete a good practice
// @access  Private (Admin only)
router.delete("/:id", auth, async (req, res) => {
  try {
    const goodPractice = await GoodPractice.findById(req.params.id);
    if (!goodPractice) {
      return res.status(404).json({ message: "Good practice not found" });
    }

    // Check if user is admin or created the practice
    if (
      req.user.role !== "admin" &&
      goodPractice.createdBy.toString() !== req.user.id
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this good practice" });
    }

    await GoodPractice.findByIdAndDelete(req.params.id);

    res.json({ message: "Good practice deleted successfully" });
  } catch (error) {
    console.error("Error deleting good practice:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   PUT /api/good-practice/:id/like
// @desc    Like a good practice
// @access  Private
router.put("/:id/like", auth, async (req, res) => {
  try {
    const goodPractice = await GoodPractice.findById(req.params.id);
    if (!goodPractice) {
      return res.status(404).json({ message: "Good practice not found" });
    }

    goodPractice.incrementLikes();
    await goodPractice.save();

    res.json({
      message: "Good practice liked successfully",
      data: { likes: goodPractice.likes },
    });
  } catch (error) {
    console.error("Error liking good practice:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/good-practice/stats/overview
// @desc    Get good practice statistics
// @access  Private
router.get("/stats/overview", auth, async (req, res) => {
  try {
    const { projectId } = req.query;
    const filter = projectId ? { projectId } : {};

    const stats = await GoodPractice.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          submitted: {
            $sum: { $cond: [{ $eq: ["$status", "submitted"] }, 1, 0] },
          },
          underReview: {
            $sum: { $cond: [{ $eq: ["$status", "under_review"] }, 1, 0] },
          },
          approved: {
            $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] },
          },
          awarded: {
            $sum: { $cond: [{ $eq: ["$status", "awarded"] }, 1, 0] },
          },
          rejected: {
            $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] },
          },
          awardable: {
            $sum: { $cond: [{ $eq: ["$awardable", true] }, 1, 0] },
          },
          safety: {
            $sum: { $cond: [{ $eq: ["$category", "safety"] }, 1, 0] },
          },
          environmental: {
            $sum: { $cond: [{ $eq: ["$category", "environmental"] }, 1, 0] },
          },
          efficiency: {
            $sum: { $cond: [{ $eq: ["$category", "efficiency"] }, 1, 0] },
          },
          innovation: {
            $sum: { $cond: [{ $eq: ["$category", "innovation"] }, 1, 0] },
          },
          teamwork: {
            $sum: { $cond: [{ $eq: ["$category", "teamwork"] }, 1, 0] },
          },
          leadership: {
            $sum: { $cond: [{ $eq: ["$category", "leadership"] }, 1, 0] },
          },
          totalLikes: { $sum: "$likes" },
          totalViews: { $sum: "$views" },
          sharedWithTeam: {
            $sum: { $cond: [{ $eq: ["$sharedWithTeam", true] }, 1, 0] },
          },
        },
      },
    ]);

    res.json({ data: stats[0] || {} });
  } catch (error) {
    console.error("Error fetching good practice statistics:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/good-practice/awards/pending
// @desc    Get awardable practices pending review
// @access  Private
router.get("/awards/pending", auth, async (req, res) => {
  try {
    const { projectId } = req.query;
    const filter = {
      awardable: true,
      status: { $in: ["submitted", "under_review"] },
      projectId: projectId || { $exists: true },
    };

    const pendingAwards = await GoodPractice.find(filter)
      .populate("createdBy", "name email employeeId")
      .sort({ date: -1 });

    res.json({ data: pendingAwards });
  } catch (error) {
    console.error("Error fetching pending awards:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/good-practice/popular/top
// @desc    Get most popular good practices
// @access  Private
router.get("/popular/top", auth, async (req, res) => {
  try {
    const { projectId, limit = 10 } = req.query;
    const filter = projectId ? { projectId } : {};

    const popularPractices = await GoodPractice.find(filter)
      .populate("createdBy", "name email employeeId")
      .sort({ likes: -1, views: -1 })
      .limit(parseInt(limit));

    res.json({ data: popularPractices });
  } catch (error) {
    console.error("Error fetching popular practices:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/good-practice/categories/breakdown
// @desc    Get category breakdown
// @access  Private
router.get("/categories/breakdown", auth, async (req, res) => {
  try {
    const { projectId } = req.query;
    const filter = projectId ? { projectId } : {};

    const categoryStats = await GoodPractice.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          avgLikes: { $avg: "$likes" },
          avgViews: { $avg: "$views" },
          awardable: {
            $sum: { $cond: [{ $eq: ["$awardable", true] }, 1, 0] },
          },
          approved: {
            $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] },
          },
          awarded: {
            $sum: { $cond: [{ $eq: ["$status", "awarded"] }, 1, 0] },
          },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json({ data: categoryStats });
  } catch (error) {
    console.error("Error fetching category breakdown:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
