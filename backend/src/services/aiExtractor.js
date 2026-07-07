// The orchestrator: takes ALL parsed CSV rows, batches them, calls whichever
// AI provider is configured, parses + validates the response, and returns
// one unified result: { imported: [...], skipped: [...] }.
//
// This is the file to point to when explaining "how batch processing and
// retries work" - everything else (prompt, provider clients, validators)
// is a small, single-purpose helper this file composes.

const config = require("../config");
const { buildSystemPrompt } = require("../prompts/systemPrompt");
const { callGroq } = require("./groqClient");
const { callGemini } = require("./geminiClient");
const { chunkArray } = require("./batchProcessor");
const { sanitizeRecord, hasContactInfo } = require("../utils/validators");

const SYSTEM_PROMPT = buildSystemPrompt();

/** Strips ```json fences etc, in case a model ignores "no markdown". */
function cleanJsonText(text) {
  return text
    .trim()
    .replace(/^```json/i, "")
    .replace(/^```/, "")
    .replace(/```$/, "")
    .trim();
}

/** Normalizes both providers' shapes into a plain array of {status, reason, record}. */
function extractResultsArray(parsed) {
  if (Array.isArray(parsed)) return parsed; // Gemini: raw array
  if (Array.isArray(parsed.results)) return parsed.results; // Groq: {results: [...]}
  throw new Error("AI response did not contain a results array");
}

/**
 * Calls the configured provider for a single batch, with retries.
 * @param {object[]} batchRows
 * @returns {Promise<object[]>} raw per-row AI decisions, aligned to batchRows order
 */
async function processBatchWithRetries(batchRows) {
  let lastError;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      const rawText =
        config.aiProvider === "gemini"
          ? await callGemini(SYSTEM_PROMPT, batchRows)
          : await callGroq(SYSTEM_PROMPT, batchRows);

      const parsed = JSON.parse(cleanJsonText(rawText));
      const results = extractResultsArray(parsed);

      if (results.length !== batchRows.length) {
        // Model dropped/added rows - treat as a failed attempt and retry,
        // rather than silently misaligning results to the wrong input rows.
        throw new Error(
          `Row count mismatch: sent ${batchRows.length}, got ${results.length}`
        );
      }

      return results;
    } catch (err) {
      lastError = err;
      console.warn(`Batch attempt ${attempt + 1} failed: ${err.message}`);
    }
  }

  // All retries exhausted - fail this batch's rows as "skipped" rather than
  // crashing the whole import. One bad batch shouldn't sink the rest.
  return batchRows.map(() => ({
    status: "skipped",
    reason: `AI processing failed after ${config.maxRetries + 1} attempts: ${lastError.message}`,
    record: {},
  }));
}

/**
 * @param {object[]} rows - parsed CSV rows (raw, arbitrary column names)
 * @returns {Promise<{imported: object[], skipped: object[]}>}
 */
async function extractCrmRecords(rows) {
  const batches = chunkArray(rows, config.batchSize);
  const imported = [];
  const skipped = [];

  // Batches run sequentially to stay well within provider rate limits and
  // keep behaviour predictable; could be Promise.all'd for more speed if
  // the provider's rate limit allows it.
  for (const batch of batches) {
    const results = await processBatchWithRetries(batch);

    results.forEach((result, i) => {
      const originalRow = batch[i];

      if (result.status !== "imported") {
        skipped.push({
          original_row: originalRow,
          reason: result.reason || "skipped by AI",
        });
        return;
      }

      const record = sanitizeRecord(result.record);

      // Belt-and-suspenders: re-check the skip rule ourselves even though
      // the AI already decided "imported".
      if (!hasContactInfo(record)) {
        skipped.push({
          original_row: originalRow,
          reason: "no email or mobile number found",
        });
        return;
      }

      imported.push(record);
    });
  }

  return { imported, skipped };
}

module.exports = { extractCrmRecords };
