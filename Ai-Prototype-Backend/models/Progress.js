const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  courseCode: {
    type: String,
    required: true,
    trim: true,
  },
  courseTitle: {
    type: String,
    required: true,
    trim: true,
  },
  assignments: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  quizzes: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  midterm: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  final: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  overallGrade: {
    type: String,
    enum: ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "F", "—"],
    default: "—",
  },
  status: {
    type: String,
    enum: ["In Progress", "Completed", "Dropped"],
    default: "In Progress",
  },
  semester: {
    type: String,
    required: true,
    trim: true,
  },
  year: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
progressSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Progress", progressSchema);
