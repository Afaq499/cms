// routes/degreeRoutes.js
const express = require("express");
const Degree = require("../models/Degree");
const router = express.Router();

// Get all degrees
router.get("/", async (req, res) => {
  try {
    const degrees = await Degree.find().sort({ name: 1 });
    res.json({ degrees, count: degrees.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while fetching degrees" });
  }
});

// Get single degree by ID
router.get("/:id", async (req, res) => {
  try {
    const degree = await Degree.findById(req.params.id);
    
    if (!degree) {
      return res.status(404).json({ error: "Degree not found" });
    }
    
    res.json({ degree });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while fetching degree" });
  }
});

// Create new degree
router.post("/", async (req, res) => {
  try {
    const { name, code, description, duration, courses } = req.body;

    // Validation
    if (!name || !code) {
      return res.status(400).json({ 
        error: "Please provide name and code" 
      });
    }

    // Check if degree already exists
    const existingDegree = await Degree.findOne({ 
      $or: [{ name }, { code: code.toUpperCase() }] 
    });
    
    if (existingDegree) {
      return res.status(400).json({ 
        error: "Degree with this name or code already exists" 
      });
    }

    // Create new degree
    const degree = new Degree({
      name,
      code: code.toUpperCase(),
      description,
      duration: duration || 4,
      courses: courses || [],
    });

    await degree.save();

    res.status(201).json({ 
      message: "Degree created successfully", 
      degree 
    });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(400).json({ error: "Degree name or code already exists" });
    }
    res.status(500).json({ error: "Server error while creating degree" });
  }
});

// Update degree
router.put("/:id", async (req, res) => {
  try {
    const { name, code, description, duration, courses } = req.body;

    const degree = await Degree.findById(req.params.id);

    if (!degree) {
      return res.status(404).json({ error: "Degree not found" });
    }

    // Check if name or code is being changed and if it already exists
    if (name && name !== degree.name) {
      const existingName = await Degree.findOne({ name });
      if (existingName) {
        return res.status(400).json({ error: "Degree name already exists" });
      }
    }

    if (code && code.toUpperCase() !== degree.code) {
      const existingCode = await Degree.findOne({ code: code.toUpperCase() });
      if (existingCode) {
        return res.status(400).json({ error: "Degree code already exists" });
      }
    }

    // Update fields
    if (name) degree.name = name;
    if (code) degree.code = code.toUpperCase();
    if (description !== undefined) degree.description = description;
    if (duration) degree.duration = duration;
    if (courses !== undefined) degree.courses = courses;

    await degree.save();

    res.json({ 
      message: "Degree updated successfully", 
      degree 
    });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(400).json({ error: "Degree name or code already exists" });
    }
    res.status(500).json({ error: "Server error while updating degree" });
  }
});

// Add course to degree
router.post("/:id/courses", async (req, res) => {
  try {
    const { code, title, type, creditHours, semester, group } = req.body;

    if (!code || !title || !type || !creditHours || !semester) {
      return res.status(400).json({ 
        error: "Please provide code, title, type, creditHours, and semester" 
      });
    }

    const degree = await Degree.findById(req.params.id);

    if (!degree) {
      return res.status(404).json({ error: "Degree not found" });
    }

    // Check if course code already exists in this degree
    const existingCourse = degree.courses.find(c => c.code === code);
    if (existingCourse) {
      return res.status(400).json({ error: "Course code already exists in this degree" });
    }

    degree.courses.push({
      code,
      title,
      type,
      creditHours,
      semester,
      group: group || "",
    });

    await degree.save();

    res.status(201).json({ 
      message: "Course added successfully", 
      degree 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while adding course" });
  }
});

// Update course in degree
router.put("/:id/courses/:courseId", async (req, res) => {
  try {
    const { code, title, type, creditHours, semester, group } = req.body;

    const degree = await Degree.findById(req.params.id);

    if (!degree) {
      return res.status(404).json({ error: "Degree not found" });
    }

    const course = degree.courses.id(req.params.courseId);

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    // Check if course code is being changed and if it already exists
    if (code && code !== course.code) {
      const existingCourse = degree.courses.find(c => c.code === code && c._id.toString() !== req.params.courseId);
      if (existingCourse) {
        return res.status(400).json({ error: "Course code already exists in this degree" });
      }
    }

    // Update course fields
    if (code) course.code = code;
    if (title) course.title = title;
    if (type) course.type = type;
    if (creditHours) course.creditHours = creditHours;
    if (semester) course.semester = semester;
    if (group !== undefined) course.group = group;

    await degree.save();

    res.json({ 
      message: "Course updated successfully", 
      degree 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while updating course" });
  }
});

// Delete course from degree
router.delete("/:id/courses/:courseId", async (req, res) => {
  try {
    const degree = await Degree.findById(req.params.id);

    if (!degree) {
      return res.status(404).json({ error: "Degree not found" });
    }

    const course = degree.courses.id(req.params.courseId);

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    course.deleteOne();
    await degree.save();

    res.json({ 
      message: "Course deleted successfully", 
      degree 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while deleting course" });
  }
});

// Delete degree
router.delete("/:id", async (req, res) => {
  try {
    const degree = await Degree.findByIdAndDelete(req.params.id);

    if (!degree) {
      return res.status(404).json({ error: "Degree not found" });
    }

    res.json({ message: "Degree deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while deleting degree" });
  }
});

module.exports = router;

