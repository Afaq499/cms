const mongoose = require("mongoose");

const topicSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    sourceUrl: { type: String, required: true, trim: true },
    sourceName: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const learningRecommendationSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseCode: { type: String, required: true, trim: true },
    courseTitle: { type: String, required: true, trim: true },
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },
    quizTitle: { type: String, required: true, trim: true },
    quizSubmissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QuizSubmission",
      required: true,
    },
    scorePercent: { type: Number, required: true, min: 0, max: 100 },
    topics: { type: [topicSchema], default: [] },
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

learningRecommendationSchema.index({ studentId: 1, generatedAt: -1 });
learningRecommendationSchema.index({ quizSubmissionId: 1 }, { unique: true });

module.exports = mongoose.model("LearningRecommendation", learningRecommendationSchema);
