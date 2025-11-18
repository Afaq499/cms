const express = require("express");
const router = express.Router();
const Progress = require("../models/Progress");
const User = require("../models/User");
const Degree = require("../models/Degree");
const Assignment = require("../models/Assignment");
const Quiz = require("../models/Quiz");
const LectureVideo = require("../models/LectureVideo");
const Gdb = require("../models/Gdb");

// Get student dashboard with all course-related data
router.get("/student/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;

    // Get student info
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Get student's degree
    if (!student.degree) {
      return res.json({
        student: {
          id: student._id,
          name: student.name,
          email: student.email,
          degree: null,
        },
        courses: [],
        message: "Student degree not found",
      });
    }

    // Find the degree in the degree table
    const degree = await Degree.findOne({ name: student.degree });
    if (!degree || !degree.courses || degree.courses.length === 0) {
      return res.json({
        student: {
          id: student._id,
          name: student.name,
          email: student.email,
          degree: student.degree,
        },
        courses: [],
        message: "No courses found for this degree",
      });
    }

    // Get all courses from the student's degree
    const degreeCourses = degree.courses || [];

    // Get student's progress records to enrich course data
    const progressRecords = await Progress.find({ studentId });
    const progressMap = {};
    progressRecords.forEach(progress => {
      progressMap[progress.courseCode] = progress;
    });

    // Get all teachers to find course instructors
    const teachers = await User.find({ role: "Teacher" }).select("-password");
    const courseTeacherMap = {};
    teachers.forEach(teacher => {
      if (teacher.courses && Array.isArray(teacher.courses)) {
        teacher.courses.forEach(courseCode => {
          if (!courseTeacherMap[courseCode]) {
            courseTeacherMap[courseCode] = {
              id: teacher._id,
              name: teacher.name,
              email: teacher.email,
              subject: teacher.subject || "",
              contact: teacher.contact || "",
              gender: teacher.gender || "Male",
            };
          }
        });
      }
    });

    // Get all course codes from degree courses
    const courseCodes = degreeCourses.map(c => c.code);

    // Fetch all related data for these courses
    const [assignments, quizzes, videos, gdbs] = await Promise.all([
      Assignment.find({ courseCode: { $in: courseCodes } })
        .populate("teacherId", "name email")
        .populate("studentId", "name email")
        .sort({ dueDate: 1 }),
      Quiz.find({ courseCode: { $in: courseCodes } })
        .populate("createdBy", "name email")
        .sort({ scheduledDate: 1 }),
      LectureVideo.find({ courseCode: { $in: courseCodes } })
        .populate("createdBy", "name email")
        .sort({ createdAt: -1 }),
      Gdb.find({ courseCode: { $in: courseCodes } })
        .populate("createdBy", "name email")
        .sort({ dueDate: 1 }),
    ]);

    // Group related data by course code
    const assignmentsByCourse = {};
    assignments.forEach(assignment => {
      if (!assignmentsByCourse[assignment.courseCode]) {
        assignmentsByCourse[assignment.courseCode] = [];
      }
      assignmentsByCourse[assignment.courseCode].push({
        id: assignment._id,
        assignmentNumber: assignment.assignmentNumber,
        title: assignment.title,
        dueDate: assignment.dueDate,
        totalMarks: assignment.totalMarks,
        status: assignment.status,
        submittedDate: assignment.submittedDate,
        submissionText: assignment.submissionText,
        score: assignment.score,
        remarks: assignment.remarks,
        description: assignment.description,
        instructions: assignment.instructions,
        teacher: assignment.teacherId ? {
          id: assignment.teacherId._id,
          name: assignment.teacherId.name,
          email: assignment.teacherId.email,
        } : null,
        student: assignment.studentId ? {
          id: assignment.studentId._id,
          name: assignment.studentId.name,
          email: assignment.studentId.email,
        } : null,
      });
    });

    const quizzesByCourse = {};
    quizzes.forEach(quiz => {
      if (!quizzesByCourse[quiz.courseCode]) {
        quizzesByCourse[quiz.courseCode] = [];
      }
      quizzesByCourse[quiz.courseCode].push({
        id: quiz._id,
        title: quiz.title,
        scheduledDate: quiz.scheduledDate,
        scheduledTime: quiz.scheduledTime,
        duration: quiz.duration,
        totalMarks: quiz.totalMarks,
        description: quiz.description,
        instructions: quiz.instructions,
        status: quiz.status,
        createdBy: quiz.createdBy ? {
          id: quiz.createdBy._id,
          name: quiz.createdBy.name,
          email: quiz.createdBy.email,
        } : null,
      });
    });

    const videosByCourse = {};
    videos.forEach(video => {
      if (!videosByCourse[video.courseCode]) {
        videosByCourse[video.courseCode] = [];
      }
      videosByCourse[video.courseCode].push({
        id: video._id,
        title: video.title,
        youtubeUrl: video.youtubeUrl,
        description: video.description,
        duration: video.duration,
        createdBy: video.createdBy ? {
          id: video.createdBy._id,
          name: video.createdBy.name,
          email: video.createdBy.email,
        } : null,
        createdAt: video.createdAt,
      });
    });

    const gdbsByCourse = {};
    gdbs.forEach(gdb => {
      if (!gdbsByCourse[gdb.courseCode]) {
        gdbsByCourse[gdb.courseCode] = [];
      }
      gdbsByCourse[gdb.courseCode].push({
        id: gdb._id,
        title: gdb.title,
        topic: gdb.topic,
        dueDate: gdb.dueDate,
        description: gdb.description,
        status: gdb.status,
        createdBy: gdb.createdBy ? {
          id: gdb.createdBy._id,
          name: gdb.createdBy.name,
          email: gdb.createdBy.email,
        } : null,
      });
    });

    // Build enriched course data from degree courses
    const enrichedCourses = degreeCourses.map(course => {
      const progress = progressMap[course.code] || null;
      const teacher = courseTeacherMap[course.code] || null;

      return {
        progressId: progress ? progress._id : null,
        courseCode: course.code,
        courseTitle: course.title,
        creditHours: course.creditHours || 0,
        type: course.type || "Required",
        semester: course.semester || null,
        group: course.group || "",
        degreeName: degree.name,
        degreeCode: degree.code,
        progress: progress ? {
          assignments: progress.assignments || 0,
          quizzes: progress.quizzes || 0,
          midterm: progress.midterm || 0,
          final: progress.final || 0,
          overallGrade: progress.overallGrade || "—",
          status: progress.status || "In Progress",
          semester: progress.semester,
          year: progress.year,
        } : null,
        teacher: teacher || {
          id: null,
          name: "TBA",
          email: null,
          subject: "",
          contact: "",
          gender: "Male",
        },
        assignments: assignmentsByCourse[course.code] || [],
        quizzes: quizzesByCourse[course.code] || [],
        videos: videosByCourse[course.code] || [],
        gdbs: gdbsByCourse[course.code] || [],
        counts: {
          assignments: (assignmentsByCourse[course.code] || []).length,
          quizzes: (quizzesByCourse[course.code] || []).length,
          videos: (videosByCourse[course.code] || []).length,
          gdbs: (gdbsByCourse[course.code] || []).length,
        },
      };
    });

    res.json({
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        degree: student.degree || null,
        studentId: student.studentId || null,
      },
      courses: enrichedCourses,
    });
  } catch (error) {
    console.error("Error fetching student dashboard:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

