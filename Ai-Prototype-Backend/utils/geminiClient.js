const { GoogleGenerativeAI } = require("@google/generative-ai");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const GEMINI_FALLBACK_MODELS = (process.env.GEMINI_FALLBACK_MODELS || "gemini-2.5-flash-lite,gemini-1.5-flash")
  .split(",")
  .map((m) => m.trim())
  .filter(Boolean);

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

async function generateChatResponse(prompt) {
  if (!GEMINI_API_KEY) {
    throw new Error("Gemini API key is not configured");
  }

  const modelsToTry = [GEMINI_MODEL, ...GEMINI_FALLBACK_MODELS.filter((m) => m !== GEMINI_MODEL)];
  let lastError;

  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return {
        text: response.text() || "",
        model: modelName,
      };
    } catch (error) {
      lastError = error;
      const isQuotaError = error.status === 429 || (error.message || "").includes("429");
      const isModelUnavailable =
        (error.message || "").includes("404") ||
        (error.message || "").includes("not found");

      if (isQuotaError || isModelUnavailable) {
        console.warn(`Gemini model "${modelName}" unavailable, trying next...`);
        continue;
      }
      throw error;
    }
  }

  throw lastError;
}

function parseJsonFromResponse(text) {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonText = fenced ? fenced[1].trim() : trimmed;
  return JSON.parse(jsonText);
}

module.exports = {
  generateChatResponse,
  parseJsonFromResponse,
  isGeminiConfigured: () => Boolean(GEMINI_API_KEY),
};
