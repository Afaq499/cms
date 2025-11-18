const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
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
    scheduledDate: {
      type: Date,
      required: true,
    },
    scheduledTime: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
      default: 60, // duration in minutes
    },
    totalMarks: {
      type: Number,
      required: true,
      default: 100,
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
    status: {
      type: String,
      enum: ["Scheduled", "Active", "Completed", "Cancelled"],
      default: "Scheduled",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    questions: [
      {
        questionId: {
          type: String,
          required: true,
        },
        question: {
          type: String,
          required: true,
          trim: true,
        },
        type: {
          type: String,
          enum: ["multiple-choice", "true-false", "short-answer", "essay"],
          required: true,
        },
        options: {
          type: [String],
          default: [],
        },
        correctAnswer: {
          type: mongoose.Schema.Types.Mixed, // Can be string, number, boolean, or array
          required: true,
        },
        marks: {
          type: Number,
          required: true,
          default: 1,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Quiz", quizSchema);

