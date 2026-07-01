const express = require("express");
const router = express.Router();
const Progress = require("../models/Progress");
const Assignment = require("../models/Assignment");
const User = require("../models/User");
const Quiz = require("../models/Quiz");
const QuizSubmission = require("../models/QuizSubmission");
const { syncStudentProgress } = require("../utils/progressCalculator");
const {
  getStudentRecommendations,
  backfillMissingRecommendations,
} = require("../utils/learningRecommendationService");

const gradeValues = {
  "A+": 4.0, "A": 4.0, "A-": 3.7,
  "B+": 3.3, "B": 3.0, "B-": 2.7,
  "C+": 2.3, "C": 2.0, "C-": 1.7,
  "D+": 1.3, "D": 1.0, "F": 0.0,
};

async function buildStudentReportData(studentId) {
  const student = await User.findOne({ _id: studentId, role: "Student" }).select("-password");
  if (!student) return null;

  const courses = await syncStudentProgress(studentId);
  const courseCodes = courses.map((c) => c.courseCode);

  await backfillMissingRecommendations(studentId);
  const recommendations = await getStudentRecommendations(studentId);

  const assignments = courseCodes.length
    ? await Assignment.find({
        courseCode: { $in: courseCodes },
        $or: [{ studentId }, { studentId: null }],
      }).sort({ dueDate: -1 })
    : [];

  const quizSubmissions = await QuizSubmission.find({ studentId })
    .populate("quizId")
    .sort({ submittedAt: -1 });

  const quizzes = quizSubmissions.map((sub) => {
    const quiz = sub.quizId;
    const scorePercent =
      sub.score != null && sub.totalMarks
        ? Math.round((sub.score / sub.totalMarks) * 100)
        : null;
    return {
      id: sub._id,
      quizId: quiz?._id || sub.quizId,
      title: quiz?.title || "Unknown Quiz",
      courseCode: quiz?.courseCode || "—",
      courseName: quiz?.courseName || "—",
      score: sub.score,
      totalMarks: sub.totalMarks,
      scorePercent,
      status: sub.status,
      submittedAt: sub.submittedAt,
      gradedAt: sub.gradedAt,
      remarks: sub.remarks,
    };
  });

  const completedCourses = courses.filter((c) => c.status === "Completed").length;
  const inProgressCourses = courses.filter((c) => c.status === "In Progress").length;
  const droppedCourses = courses.filter((c) => c.status === "Dropped").length;

  const validGrades = courses.filter((c) => c.overallGrade !== "—" && c.status === "Completed");
  let averageGrade = "—";
  if (validGrades.length > 0) {
    const totalPoints = validGrades.reduce(
      (sum, c) => sum + (gradeValues[c.overallGrade] || 0),
      0
    );
    averageGrade = (totalPoints / validGrades.length).toFixed(2);
  }

  const studentAssignments = assignments.filter(
    (a) => a.studentId && a.studentId.toString() === studentId.toString()
  );

  const subjects = courses.map((course) => ({
    courseCode: course.courseCode,
    courseTitle: course.courseTitle,
    semester: course.semester,
    year: course.year,
    scores: {
      assignments: course.assignments ?? null,
      quizzes: course.quizzes ?? null,
      midterm: course.midterm ?? null,
      final: course.final ?? null,
      overallGrade: course.overallGrade,
      status: course.status,
    },
    assignments: assignments
      .filter((a) => a.courseCode === course.courseCode)
      .map((a) => ({
        id: a._id,
        title: a.title,
        assignmentNumber: a.assignmentNumber,
        dueDate: a.dueDate,
        status: a.status,
        score: a.score,
        totalMarks: a.totalMarks,
        submittedDate: a.submittedDate,
        remarks: a.remarks,
        isStudentSubmission:
          a.studentId && a.studentId.toString() === studentId.toString(),
      })),
    quizzes: quizzes.filter((q) => q.courseCode === course.courseCode),
    recommendations: recommendations.filter((r) => r.courseCode === course.courseCode),
  }));

  return {
    student: {
      id: student._id,
      name: student.name,
      email: student.email,
      studentId: student.studentId || null,
      degree: student.degree || null,
      batch: student.batch || null,
    },
    summary: {
      totalCourses: courses.length,
      completedCourses,
      inProgressCourses,
      droppedCourses,
      averageGrade,
      totalQuizzes: quizzes.length,
      gradedQuizzes: quizzes.filter((q) => q.status === "Graded").length,
      totalAssignments: assignments.length,
      submittedAssignments: studentAssignments.filter((a) => a.status === "Submitted").length,
      pendingAssignments: assignments.filter(
        (a) => a.status === "Pending" || a.status === "Not Started"
      ).length,
    },
    subjects,
    generatedAt: new Date().toISOString(),
  };
}

// Generate comprehensive student report
router.get("/student/:studentId", async (req, res) => {
  try {
    const report = await buildStudentReportData(req.params.studentId);
    if (!report) {
      return res.status(404).json({ message: "Student not found" });
    }
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
      
      // Calculate progress as completion percentage
      // Progress = (Completed Courses / Total Courses) * 100
      let progressPercentage = 0;
      if (totalCourses > 0) {
        progressPercentage = Math.round((completedCourses / totalCourses) * 100);
      }

      return {
        id: student._id,
        name: student.name,
        email: student.email,
        studentId: student.studentId || null,
        degree: student.degree || null,
        batch: student.batch || null,
        totalCourses,
        completedCourses,
        progress: progressPercentage,
      };
    });

    res.json(studentsSummary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Detailed student view for teacher (courses, quizzes, assignments, AI recommendations)
router.get("/student-detail/:studentId", async (req, res) => {
  try {
    const report = await buildStudentReportData(req.params.studentId);
    if (!report) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json({
      student: { ...report.student, contact: (await User.findById(req.params.studentId))?.contact || null },
      courses: report.subjects.map((s) => ({
        courseCode: s.courseCode,
        courseTitle: s.courseTitle,
        assignments: s.scores.assignments,
        quizzes: s.scores.quizzes,
        midterm: s.scores.midterm,
        final: s.scores.final,
        overallGrade: s.scores.overallGrade,
        status: s.scores.status,
        semester: s.semester,
        year: s.year,
      })),
      assignments: report.subjects.flatMap((s) => s.assignments),
      quizzes: report.subjects.flatMap((s) => s.quizzes),
      recommendations: report.subjects.flatMap((s) => s.recommendations),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get dashboard statistics for teacher
router.get("/dashboard-stats", async (req, res) => {
  try {
    // Get total students count
    const totalStudents = await User.countDocuments({ role: "Student" });

    // Get quizzes scheduled count (status: "Scheduled")
    const quizzesScheduled = await Quiz.countDocuments({ status: "Scheduled" });

    // Get assignments pending count (status: "Pending" or "Not Started")
    const assignmentsPending = await Assignment.countDocuments({
      status: { $in: ["Pending", "Not Started"] }
    });

    res.json({
      totalStudents,
      quizzesScheduled,
      assignmentsPending,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

