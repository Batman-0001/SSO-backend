const mongoose = require("mongoose");

const firstAidSchema = new mongoose.Schema(
  {
    projectId: {
      type: String,
      required: true,
      trim: true,
    },
    module: {
      type: String,
      default: "first_aid",
      enum: ["first_aid"],
    },
    dateTime: {
      type: Date,
      required: true,
    },
    victimName: {
      type: String,
      required: true,
      trim: true,
    },
    victimEmpId: {
      type: String,
      required: true,
      trim: true,
    },
    injuryType: {
      type: String,
      required: true,
      trim: true,
    },
    cause: {
      type: String,
      required: true,
      trim: true,
    },
    treatmentGiven: {
      type: String,
      required: true,
      trim: true,
    },
    transportToHospital: {
      type: Boolean,
      default: false,
    },
    hospitalName: {
      type: String,
      trim: true,
      default: "",
    },
    hospitalDetails: {
      type: String,
      trim: true,
      default: "",
    },
    witnessNames: [
      {
        type: String,
        trim: true,
      },
    ],
    photos: [
      {
        type: String, // Cloudinary URLs
      },
    ],
    status: {
      type: String,
      enum: ["draft", "reported", "investigated", "closed"],
      default: "draft",
    },
    investigationNotes: {
      type: String,
      trim: true,
      default: "",
    },
    followUpRequired: {
      type: Boolean,
      default: false,
    },
    followUpDate: {
      type: Date,
    },
    followUpNotes: {
      type: String,
      trim: true,
      default: "",
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
firstAidSchema.index({ projectId: 1, dateTime: -1 });
firstAidSchema.index({ victimEmpId: 1 });
firstAidSchema.index({ injuryType: 1 });
firstAidSchema.index({ status: 1 });
firstAidSchema.index({ transportToHospital: 1 });

// Virtual for injury severity based on hospital transport
firstAidSchema.virtual("injurySeverity").get(function () {
  if (this.transportToHospital) {
    return "serious";
  }
  return "minor";
});

// Virtual for witness count
firstAidSchema.virtual("witnessCount").get(function () {
  return this.witnessNames.filter(
    (name) => name && name.trim().length > 0
  ).length;
});

// Method to check if follow-up is due
firstAidSchema.methods.isFollowUpDue = function () {
  if (!this.followUpRequired || !this.followUpDate) return false;
  return new Date() >= this.followUpDate;
};

// Method to mark as investigated
firstAidSchema.methods.investigate = function (investigationNotes = "") {
  this.status = "investigated";
  this.investigationNotes = investigationNotes;
};

// Method to close case
firstAidSchema.methods.close = function (followUpNotes = "") {
  this.status = "closed";
  this.followUpNotes = followUpNotes;
};

// Method to schedule follow-up
firstAidSchema.methods.scheduleFollowUp = function (followUpDate, notes = "") {
  this.followUpRequired = true;
  this.followUpDate = new Date(followUpDate);
  this.followUpNotes = notes;
};

// Pre-save validation
firstAidSchema.pre("save", function (next) {
  // Only validate required fields for non-draft status
  if (this.status !== "draft") {
    // Validate required fields for submitted cases
    if (
      !this.victimName ||
      !this.victimEmpId ||
      !this.injuryType ||
      !this.cause ||
      !this.treatmentGiven
    ) {
      return next(
        new Error("All required fields must be filled for submitted cases")
      );
    }

    // Validate hospital transport requirements
    if (
      this.transportToHospital &&
      (!this.hospitalName || this.hospitalName.trim().length === 0)
    ) {
      return next(
        new Error(
          "Hospital name is required when victim was transported to hospital"
        )
      );
    }
  }

  // Filter out empty witness names
  if (this.witnessNames) {
    this.witnessNames = this.witnessNames.filter(
      (name) => name && name.trim().length > 0
    );
  }

  // Validate follow-up date if required
  if (this.followUpRequired && !this.followUpDate) {
    return next(
      new Error("Follow-up date is required when follow-up is required")
    );
  }

  next();
});

module.exports = mongoose.model("FirstAid", firstAidSchema);
