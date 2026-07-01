const LearningRecommendation = require("../models/LearningRecommendation");
const QuizSubmission = require("../models/QuizSubmission");
const { generateChatResponse, parseJsonFromResponse, isGeminiConfigured } = require("./geminiClient");

const PASS_THRESHOLD = 70;

function buildAnswerMap(answers) {
  const map = {};
  (answers || []).forEach((entry) => {
    map[entry.questionId] = entry.answer;
  });
  return map;
}

function analyzeQuizSubmission(quiz, submission) {
  const answerMap = buildAnswerMap(submission.answers);
  let score = 0;
  const wrongQuestions = [];
  let hasManualQuestions = false;

  for (const question of quiz.questions || []) {
    const studentAnswer = answerMap[question.questionId];
    const isAutoGradable =
      question.type === "multiple-choice" || question.type === "true-false";

    if (!isAutoGradable) {
      hasManualQuestions = true;
      continue;
    }

    const isCorrect =
      String(studentAnswer ?? "").trim() === String(question.correctAnswer).trim();

    if (isCorrect) {
      score += question.marks;
    } else {
      wrongQuestions.push({
        question: question.question,
        type: question.type,
        studentAnswer: studentAnswer ?? "Not answered",
        correctAnswer: question.correctAnswer,
      });
    }
  }

  return { score, wrongQuestions, hasManualQuestions };
}

function buildRecommendationPrompt({ quiz, scorePercent, wrongQuestions, courseTitle }) {
  const wrongSummary =
    wrongQuestions.length > 0
      ? wrongQuestions
          .map(
            (q, i) =>
              `${i + 1}. Question: "${q.question}" | Student answered: "${q.studentAnswer}" | Correct: "${q.correctAnswer}"`
          )
          .join("\n")
      : "No specific wrong answers available — recommend foundational topics for this quiz.";

  return `You are an educational AI tutor helping a university student improve after a low quiz score.

Course: ${courseTitle} (${quiz.courseCode})
Quiz: ${quiz.title}
Score: ${scorePercent}% (below passing threshold of ${PASS_THRESHOLD}%)

Questions the student got wrong:
${wrongSummary}

Generate 3 to 5 specific learning topic recommendations to help the student improve.
Each recommendation must include a real, working URL to a reputable free learning resource
(e.g. Khan Academy, W3Schools, MDN, GeeksforGeeks, Coursera free articles, official documentation).

Return ONLY a valid JSON array with this exact structure (no markdown, no extra text):
[
  {
    "title": "Topic name",
    "description": "One sentence explaining why this topic will help",
    "sourceUrl": "https://...",
    "sourceName": "Website name"
  }
]`;
}

async function generateLearningRecommendations({ quiz, submission, scorePercent, wrongQuestions }) {
  if (!isGeminiConfigured()) {
    console.warn("Gemini not configured — skipping learning recommendations");
    return null;
  }

  const prompt = buildRecommendationPrompt({
    quiz,
    scorePercent,
    wrongQuestions,
    courseTitle: quiz.courseName || quiz.courseCode,
  });

  const { text } = await generateChatResponse(prompt);
  const parsed = parseJsonFromResponse(text);

  if (!Array.isArray(parsed)) {
    throw new Error("AI response was not a JSON array");
  }

  return parsed
    .filter((item) => item.title && item.sourceUrl)
    .slice(0, 5)
    .map((item) => ({
      title: String(item.title).trim(),
      description: String(item.description || "").trim(),
      sourceUrl: String(item.sourceUrl).trim(),
      sourceName: String(item.sourceName || "Learning Resource").trim(),
    }));
}

async function createRecommendationIfNeeded(submission, quiz) {
  if (!submission.score && submission.score !== 0) return null;
  if (submission.status !== "Graded") return null;

  const scorePercent = Math.round((submission.score / submission.totalMarks) * 100);
  if (scorePercent >= PASS_THRESHOLD) return null;

  const existing = await LearningRecommendation.findOne({
    quizSubmissionId: submission._id,
  });
  if (existing) return existing;

  const { wrongQuestions } = analyzeQuizSubmission(quiz, submission);

  let topics;
  try {
    topics = await generateLearningRecommendations({
      quiz,
      submission,
      scorePercent,
      wrongQuestions,
    });
  } catch (error) {
    console.error("Failed to generate learning recommendations:", error.message);
    topics = wrongQuestions.slice(0, 3).map((q) => ({
      title: `Review: ${q.question.slice(0, 80)}`,
      description: `You answered "${q.studentAnswer}" but the correct answer was "${q.correctAnswer}".`,
      sourceUrl: "https://www.khanacademy.org/",
      sourceName: "Khan Academy",
    }));
  }

  if (!topics || topics.length === 0) return null;

  const recommendation = await LearningRecommendation.create({
    studentId: submission.studentId,
    courseCode: quiz.courseCode,
    courseTitle: quiz.courseName || quiz.courseCode,
    quizId: quiz._id,
    quizTitle: quiz.title,
    quizSubmissionId: submission._id,
    scorePercent,
    topics,
  });

  return recommendation;
}

async function getStudentRecommendations(studentId) {
  return LearningRecommendation.find({ studentId })
    .sort({ generatedAt: -1 })
    .lean();
}

async function backfillMissingRecommendations(studentId) {
  const submissions = await QuizSubmission.find({
    studentId,
    status: "Graded",
    score: { $ne: null },
  }).populate("quizId");

  for (const submission of submissions) {
    if (!submission.quizId) continue;
    const scorePercent = Math.round(
      (submission.score / submission.totalMarks) * 100
    );
    if (scorePercent >= PASS_THRESHOLD) continue;

    const exists = await LearningRecommendation.findOne({
      quizSubmissionId: submission._id,
    });
    if (!exists) {
      await createRecommendationIfNeeded(submission, submission.quizId);
    }
  }
}

module.exports = {
  PASS_THRESHOLD,
  analyzeQuizSubmission,
  createRecommendationIfNeeded,
  getStudentRecommendations,
  backfillMissingRecommendations,
};
