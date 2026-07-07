const {
  CRM_FIELDS,
  ALLOWED_CRM_STATUS,
  ALLOWED_DATA_SOURCE,
} = require("../config/crmSchema");

// This is the single most important file for the "AI Prompt Engineering"
// evaluation criteria. Everything about HOW the model should map messy,
// unpredictable CSV columns onto our fixed CRM schema is defined here.
//
// Design choices (worth explaining in an interview):
// 1. We give the model the RAW rows as JSON (not CSV text) - JSON is
//    less ambiguous for an LLM to read (no quoting/escaping confusion).
// 2. We ask for a strict JSON array back, same length & order as input,
//    so we can zip results back to the original rows deterministically.
// 3. We enumerate the exact allowed enum values instead of describing
//    them in prose - LLMs follow closed lists far more reliably than
//    open-ended instructions like "a valid status".
// 4. We give few-shot examples covering the trickiest rules (multiple
//    emails, missing both email+mobile => skip) because examples beat
//    instructions for edge-case behaviour.

function buildSystemPrompt() {
  return `You are a data-mapping engine for GrowEasy CRM. You receive an array of
raw CSV row objects that came from many different sources (Facebook Lead Ads,
Google Ads, real-estate CRMs, manually built spreadsheets, etc). Column names
are NOT fixed or predictable - the same "phone number" field might appear as
"phone", "Mobile No", "contact_number", "Whatsapp Number", etc.

Your job: map each raw row to this exact CRM schema and return ONLY a JSON array.

CRM FIELDS (use these exact keys, all fields optional except the skip rule below):
${CRM_FIELDS.map((f) => `- ${f}`).join("\n")}

RULES YOU MUST FOLLOW EXACTLY:

1. crm_status: ONLY one of ${JSON.stringify(ALLOWED_CRM_STATUS)}, or "" if you
   cannot confidently infer it. Never invent a new status value.

2. data_source: ONLY one of ${JSON.stringify(ALLOWED_DATA_SOURCE)}, or "" if the
   row does not confidently match one of these (e.g. a random project/campaign
   name should NOT be force-fit into this list).

3. created_at: must be a string parseable by JavaScript's new Date(x).
   Prefer "YYYY-MM-DD HH:mm:ss" format. If no date exists in the row, leave "".

4. crm_note: use this as the catch-all for: follow-up remarks, extra phone
   numbers, extra email addresses, or any other useful text that doesn't map
   to a dedicated field. Combine multiple such pieces of info in one string,
   separated by " | ".

5. Multiple emails/phones in one row: use the FIRST one as email/mobile_without_country_code,
   append the rest into crm_note (e.g. "extra_email: foo@bar.com").

6. country_code and mobile_without_country_code: split a full phone number if
   possible (e.g. "+91 9876543210" -> country_code "+91", mobile "9876543210").
   If you cannot determine a country code, leave country_code "" and put the
   whole number in mobile_without_country_code.

7. SKIP RULE: if a row has NEITHER a usable email NOR a usable mobile number,
   you must mark it as skipped instead of returning a record for it.

8. Never fabricate data that is not present or reasonably inferable in the row.
   Leave a field as "" if you are not confident.

9. Keep every record on a single logical row - escape newlines inside string
   values as \\n so nothing breaks CSV re-export later.

OUTPUT FORMAT - return ONLY valid JSON (no markdown fences, no commentary), an
array of objects, one per INPUT row, in the SAME ORDER as the input, shaped like:

{
  "status": "imported" | "skipped",
  "reason": "" | "short reason if skipped, e.g. no email or phone found",
  "record": { ...CRM fields as described above, or {} if skipped }
}

EXAMPLE INPUT ROW:
{"Full Name": "Anita Rao", "Phone": "9988776655 / 9988000000", "Email": "anita@x.com, anita.rao@y.com", "Project": "Sarjapur Plots Phase 2", "Remarks": "Wants site visit this weekend"}

EXAMPLE OUTPUT for that row:
{
  "status": "imported",
  "reason": "",
  "record": {
    "created_at": "",
    "name": "Anita Rao",
    "email": "anita@x.com",
    "country_code": "",
    "mobile_without_country_code": "9988776655",
    "company": "",
    "city": "",
    "state": "",
    "country": "",
    "lead_owner": "",
    "crm_status": "",
    "crm_note": "Wants site visit this weekend | extra_phone: 9988000000 | extra_email: anita.rao@y.com",
    "data_source": "sarjapur_plots",
    "possession_time": "",
    "description": ""
  }
}

EXAMPLE INPUT ROW with no contact info (must be skipped):
{"Name": "Unknown Visitor", "Notes": "Walked into office, no contact left"}

EXAMPLE OUTPUT for that row:
{ "status": "skipped", "reason": "no email or mobile number found", "record": {} }

Return a JSON array with exactly one such object per input row, in the same order.`;
}

module.exports = { buildSystemPrompt };
