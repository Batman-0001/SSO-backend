const mongoose = require("mongoose");

const sicMeetingSchema = new mongoose.Schema(
  {
    projectId: {
      type: String,
      required: true,
      trim: true,
    },
    module: {
      type: String,
      default: "sic_meeting",
      enum: ["sic_meeting"],
    },
    meetingDateTime: {
      type: Date,
      required: true,
    },
    attendees: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        empId: {
          type: String,
          required: true,
          trim: true,
        },
        contractor: {
          type: String,
          required: true,
          trim: true,
        },
      },
    ],
    agendaPoints: [
      {
        type: String,
        trim: true,
      },
    ],
    decisions: {
      type: String,
      required: true,
      trim: true,
    },
    actionOwners: {
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
    sicSignature: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["draft", "completed", "archived"],
      default: "completed",
    },
    meetingDuration: {
      type: Number, // in minutes
      default: 0,
    },
    nextMeetingDate: {
      type: Date,
    },
    followUpRequired: {
      type: Boolean,
      default: false,
    },
    followUpNotes: {
      type: String,
      trim: true,
      default: "",
    },
    actionItems: [
      {
        description: {
          type: String,
          required: true,
          trim: true,
        },
        owner: {
          type: String,
          required: true,
          trim: true,
        },
        deadline: {
          type: Date,
          required: true,
        },
        status: {
          type: String,
          enum: ["pending", "in_progress", "completed"],
          default: "pending",
        },
        completedDate: {
          type: Date,
        },
        notes: {
          type: String,
          trim: true,
          default: "",
        },
      },
    ],
    meetingType: {
      type: String,
      enum: ["daily", "weekly", "monthly", "special", "emergency"],
      default: "daily",
    },
    location: {
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
sicMeetingSchema.index({ projectId: 1, meetingDateTime: -1 });
sicMeetingSchema.index({ status: 1 });
sicMeetingSchema.index({ meetingType: 1 });
sicMeetingSchema.index({ "attendees.empId": 1 });
sicMeetingSchema.index({ nextMeetingDate: 1 });

// Virtual for attendee count
sicMeetingSchema.virtual("attendeeCount").get(function () {
  return this.attendees.length;
});

// Virtual for agenda point count
sicMeetingSchema.virtual("agendaPointCount").get(function () {
  return this.agendaPoints.filter(
    (point) => point && point.trim().length > 0
  ).length;
});

// Virtual for action item count
sicMeetingSchema.virtual("actionItemCount").get(function () {
  return this.actionItems.length;
});

// Virtual for pending action items
sicMeetingSchema.virtual("pendingActionItems").get(function () {
  return this.actionItems.filter((item) => item.status !== "completed").length;
});

// Virtual for overdue action items
sicMeetingSchema.virtual("overdueActionItems").get(function () {
  const now = new Date();
  return this.actionItems.filter(
    (item) => item.status !== "completed" && item.deadline < now
  ).length;
});

// Method to add action item
sicMeetingSchema.methods.addActionItem = function (
  description,
  owner,
  deadline,
  notes = ""
) {
  this.actionItems.push({
    description,
    owner,
    deadline: new Date(deadline),
    notes,
  });
};

// Method to update action item status
sicMeetingSchema.methods.updateActionItemStatus = function (
  actionItemId,
  status,
  notes = ""
) {
  const actionItem = this.actionItems.id(actionItemId);
  if (actionItem) {
    actionItem.status = status;
    if (status === "completed") {
      actionItem.completedDate = new Date();
    }
    if (notes) {
      actionItem.notes = notes;
    }
  }
};

// Method to schedule follow-up
sicMeetingSchema.methods.scheduleFollowUp = function (
  nextMeetingDate,
  followUpNotes = ""
) {
  this.followUpRequired = true;
  this.nextMeetingDate = new Date(nextMeetingDate);
  this.followUpNotes = followUpNotes;
};

// Method to archive meeting
sicMeetingSchema.methods.archive = function () {
  this.status = "archived";
};

// Pre-save validation
sicMeetingSchema.pre("save", function (next) {
  // Filter out empty agenda points
  if (this.agendaPoints) {
    this.agendaPoints = this.agendaPoints.filter(
      (point) => point && point.trim().length > 0
    );
  }

  // Validate action items
  if (this.actionItems && this.actionItems.length > 0) {
    this.actionItems.forEach((item, index) => {
      if (!item.description || !item.owner || !item.deadline) {
        return next(
          new Error(`Action item ${index + 1} is missing required fields`)
        );
      }
    });
  }

  // Validate attendees
  if (this.attendees && this.attendees.length > 0) {
    this.attendees.forEach((attendee, index) => {
      if (!attendee.name || !attendee.empId || !attendee.contractor) {
        return next(
          new Error(`Attendee ${index + 1} is missing required fields`)
        );
      }
    });
  }

  // Validate follow-up date if required
  if (this.followUpRequired && !this.nextMeetingDate) {
    return next(
      new Error("Next meeting date is required when follow-up is required")
    );
  }

  next();
});

module.exports = mongoose.model("SICMeeting", sicMeetingSchema);
