const express = require("express");
const router = express.Router();
const Progress = require("../models/Progress");
const User = require("../models/User");

// Get all progress records
router.get("/", async (req, res) => {
  try {
    const progress = await Progress.find()
      .populate("studentId", "name email")
      .sort({ createdAt: -1 });
    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get progress by student ID
router.get("/student/:studentId", async (req, res) => {
  try {
    const progress = await Progress.find({ studentId: req.params.studentId })
      .populate("studentId", "name email")
      .sort({ createdAt: -1 });
    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get progress by course code
router.get("/course/:courseCode", async (req, res) => {
  try {
    const progress = await Progress.find({ courseCode: req.params.courseCode })
      .populate("studentId", "name email")
      .sort({ createdAt: -1 });
    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new progress record
router.post("/", async (req, res) => {
  try {
    const progress = new Progress(req.body);
    await progress.save();
    await progress.populate("studentId", "name email");
    res.status(201).json(progress);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update progress record
router.put("/:id", async (req, res) => {
  try {
    const progress = await Progress.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate("studentId", "name email");
    
    if (!progress) {
      return res.status(404).json({ message: "Progress record not found" });
    }
    
    res.json(progress);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete progress record
router.delete("/:id", async (req, res) => {
  try {
    const progress = await Progress.findByIdAndDelete(req.params.id);
    if (!progress) {
      return res.status(404).json({ message: "Progress record not found" });
    }
    res.json({ message: "Progress record deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get progress statistics
router.get("/stats/:studentId", async (req, res) => {
  try {
    const progress = await Progress.find({ studentId: req.params.studentId });
    
    const stats = {
      totalCourses: progress.length,
      completedCourses: progress.filter(p => p.status === "Completed").length,
      inProgressCourses: progress.filter(p => p.status === "In Progress").length,
      averageGrade: 0,
      gradeDistribution: {}
    };

    // Calculate average grade (convert letter grades to numbers)
    const gradeValues = {
      "A+": 4.0, "A": 4.0, "A-": 3.7,
      "B+": 3.3, "B": 3.0, "B-": 2.7,
      "C+": 2.3, "C": 2.0, "C-": 1.7,
      "D+": 1.3, "D": 1.0, "F": 0.0
    };

    const validGrades = progress.filter(p => p.overallGrade !== "—" && p.status === "Completed");
    if (validGrades.length > 0) {
      const totalPoints = validGrades.reduce((sum, p) => sum + (gradeValues[p.overallGrade] || 0), 0);
      stats.averageGrade = (totalPoints / validGrades.length).toFixed(2);
    }

    // Grade distribution
    progress.forEach(p => {
      if (p.overallGrade !== "—") {
        stats.gradeDistribution[p.overallGrade] = (stats.gradeDistribution[p.overallGrade] || 0) + 1;
      }
    });

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
