/**
 * Clean up stale progress records and sync grades from assignments/quizzes.
 *
 * 1. Removes progress rows for courses no longer in the student's degree
 * 2. Creates missing progress rows for current degree courses
 * 3. Recalculates grades from actual assignment & quiz data
 *
 * Run: node syncAllProgress.js
 */
const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = require("./config/db");
const User = require("./models/User");
const Degree = require("./models/Degree");
const Progress = require("./models/Progress");
const { syncStudentProgress } = require("./utils/progressCalculator");

async function cleanupStudentProgress(student) {
  if (!student.degree) {
    return { deleted: 0, created: 0 };
  }

  const degree = await Degree.findOne({ name: student.degree });
  if (!degree?.courses?.length) {
    return { deleted: 0, created: 0 };
  }

  const validCodes = degree.courses.map((c) => c.code);
  const currentYear = new Date().getFullYear();

  const deleteResult = await Progress.deleteMany({
    studentId: student._id,
    courseCode: { $nin: validCodes },
  });

  let created = 0;

  for (const course of degree.courses) {
    let record = await Progress.findOne({
      studentId: student._id,
      courseCode: course.code,
    });

    if (!record) {
      await Progress.create({
        studentId: student._id,
        courseCode: course.code,
        courseTitle: course.title,
        semester: `Semester ${course.semester}`,
        year: currentYear,
        status: "In Progress",
      });
      created += 1;
    } else if (record.courseTitle !== course.title) {
      record.courseTitle = course.title;
      record.semester = `Semester ${course.semester}`;
      await record.save();
    }
  }

  return { deleted: deleteResult.deletedCount, created };
}

async function syncAllProgress() {
  await connectDB();

  const students = await User.find({ role: "Student" });
  console.log(`Processing ${students.length} student(s)...\n`);

  for (const student of students) {
    const { deleted, created } = await cleanupStudentProgress(student);
    const records = await syncStudentProgress(student._id);

    console.log(`${student.name}:`);
    if (deleted > 0) console.log(`  - removed ${deleted} stale course(s)`);
    if (created > 0) console.log(`  + added ${created} missing course(s)`);
    console.log(`  = ${records.length} course(s) in progress`);
    records.forEach((r) => {
      const parts = [];
      if (r.assignments != null) parts.push(`assignments ${r.assignments}%`);
      if (r.quizzes != null) parts.push(`quizzes ${r.quizzes}%`);
      console.log(`    ${r.courseCode} | ${r.courseTitle} | ${parts.join(", ") || "no grades yet"}`);
    });
    console.log();
  }

  console.log("Done.");
  await mongoose.connection.close();
}

syncAllProgress().catch((err) => {
  console.error(err);
  process.exit(1);
});
