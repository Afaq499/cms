// routes/adminRoutes.js
const express = require("express");
const User = require("../models/User");
const Progress = require("../models/Progress");
const Degree = require("../models/Degree");
const router = express.Router();

// ==================== STUDENT ROUTES ====================

// Get all students
router.get("/students", async (req, res) => {
  try {
    const students = await User.find({ role: "Student" })
      .select("-password")
      .sort({ createdAt: -1 });
    
    res.json({ students, count: students.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while fetching students" });
  }
});

// Get single student by ID
router.get("/students/:id", async (req, res) => {
  try {
    const student = await User.findOne({ 
      _id: req.params.id, 
      role: "Student" 
    }).select("-password");
    
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }
    
    res.json({ student });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while fetching student" });
  }
});

// Add new student
router.post("/students", async (req, res) => {
  try {
    const { name, email, password, degree, studentId, address, contact, gender, batch, courses } = req.body;

    // Validation
    if (!name || !email || !password || !degree || !studentId) {
      return res.status(400).json({ 
        error: "Please provide name, email, password, degree, and studentId" 
      });
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Check if studentId already exists
    const existingStudentId = await User.findOne({ studentId });
    if (existingStudentId) {
      return res.status(400).json({ error: "Student ID already exists" });
    }

    // Create new student
    const student = new User({
      name,
      email,
      password,
      role: "Student",
      degree,
      studentId,
      address,
      contact,
      gender,
      batch,
    });

    await student.save();
    
    // Assign selected courses to the student
    if (courses && Array.isArray(courses) && courses.length > 0 && degree) {
      try {
        const degreeData = await Degree.findOne({ name: degree });
        if (degreeData && degreeData.courses) {
          const currentYear = new Date().getFullYear();
          
          // Create progress records for selected courses
          for (const courseCode of courses) {
            const course = degreeData.courses.find(c => c.code === courseCode);
            if (course) {
              // Check if progress record already exists
              const existingProgress = await Progress.findOne({
                studentId: student._id,
                courseCode: course.code,
              });

              if (!existingProgress) {
                await Progress.create({
                  studentId: student._id,
                  courseCode: course.code,
                  courseTitle: course.title,
                  semester: `Semester ${course.semester}`,
                  year: currentYear,
                  status: "In Progress",
                });
              }
            }
          }
        }
      } catch (progressError) {
        console.error("Error assigning courses to student:", progressError);
        // Don't fail the student creation if course assignment fails
      }
    }
    
    // Remove password from response
    const studentResponse = student.toObject();
    delete studentResponse.password;

    res.status(201).json({ 
      message: "Student added successfully", 
      student: studentResponse 
    });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(400).json({ error: "Email or Student ID already exists" });
    }
    res.status(500).json({ error: "Server error while adding student" });
  }
});

// Update student
router.put("/students/:id", async (req, res) => {
  try {
    const { name, degree, studentId, address, contact, gender, batch, email, courses } = req.body;

    // Check if student exists
    const student = await User.findOne({ 
      _id: req.params.id, 
      role: "Student" 
    });

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Check if email is being changed and if it already exists
    if (email && email !== student.email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({ error: "Email already registered" });
      }
    }

    // Check if studentId is being changed and if it already exists
    if (studentId && studentId !== student.studentId) {
      const existingStudentId = await User.findOne({ studentId });
      if (existingStudentId) {
        return res.status(400).json({ error: "Student ID already exists" });
      }
    }

    // Update fields
    if (name) student.name = name;
    if (email) student.email = email;
    if (degree) student.degree = degree;
    if (studentId) student.studentId = studentId;
    if (address !== undefined) student.address = address;
    if (contact) student.contact = contact;
    if (gender) student.gender = gender;
    if (batch) student.batch = batch;

    await student.save();

    // Update course assignments if courses array is provided
    if (courses !== undefined && Array.isArray(courses) && degree) {
      try {
        const degreeData = await Degree.findOne({ name: degree });
        if (degreeData && degreeData.courses) {
          const currentYear = new Date().getFullYear();
          
          // Get existing progress records
          const existingProgress = await Progress.find({ studentId: student._id });
          const existingCourseCodes = existingProgress.map(p => p.courseCode);
          
          // Add new courses
          for (const courseCode of courses) {
            if (!existingCourseCodes.includes(courseCode)) {
              const course = degreeData.courses.find(c => c.code === courseCode);
              if (course) {
                await Progress.create({
                  studentId: student._id,
                  courseCode: course.code,
                  courseTitle: course.title,
                  semester: `Semester ${course.semester}`,
                  year: currentYear,
                  status: "In Progress",
                });
              }
            }
          }
          
          // Remove courses that are no longer selected (optional - you may want to keep existing ones)
          // Uncomment the following if you want to remove unselected courses:
          /*
          for (const existingCode of existingCourseCodes) {
            if (!courses.includes(existingCode)) {
              await Progress.deleteOne({
                studentId: student._id,
                courseCode: existingCode,
              });
            }
          }
          */
        }
      } catch (progressError) {
        console.error("Error updating courses for student:", progressError);
        // Don't fail the student update if course assignment fails
      }
    }

    // Remove password from response
    const studentResponse = student.toObject();
    delete studentResponse.password;

    res.json({ 
      message: "Student updated successfully", 
      student: studentResponse 
    });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(400).json({ error: "Email or Student ID already exists" });
    }
    res.status(500).json({ error: "Server error while updating student" });
  }
});

