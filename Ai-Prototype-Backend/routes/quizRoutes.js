const express = require("express");
const router = express.Router();
const Quiz = require("../models/Quiz");
const QuizSubmission = require("../models/QuizSubmission");
const Assignment = require("../models/Assignment");
const User = require("../models/User");

// GET all quizzes
router.get("/", async (req, res) => {
  try {
    const quizzes = await Quiz.find()
      .populate("createdBy", "name email")
      .sort({ scheduledDate: 1 });
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET quizzes by course code
router.get("/course/:courseCode", async (req, res) => {
  try {
    const quizzes = await Quiz.find({ courseCode: req.params.courseCode })
      .populate("createdBy", "name email")
      .sort({ scheduledDate: 1 });
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET quiz by ID
router.get("/:id", async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate("createdBy", "name email");
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST create new quiz
router.post("/", async (req, res) => {
  try {
    const quiz = new Quiz(req.body);
    const savedQuiz = await quiz.save();
    await savedQuiz.populate("createdBy", "name email");

    // Create assignments for all students when a teacher schedules a quiz
    try {
      // Get all students
      const students = await User.find({ role: "Student" });
      
      // Create an assignment for each student based on the quiz
      const assignments = students.map((student) => ({
        assignmentNumber: `Quiz-${savedQuiz._id.toString().slice(-6)}`,
        title: savedQuiz.title,
        courseCode: savedQuiz.courseCode,
        courseName: savedQuiz.courseName,
        dueDate: savedQuiz.scheduledDate,
        totalMarks: savedQuiz.totalMarks,
        description: savedQuiz.description || `Quiz: ${savedQuiz.title}`,
        instructions: savedQuiz.instructions || `Complete the quiz scheduled for ${new Date(savedQuiz.scheduledDate).toLocaleDateString()} at ${savedQuiz.scheduledTime}`,
        studentId: student._id,
        teacherId: savedQuiz.createdBy,
        status: "Not Started",
      }));

      // Insert all assignments
      if (assignments.length > 0) {
        await Assignment.insertMany(assignments);
      }
    } catch (assignmentError) {
      // Log error but don't fail the quiz creation
      console.error("Error creating assignments from quiz:", assignmentError);
    }

    res.status(201).json(savedQuiz);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT update quiz
router.put("/:id", async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("createdBy", "name email");
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }
    res.json(quiz);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE quiz
router.delete("/:id", async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndDelete(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }
    res.json({ message: "Quiz deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ========== QUIZ SUBMISSION ROUTES ==========

// Start a quiz (create submission)
router.post("/:id/start", async (req, res) => {
  try {
    const { id } = req.params;
    const studentId = req.body.studentId;

    if (!studentId) {
      return res.status(400).json({ message: "Student ID is required" });
    }

    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    // Check if submission already exists
    const existingSubmission = await QuizSubmission.findOne({ quizId: id, studentId });
    if (existingSubmission) {
      return res.json(existingSubmission);
    }

    // Create new submission
    const submission = new QuizSubmission({
      quizId: id,
      studentId,
      answers: [],
      totalMarks: quiz.totalMarks,
      status: "In Progress",
      startedAt: new Date(),
    });

    await submission.save();
    await submission.populate("studentId", "name email");
    res.status(201).json(submission);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get submission for a student
router.get("/:id/submission/:studentId", async (req, res) => {
  try {
    const { id, studentId } = req.params;
    const submission = await QuizSubmission.findOne({ quizId: id, studentId })
      .populate("studentId", "name email")
      .populate("quizId");
    
    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }
    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Submit quiz answers
router.post("/:id/submit", async (req, res) => {
  try {
    const { id } = req.params;
    const { studentId, answers } = req.body;

    if (!studentId || !answers) {
      return res.status(400).json({ message: "Student ID and answers are required" });
    }

    const submission = await QuizSubmission.findOne({ quizId: id, studentId });
    if (!submission) {
      return res.status(404).json({ message: "Submission not found. Please start the quiz first." });
    }

    if (submission.status === "Submitted" || submission.status === "Graded") {
      return res.status(400).json({ message: "Quiz already submitted" });
    }

    submission.answers = answers;
    submission.status = "Submitted";
    submission.submittedAt = new Date();

    await submission.save();
    res.json(submission);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all submissions for a quiz (for teachers)
router.get("/:id/submissions", async (req, res) => {
  try {
    const { id } = req.params;
    const submissions = await QuizSubmission.find({ quizId: id })
      .populate("studentId", "name email studentId")
      .sort({ submittedAt: -1 });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Grade a quiz submission
router.post("/:id/grade/:submissionId", async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { score, remarks } = req.body;

    if (score === undefined || score === null) {
      return res.status(400).json({ message: "Score is required" });
    }

    const submission = await QuizSubmission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    submission.score = score;
    submission.remarks = remarks || "";
    submission.status = "Graded";
    submission.gradedAt = new Date();

    await submission.save();
    await submission.populate("studentId", "name email");
    await submission.populate("quizId");

    res.json(submission);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;

