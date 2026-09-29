const mongoose = require("mongoose");

const issueSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      required: true,
      trim: true
    },

    category: {
      type: String,
      enum: [
        "Electrical",
        "Plumbing",
        "Furniture",
        "Cleanliness",
        "Internet",
        "Classroom Equipment",
        "Laboratory Equipment",
        "Hostel",
        "Security",
        "Other"
      ],
      default: "Other"
    },

    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "URGENT"],
      default: "MEDIUM"
    },

    location: {
      type: String,
      required: true,
      trim: true
    },

    image: {
      type: String,
      default: null
    },

    status: {
      type: String,
      enum: [
        "PENDING",
        "REVIEWED",
        "ASSIGNED",
        "IN_PROGRESS",
        "RESOLVED",
        "CONFIRMED",
        "REJECTED"
      ],
      default: "PENDING"
    },

    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Issue", issueSchema);