// Delete student
router.delete("/students/:id", async (req, res) => {
  try {
    const student = await User.findOneAndDelete({ 
      _id: req.params.id, 
      role: "Student" 
    });

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json({ message: "Student deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while deleting student" });
  }
});

// ==================== TEACHER ROUTES ====================

// Get all teachers
router.get("/teachers", async (req, res) => {
  try {
    const teachers = await User.find({ role: "Teacher" })
      .select("-password")
      .sort({ createdAt: -1 });
    
    res.json({ teachers, count: teachers.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while fetching teachers" });
  }
});

// Get single teacher by ID
router.get("/teachers/:id", async (req, res) => {
  try {
    const teacher = await User.findOne({ 
      _id: req.params.id, 
      role: "Teacher" 
    }).select("-password");
    
    if (!teacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }
    
    res.json({ teacher });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while fetching teacher" });
  }
});

// Add new teacher
router.post("/teachers", async (req, res) => {
  try {
    const { name, email, password, subject, contact, courses } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ 
        error: "Please provide name, email, and password" 
      });
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Create new teacher
    const teacher = new User({
      name,
      email,
      password,
      role: "Teacher",
      subject,
      contact,
      courses: courses && Array.isArray(courses) ? courses : [],
    });

    await teacher.save();
    
    // Remove password from response
    const teacherResponse = teacher.toObject();
    delete teacherResponse.password;

    res.status(201).json({ 
      message: "Teacher added successfully", 
      teacher: teacherResponse 
    });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(400).json({ error: "Email already exists" });
    }
    res.status(500).json({ error: "Server error while adding teacher" });
  }
});

// Update teacher
router.put("/teachers/:id", async (req, res) => {
  try {
    const { name, subject, email, contact, courses } = req.body;

    // Check if teacher exists
    const teacher = await User.findOne({ 
      _id: req.params.id, 
      role: "Teacher" 
    });

    if (!teacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    // Check if email is being changed and if it already exists
    if (email && email !== teacher.email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({ error: "Email already registered" });
      }
    }

    // Update fields
    if (name) teacher.name = name;
    if (email) teacher.email = email;
    if (subject !== undefined) teacher.subject = subject;
    if (contact !== undefined) teacher.contact = contact;
    if (courses !== undefined && Array.isArray(courses)) {
      teacher.courses = courses;
    }

    await teacher.save();

    // Remove password from response
    const teacherResponse = teacher.toObject();
    delete teacherResponse.password;

    res.json({ 
      message: "Teacher updated successfully", 
      teacher: teacherResponse 
    });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(400).json({ error: "Email already exists" });
    }
    res.status(500).json({ error: "Server error while updating teacher" });
  }
});

// Delete teacher
router.delete("/teachers/:id", async (req, res) => {
  try {
    const teacher = await User.findOneAndDelete({ 
      _id: req.params.id, 
      role: "Teacher" 
    });

    if (!teacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    res.json({ message: "Teacher deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while deleting teacher" });
  }
});

module.exports = router;

