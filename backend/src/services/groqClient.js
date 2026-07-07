// Thin wrapper around the Groq SDK (OpenAI-compatible chat completions).
// Kept separate from aiExtractor.js so swapping providers never touches
// prompt/parsing logic - only this file (or geminiClient.js) changes.

const Groq = require("groq-sdk");
const config = require("../config");

const client = new Groq({ apiKey: config.groq.apiKey });

/**
 * @param {string} systemPrompt
 * @param {object[]} rowsBatch - raw CSV rows for this batch
 * @returns {Promise<string>} raw text response from the model (expected JSON)
 */
async function callGroq(systemPrompt, rowsBatch) {
  const completion = await client.chat.completions.create({
    model: config.groq.model,
    temperature: 0, // deterministic mapping, not creative writing
    response_format: { type: "json_object" }, // ask Groq to force valid JSON
    messages: [
      { role: "system", content: systemPrompt },
      {
        // Groq's json_object mode requires a single JSON object at the
        // top level, so we wrap our array under a "rows" key and unwrap
        // it again in aiExtractor.js.
        role: "user",
        content: `Map these rows. Return {"results": [...]} with one result
per row, same order as input.\n\nINPUT ROWS:\n${JSON.stringify(rowsBatch)}`,
      },
    ],
  });

  return completion.choices[0].message.content;
}

module.exports = { callGroq };
