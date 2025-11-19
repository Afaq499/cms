const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Progress = require("../models/Progress");
const User = require("../models/User");
const Degree = require("../models/Degree");
const Assignment = require("../models/Assignment");
const Quiz = require("../models/Quiz");
const LectureVideo = require("../models/LectureVideo");
const Gdb = require("../models/Gdb");

// Gemini API Configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// Build system prompt with student context
const buildSystemPrompt = (studentData) => {
  if (!studentData) {
    return `You are an AI assistant for a Course Management System (CMS). Help students with questions about their courses, assignments, quizzes, progress, and other academic matters.`;
  }

  const { student, courses } = studentData;
  let prompt = `You are an AI assistant for a Course Management System (CMS). You are helping a student named ${student.name || "Student"} (Email: ${student.email || "N/A"}, Student ID: ${student.studentId || "N/A"}) enrolled in ${student.degree || "their degree program"}.

Available Courses and Information:
`;

  if (courses && courses.length > 0) {
    courses.forEach((course) => {
      prompt += `\n- ${course.courseCode}: ${course.courseTitle} (${course.creditHours} credit hours, ${course.degreeName || ""})\n`;
      prompt += `  - Assignments: ${course.counts?.assignments || 0}\n`;
      prompt += `  - Quizzes: ${course.counts?.quizzes || 0}\n`;
      prompt += `  - Videos: ${course.counts?.videos || 0}\n`;
      if (course.teacher && course.teacher.name !== "TBA") {
        prompt += `  - Teacher: ${course.teacher.name}${course.teacher.email ? ` (${course.teacher.email})` : ""}\n`;
      }
      if (course.progress) {
        prompt += `  - Progress: Assignments ${course.progress.assignments || 0}, Quizzes ${course.progress.quizzes || 0}, Midterm ${course.progress.midterm || 0}, Final ${course.progress.final || 0}, Overall Grade: ${course.progress.overallGrade || "—"}\n`;
      }
      
      // Add assignment details if any
      if (course.assignments && course.assignments.length > 0) {
        prompt += `  - Assignment Details:\n`;
        course.assignments.slice(0, 5).forEach((assignment) => {
          prompt += `    * ${assignment.title || `Assignment ${assignment.assignmentNumber}`}: Due ${assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : "N/A"}, Status: ${assignment.status || "Pending"}, Score: ${assignment.score !== undefined ? assignment.score : "N/A"}/${assignment.totalMarks || "N/A"}\n`;
        });
      }
      
      // Add quiz details if any
      if (course.quizzes && course.quizzes.length > 0) {
        prompt += `  - Quiz Details:\n`;
        course.quizzes.slice(0, 5).forEach((quiz) => {
          prompt += `    * ${quiz.title}: Scheduled ${quiz.scheduledDate ? new Date(quiz.scheduledDate).toLocaleDateString() : "N/A"}, Duration: ${quiz.duration || "N/A"} mins, Status: ${quiz.status || "Pending"}\n`;
        });
      }
    });
  } else {
    prompt += "\nNo courses found for this student.\n";
  }

  prompt += `\nHelp the student with questions about their courses, assignments, quizzes, progress, grades, deadlines, and other CMS-related queries. Be friendly, helpful, and accurate. If you don't have specific information, guide them on how to find it in the CMS.`;

  return prompt;
};

// Fetch student dashboard data for context
const fetchStudentData = async (studentId) => {
  try {
    // Get student info
    const student = await User.findById(studentId);
    if (!student) {
      return null;
    }

    // Get student's degree
    if (!student.degree) {
      return {
        student: {
          id: student._id,
          name: student.name,
          email: student.email,
          degree: null,
          studentId: student.studentId || null,
        },
        courses: [],
      };
    }

    // Find the degree in the degree table
    const degree = await Degree.findOne({ name: student.degree });
    if (!degree || !degree.courses || degree.courses.length === 0) {
      return {
        student: {
          id: student._id,
          name: student.name,
          email: student.email,
          degree: student.degree,
          studentId: student.studentId || null,
        },
        courses: [],
      };
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
        score: assignment.score,
        remarks: assignment.remarks,
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
        status: quiz.status,
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
        status: gdb.status,
      });
    });

    // Build enriched course data from degree courses
    const enrichedCourses = degreeCourses.map(course => {
      const progress = progressMap[course.code] || null;
      const teacher = courseTeacherMap[course.code] || null;

      return {
        courseCode: course.code,
        courseTitle: course.title,
        creditHours: course.creditHours || 0,
        degreeName: degree.name,
        progress: progress ? {
          assignments: progress.assignments || 0,
          quizzes: progress.quizzes || 0,
          midterm: progress.midterm || 0,
          final: progress.final || 0,
          overallGrade: progress.overallGrade || "—",
          status: progress.status || "In Progress",
        } : null,
        teacher: teacher || {
          name: "TBA",
          email: null,
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

    return {
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        degree: student.degree || null,
        studentId: student.studentId || null,
      },
      courses: enrichedCourses,
    };
  } catch (error) {
    console.error("Error fetching student data for chatbot:", error);
    return null;
  }
};

// Chatbot message endpoint
router.post("/message", async (req, res) => {
  try {
    const { studentId, message } = req.body;

    if (!studentId || !message) {
      return res.status(400).json({ 
        error: "Student ID and message are required" 
      });
    }

    if (!GEMINI_API_KEY || GEMINI_API_KEY === "") {
      return res.status(500).json({ 
        error: "Gemini API key is not configured. Please set GEMINI_API_KEY or GOOGLE_API_KEY in environment variables." 
      });
    }

    // Fetch student data for context
    const studentData = await fetchStudentData(studentId);
    
    // Build system prompt with student context
    const systemPrompt = buildSystemPrompt(studentData);
    const fullPrompt = `${systemPrompt}\n\nStudent Question: ${message}\n\nAssistant Response:`;

    // Generate content using Gemini API
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const botMessage = response.text() || "Sorry, I couldn't understand that. Please try rephrasing your question.";

    res.json({ 
      message: botMessage,
      success: true 
    });
  } catch (error) {
    console.error("Error in chatbot endpoint:", error);
    res.status(500).json({ 
      error: "Internal server error",
      message: error.message || "Failed to generate response",
      details: error.response?.data || error.cause?.message || error.stack
    });
  }
});

module.exports = router;

