const Assignment = require("../models/Assignment");
const Quiz = require("../models/Quiz");
const QuizSubmission = require("../models/QuizSubmission");
const Progress = require("../models/Progress");

function scoreToPercentage(score, totalMarks) {
  if (score == null || !totalMarks) return null;
  return Math.round((score / totalMarks) * 100);
}

function averagePercentages(percentages) {
  const valid = percentages.filter((p) => p != null);
  if (valid.length === 0) return null;
  return Math.round(valid.reduce((sum, value) => sum + value, 0) / valid.length);
}

function percentageToLetterGrade(percent) {
  if (percent == null) return "—";
  if (percent >= 97) return "A+";
  if (percent >= 93) return "A";
  if (percent >= 90) return "A-";
  if (percent >= 87) return "B+";
  if (percent >= 83) return "B";
  if (percent >= 80) return "B-";
  if (percent >= 77) return "C+";
  if (percent >= 73) return "C";
  if (percent >= 70) return "C-";
  if (percent >= 67) return "D+";
  if (percent >= 63) return "D";
  return "F";
}

function categorizeQuiz(quiz) {
  const title = quiz.title.toLowerCase();
  if (title.includes("midterm") || title.includes("mid-term") || title.includes("mid term")) {
    return "midterm";
  }
  if (title.includes("final")) {
    return "final";
  }
  return "quiz";
}

async function calculateCourseGrades(studentId, courseCode) {
  const gradedAssignments = await Assignment.find({
    courseCode,
    studentId,
    score: { $ne: null },
  });

  const assignmentPct = averagePercentages(
    gradedAssignments.map((a) => scoreToPercentage(a.score, a.totalMarks))
  );

  const quizzes = await Quiz.find({ courseCode });
  const quizIds = quizzes.map((q) => q._id);

  const submissions = await QuizSubmission.find({
    studentId,
    quizId: { $in: quizIds },
    status: "Graded",
    score: { $ne: null },
  });

  const submissionMap = {};
  submissions.forEach((submission) => {
    submissionMap[submission.quizId.toString()] = submission;
  });

  const quizPcts = [];
  const midtermPcts = [];
  const finalPcts = [];

  quizzes.forEach((quiz) => {
    const submission = submissionMap[quiz._id.toString()];
    if (!submission) return;

    const pct = scoreToPercentage(submission.score, submission.totalMarks);
    if (pct == null) return;

    const category = categorizeQuiz(quiz);
    if (category === "midterm") {
      midtermPcts.push(pct);
    } else if (category === "final") {
      finalPcts.push(pct);
    } else {
      quizPcts.push(pct);
    }
  });

  return {
    assignments: assignmentPct,
    quizzes: averagePercentages(quizPcts),
    midterm: averagePercentages(midtermPcts),
    final: averagePercentages(finalPcts),
  };
}

function calculateOverallGrade(components) {
  const weights = { assignments: 25, quizzes: 15, midterm: 30, final: 30 };
  let totalWeight = 0;
  let weightedSum = 0;

  for (const [key, weight] of Object.entries(weights)) {
    if (components[key] != null) {
      totalWeight += weight;
      weightedSum += components[key] * weight;
    }
  }

  if (totalWeight === 0) return "—";
  return percentageToLetterGrade(weightedSum / totalWeight);
}

async function syncStudentProgress(studentId) {
  const progressRecords = await Progress.find({ studentId });
  const results = [];

  for (const record of progressRecords) {
    const grades = await calculateCourseGrades(studentId, record.courseCode);

    record.assignments = grades.assignments;
    record.quizzes = grades.quizzes;
    record.midterm = grades.midterm;
    record.final = grades.final;
    record.overallGrade = calculateOverallGrade(grades);
    await record.save();
    results.push(record);
  }

  return results;
}

async function syncProgressForCourse(studentId, courseCode) {
  const record = await Progress.findOne({ studentId, courseCode });
  if (!record) return null;

  const grades = await calculateCourseGrades(studentId, courseCode);
  record.assignments = grades.assignments;
  record.quizzes = grades.quizzes;
  record.midterm = grades.midterm;
  record.final = grades.final;
  record.overallGrade = calculateOverallGrade(grades);
  await record.save();
  return record;
}

module.exports = {
  calculateCourseGrades,
  calculateOverallGrade,
  syncStudentProgress,
  syncProgressForCourse,
  percentageToLetterGrade,
};
