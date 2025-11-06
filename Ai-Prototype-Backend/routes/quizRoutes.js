const express = require("express");
const router = express.Router();
const Quiz = require("../models/Quiz");

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

module.exports = router;

