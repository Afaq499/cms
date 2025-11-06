const express = require("express");
const Course = require("../models/course");
const router = express.Router();

// ✅ Get all courses
router.get("/", async (req, res) => {
  try {
    const courses = await Course.find().sort({ semester: 1 });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch courses" });
  }
});


router.post("/", async (req, res) => {
  try {
    let result;
    if (Array.isArray(req.body)) {
      // If request body is an array → insert multiple
      result = await Course.insertMany(req.body);
    } else {
      // If request body is a single object → insert one
      const course = new Course(req.body);
      result = await course.save();
    }
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
