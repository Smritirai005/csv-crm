# GrowEasy AI CSV Importer

An AI-powered importer that takes a CSV in **any layout** (Facebook Lead Ads,
Google Ads exports, real-estate CRM exports, manual spreadsheets — anything)
and maps it onto a fixed GrowEasy CRM schema, using an LLM to do the
column-mapping intelligence instead of hardcoded column-name rules.

## How it works (the actual idea behind the assignment)

The hard part isn't "parse a CSV" — any library does that. The hard part is:
**the column names are never the same twice.** One export calls it `Phone`,
another calls it `Mobile No`, another calls it `Contact Number (WhatsApp)`.
Hardcoding `if (header === "phone")` breaks on the very next file.

So instead:
1. We parse the CSV into raw JSON rows, keeping whatever headers exist.
2. We hand the AI a carefully engineered prompt: the exact CRM schema, the
   exact allowed enum values for `crm_status` / `data_source`, and worked
   examples of tricky cases (multiple phone numbers, rows with no contact
   info at all).
3. The AI returns each row mapped to the CRM schema, or marked "skipped".
4. We **re-validate everything the AI returns** in code — never trust an LLM
   blindly. If it invents a `crm_status` value that isn't in the allowed
   list, we blank it out rather than let bad data through.

## Architecture

```
frontend/  (Next.js)                backend/  (Node.js + Express)
─────────────────────                ─────────────────────────────
1. Upload CSV (drag/drop)            POST /api/import
2. Parse + preview client-side         → csvParser.js   (CSV -> JSON rows)
   (NO network call yet)               → aiExtractor.js (batches + calls AI)
3. "Confirm Import" button               → groqClient.js / geminiClient.js
   → sends the file to the backend       → validators.js (sanitize output)
4. Show imported vs skipped table     ← { imported: [...], skipped: [...] }
```

**Why this split matters (and is worth saying out loud in an interview):**
- Preview is 100% client-side — the user sees their data instantly with zero
  AI cost, and only pays for AI calls once they've confirmed the file looks
  right.
- The backend is provider-agnostic: `groqClient.js` and `geminiClient.js`
  are two interchangeable ~30-line files. Switching providers is an env var
  change (`AI_PROVIDER=groq` or `gemini`), not a rewrite.
- Batching (`batchProcessor.js`) + retries (`aiExtractor.js`) mean one bad
  AI response (rate limit, malformed JSON, whatever) only fails *that batch*
  of ~15 rows, not the whole import.
- `validators.js` is the safety net: the AI is asked nicely to follow the
  rules in the prompt, but the code independently double-checks enum values,
  date validity, and the "must have email or phone" skip rule before
  anything is called "imported".

## Project structure

```
backend/
  src/
    config/
      index.js         # all env vars, read once
      crmSchema.js      # single source of truth: CRM fields + allowed enums
    prompts/
      systemPrompt.js   # the prompt engineering — read this first
    services/
      csvParser.js      # CSV buffer -> JS objects
      groqClient.js      # calls Groq (OpenAI-compatible)
      geminiClient.js    # calls Gemini
      aiExtractor.js     # batching + retries + orchestration
      batchProcessor.js  # chunk rows into batches
    utils/
      validators.js      # re-validates AI output against crmSchema.js
    controllers/importController.js
    routes/importRoutes.js
    middleware/upload.js, errorHandler.js
    server.js
frontend/
  app/
    page.tsx            # the whole 3-step flow lives here
    layout.tsx, globals.css
  components/
    UploadZone.tsx       # step 1
    PreviewTable.tsx      # step 2
    ResultTable.tsx        # step 4
    StepIndicator.tsx
  lib/
    api.ts               # calls backend
    types.ts
```

## Running locally

### Backend
```bash
cd backend
npm install
cp .env.example .env
# edit .env: set GROQ_API_KEY (https://console.groq.com/keys is free)
npm run dev
# -> http://localhost:8080
```

### Frontend
```bash
cd frontend
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:8080" > .env.local
npm run dev
# -> http://localhost:3000
```

## Getting a free AI API key
- **Groq** (recommended, very fast, generous free tier):
  https://console.groq.com/keys → put it in `backend/.env` as `GROQ_API_KEY`
- **Gemini** (alternative): https://aistudio.google.com/apikey → put it in
  `GEMINI_API_KEY` and set `AI_PROVIDER=gemini`

## Deployment (for the assignment's "hosted URL" requirement)
- **Backend** → Railway or Render (both have a free tier, support Node/Express
  out of the box, and let you set env vars in a dashboard).
- **Frontend** → Vercel (native Next.js support). Set `NEXT_PUBLIC_API_URL`
  to your deployed backend URL in Vercel's project settings.

## What to say when explaining this project
- "The core challenge was schema mapping under unknown/variable column
  names, not CSV parsing itself — so I put the engineering effort into the
  prompt (`systemPrompt.js`) and a validation layer that never trusts the
  model's output blindly (`validators.js`)."
- "Rows are batched (default 15/request) so large CSVs don't blow past
  token limits or a single request timeout, and each batch retries
  independently on failure instead of failing the whole import."
- "The AI provider is swappable — Groq or Gemini — behind one interface,
  so it's not locked into a single vendor."
- "The frontend never calls the AI until the user explicitly confirms,
  which keeps AI cost/usage predictable and gives the user a chance to
  catch a wrong file before it's processed."

## Possible next improvements (bonus points territory)
- Streaming progress per batch (e.g. via Server-Sent Events) instead of one
  blocking request.
- Virtualized table (e.g. `react-window`) for CSVs with tens of thousands
  of rows in the preview step.
- A small test suite for `validators.js` and `csvParser.js` (pure functions,
  easy to unit test).
- Docker Compose file to run both services with one command.
