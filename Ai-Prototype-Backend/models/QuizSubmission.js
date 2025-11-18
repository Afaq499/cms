const mongoose = require("mongoose");

const quizSubmissionSchema = new mongoose.Schema(
  {
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    answers: [
      {
        questionId: {
          type: String,
          required: true,
        },
        answer: {
          type: mongoose.Schema.Types.Mixed, // Can be string, number, or array
          required: true,
        },
      },
    ],
    score: {
      type: Number,
      default: null,
    },
    totalMarks: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["In Progress", "Submitted", "Graded"],
      default: "In Progress",
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    submittedAt: {
      type: Date,
      default: null,
    },
    gradedAt: {
      type: Date,
      default: null,
    },
    remarks: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

// Prevent duplicate submissions
quizSubmissionSchema.index({ quizId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model("QuizSubmission", quizSubmissionSchema);

