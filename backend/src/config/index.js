// Loads and validates environment variables in ONE place.
// Every other file reads config from here instead of process.env directly.
// This makes the app easy to explain: "all config lives in config/index.js".
require("dotenv").config();

const config = {
  port: process.env.PORT || 8080,
  corsOrigin: process.env.CORS_ORIGIN || "*",

  aiProvider: process.env.AI_PROVIDER || "groq", // "groq" | "gemini"

  groq: {
    apiKey: process.env.GROQ_API_KEY,
    model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
  },

  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
    model: process.env.GEMINI_MODEL || "gemini-2.0-flash",
  },

  batchSize: parseInt(process.env.BATCH_SIZE || "15", 10),
  maxRetries: parseInt(process.env.MAX_RETRIES || "2", 10),
};

module.exports = config;
