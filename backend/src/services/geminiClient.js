// Thin wrapper around Google's Gemini REST API using plain fetch, so we
// don't need an extra SDK dependency. Same job as groqClient.js: take a
// prompt + batch of rows, return raw text (expected JSON).

const config = require("../config");

async function callGemini(systemPrompt, rowsBatch) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.gemini.model}:generateContent?key=${config.gemini.apiKey}`;

  const body = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `Map these rows. Return ONLY a JSON array, one result per row, same order as input.\n\nINPUT ROWS:\n${JSON.stringify(
              rowsBatch
            )}`,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0,
      responseMimeType: "application/json",
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  return data.candidates[0].content.parts[0].text;
}

module.exports = { callGemini };
