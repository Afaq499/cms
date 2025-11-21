const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema(
  {
    assignmentNumber: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    totalMarks: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["Submitted", "Pending", "Late", "Not Started"],
      default: "Not Started",
    },
    submittedDate: {
      type: Date,
      default: null,
    },
    submissionText: {
      type: String,
      trim: true,
      default: "",
    },
    score: {
      type: Number,
      default: null,
    },
    remarks: {
      type: String,
      trim: true,
      default: "",
    },
    courseCode: {
      type: String,
      required: true,
      trim: true,
    },
    courseName: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    instructions: {
      type: String,
      trim: true,
      default: "",
    },
    content: {
      type: String,
      trim: true,
      default: "",
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Assignment", assignmentSchema);
