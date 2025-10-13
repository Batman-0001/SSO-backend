const mongoose = require("mongoose");

const goodPracticeSchema = new mongoose.Schema(
  {
    projectId: {
      type: String,
      required: true,
      trim: true,
    },
    module: {
      type: String,
      default: "good_practice",
      enum: ["good_practice"],
    },
    date: {
      type: Date,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    awardable: {
      type: Boolean,
      default: false,
    },
    personsCredited: {
      type: String,
      trim: true,
      default: "",
    },
    photos: [
      {
        type: String, // Cloudinary URLs
        validate: {
          validator: function (v) {
            return v.length <= 6; // Max 6 photos
          },
          message: "Maximum 6 photos allowed",
        },
      },
    ],
    status: {
      type: String,
      enum: ["submitted", "under_review", "approved", "awarded", "rejected"],
      default: "submitted",
    },
    category: {
      type: String,
      enum: [
        "safety",
        "environmental",
        "efficiency",
        "innovation",
        "teamwork",
        "leadership",
      ],
      default: "safety",
    },
    impactLevel: {
      type: String,
      enum: ["local", "project_wide", "company_wide", "industry_wide"],
      default: "local",
    },
    reviewNotes: {
      type: String,
      trim: true,
      default: "",
    },
    reviewedBy: {
      type: String,
      trim: true,
      default: "",
    },
    reviewedAt: {
      type: Date,
    },
    awardType: {
      type: String,
      enum: ["recognition", "monetary", "certificate", "trophy", "other"],
      default: "recognition",
    },
    awardValue: {
      type: Number,
      default: 0,
    },
    awardDate: {
      type: Date,
    },
    awardNotes: {
      type: String,
      trim: true,
      default: "",
    },
    sharedWithTeam: {
      type: Boolean,
      default: false,
    },
    sharedDate: {
      type: Date,
    },
    sharedNotes: {
      type: String,
      trim: true,
      default: "",
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    likes: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
goodPracticeSchema.index({ projectId: 1, date: -1 });
goodPracticeSchema.index({ status: 1 });
goodPracticeSchema.index({ category: 1 });
goodPracticeSchema.index({ awardable: 1 });
goodPracticeSchema.index({ impactLevel: 1 });
goodPracticeSchema.index({ tags: 1 });

// Virtual for days since submission
goodPracticeSchema.virtual("daysSinceSubmission").get(function () {
  const now = new Date();
  const diffTime = now - this.createdAt;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for approval rate
goodPracticeSchema.virtual("isApproved").get(function () {
  return this.status === "approved" || this.status === "awarded";
});

// Virtual for award status
goodPracticeSchema.virtual("hasAward").get(function () {
  return this.status === "awarded" && this.awardDate;
});

// Method to approve practice
goodPracticeSchema.methods.approve = function (reviewedBy, reviewNotes = "") {
  this.status = "approved";
  this.reviewedBy = reviewedBy;
  this.reviewedAt = new Date();
  this.reviewNotes = reviewNotes;
};

// Method to award practice
goodPracticeSchema.methods.award = function (
  awardType,
  awardValue = 0,
  awardNotes = ""
) {
  this.status = "awarded";
  this.awardType = awardType;
  this.awardValue = awardValue;
  this.awardDate = new Date();
  this.awardNotes = awardNotes;
};

// Method to reject practice
goodPracticeSchema.methods.reject = function (reviewedBy, reviewNotes = "") {
  this.status = "rejected";
  this.reviewedBy = reviewedBy;
  this.reviewedAt = new Date();
  this.reviewNotes = reviewNotes;
};

// Method to share with team
goodPracticeSchema.methods.shareWithTeam = function (sharedNotes = "") {
  this.sharedWithTeam = true;
  this.sharedDate = new Date();
  this.sharedNotes = sharedNotes;
};

// Method to add tags
goodPracticeSchema.methods.addTags = function (newTags) {
  const existingTags = this.tags || [];
  const uniqueTags = [...new Set([...existingTags, ...newTags])];
  this.tags = uniqueTags;
};

// Method to increment likes
goodPracticeSchema.methods.incrementLikes = function () {
  this.likes += 1;
};

// Method to increment views
goodPracticeSchema.methods.incrementViews = function () {
  this.views += 1;
};

// Pre-save validation
goodPracticeSchema.pre("save", function (next) {
  // Filter out empty tags
  if (this.tags) {
    this.tags = this.tags.filter((tag) => tag && tag.trim().length > 0);
  }

  // Validate award requirements
  if (this.status === "awarded" && !this.awardDate) {
    this.awardDate = new Date();
  }

  // Validate review requirements
  if (
    (this.status === "approved" || this.status === "rejected") &&
    !this.reviewedAt
  ) {
    this.reviewedAt = new Date();
  }

  // Auto-share if approved and not already shared
  if (this.status === "approved" && !this.sharedWithTeam) {
    this.shareWithTeam("Automatically shared upon approval");
  }

  next();
});

module.exports = mongoose.model("GoodPractice", goodPracticeSchema);
