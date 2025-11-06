const express = require("express");
const router = express.Router();
const Assignment = require("../models/Assignment");

// GET all assignments
router.get("/", async (req, res) => {
  try {
    const assignments = await Assignment.find().sort({ dueDate: 1 });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET assignments by course code
router.get("/course/:courseCode", async (req, res) => {
  try {
    const assignments = await Assignment.find({ 
      courseCode: req.params.courseCode 
    }).sort({ dueDate: 1 });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET assignment by ID
router.get("/:id", async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }
    res.json(assignment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST create new assignment
router.post("/", async (req, res) => {
  try {
    const assignment = new Assignment(req.body);
    const savedAssignment = await assignment.save();
    res.status(201).json(savedAssignment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT update assignment
router.put("/:id", async (req, res) => {
  try {
    const assignment = await Assignment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }
    res.json(assignment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PATCH submit assignment
router.patch("/:id/submit", async (req, res) => {
  try {
    const assignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      {
        status: "Submitted",
        submittedDate: new Date(),
        ...req.body
      },
      { new: true, runValidators: true }
    );
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }
    res.json(assignment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PATCH grade assignment
router.patch("/:id/grade", async (req, res) => {
  try {
    const { score, remarks } = req.body;
    const assignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      { score, remarks },
      { new: true, runValidators: true }
    );
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }
    res.json(assignment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE assignment
router.delete("/:id", async (req, res) => {
  try {
    const assignment = await Assignment.findByIdAndDelete(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }
    res.json({ message: "Assignment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
