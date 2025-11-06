const express = require("express");
const router = express.Router();
const Progress = require("../models/Progress");
const Assignment = require("../models/Assignment");
const User = require("../models/User");

// Generate comprehensive student report
router.get("/student/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;
    
    // Get student info
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Get progress records
    const progress = await Progress.find({ studentId })
      .sort({ createdAt: -1 });

    // Get assignments
    const assignments = await Assignment.find()
      .sort({ dueDate: 1 });

    // Calculate statistics
    const totalCourses = progress.length;
    const completedCourses = progress.filter(p => p.status === "Completed").length;
    const inProgressCourses = progress.filter(p => p.status === "In Progress").length;
    const droppedCourses = progress.filter(p => p.status === "Dropped").length;

    // Calculate average grade
    const gradeValues = {
      "A+": 4.0, "A": 4.0, "A-": 3.7,
      "B+": 3.3, "B": 3.0, "B-": 2.7,
      "C+": 2.3, "C": 2.0, "C-": 1.7,
      "D+": 1.3, "D": 1.0, "F": 0.0
    };

    const validGrades = progress.filter(p => p.overallGrade !== "—" && p.status === "Completed");
    let averageGrade = 0;
    if (validGrades.length > 0) {
      const totalPoints = validGrades.reduce((sum, p) => sum + (gradeValues[p.overallGrade] || 0), 0);
      averageGrade = (totalPoints / validGrades.length).toFixed(2);
    }

    // Assignment statistics
    const totalAssignments = assignments.length;
    const submittedAssignments = assignments.filter(a => a.status === "Submitted").length;
    const pendingAssignments = assignments.filter(a => a.status === "Pending" || a.status === "Not Started").length;

    const report = {
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
      },
      progress: {
        totalCourses,
        completedCourses,
        inProgressCourses,
        droppedCourses,
        averageGrade,
        courses: progress.map(p => ({
          courseCode: p.courseCode,
          courseTitle: p.courseTitle,
          assignments: p.assignments,
          quizzes: p.quizzes,
          midterm: p.midterm,
          final: p.final,
          overallGrade: p.overallGrade,
          status: p.status,
          semester: p.semester,
          year: p.year,
        })),
      },
      assignments: {
        total: totalAssignments,
        submitted: submittedAssignments,
        pending: pendingAssignments,
        details: assignments.map(a => ({
          title: a.title,
          courseCode: a.courseCode,
          status: a.status,
          score: a.score,
          totalMarks: a.totalMarks,
          dueDate: a.dueDate,
        })),
      },
      generatedAt: new Date().toISOString(),
    };

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all students progress summary (for teacher dashboard)
router.get("/all-students", async (req, res) => {
  try {
    const students = await User.find({ role: "Student" });
    const progress = await Progress.find().populate("studentId", "name email");

    const studentsSummary = students.map(student => {
      const studentProgress = progress.filter(p => p.studentId._id.toString() === student._id.toString());
      const totalCourses = studentProgress.length;
      const completedCourses = studentProgress.filter(p => p.status === "Completed").length;
      
      // Calculate average progress percentage
      let avgProgress = 0;
      if (totalCourses > 0) {
        const totalProgress = studentProgress.reduce((sum, p) => {
          const courseProgress = (p.assignments * 0.3 + p.quizzes * 0.3 + p.midterm * 0.2 + p.final * 0.2);
          return sum + courseProgress;
        }, 0);
        avgProgress = Math.round(totalProgress / totalCourses);
      }

      return {
        id: student._id,
        name: student.name,
        email: student.email,
        totalCourses,
        completedCourses,
        progress: avgProgress,
      };
    });

    res.json(studentsSummary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

