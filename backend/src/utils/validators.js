// Never trust the LLM blindly - even with a good prompt, models sometimes
// invent an enum value or leave required-ish fields malformed. This file
// re-validates every record AFTER the AI returns it, and coerces/blanks
// anything that breaks the CRM contract, so a bad model response can never
// corrupt data downstream.

const {
  CRM_FIELDS,
  ALLOWED_CRM_STATUS,
  ALLOWED_DATA_SOURCE,
} = require("../config/crmSchema");

function isValidDate(value) {
  if (!value) return true; // empty is allowed
  const d = new Date(value);
  return !Number.isNaN(d.getTime());
}

/**
 * Cleans one AI-returned record in place (returns a new object).
 * Never throws - always returns a safe, schema-shaped record.
 */
function sanitizeRecord(rawRecord = {}) {
  const clean = {};

  for (const field of CRM_FIELDS) {
    clean[field] = typeof rawRecord[field] === "string" ? rawRecord[field].trim() : "";
  }

  if (!ALLOWED_CRM_STATUS.includes(clean.crm_status)) {
    clean.crm_status = "";
  }

  if (!ALLOWED_DATA_SOURCE.includes(clean.data_source)) {
    clean.data_source = "";
  }

  if (!isValidDate(clean.created_at)) {
    clean.created_at = "";
  }

  return clean;
}

/**
 * A record is only genuinely importable if it has an email OR a phone
 * number, per the assignment's "skip rule" - re-checked independently of
 * whatever the AI decided, as a safety net.
 */
function hasContactInfo(record) {
  return Boolean(record.email) || Boolean(record.mobile_without_country_code);
}

module.exports = { sanitizeRecord, hasContactInfo };
