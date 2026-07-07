// Responsible for ONE thing: turning a raw CSV file (buffer/string)
// into an array of plain JS objects, one per row.
// We deliberately do NOT assume fixed column names here - that mapping
// intelligence lives in aiExtractor.js instead.

const { parse } = require("csv-parse/sync");

/**
 * @param {Buffer|string} csvContent - raw file contents
 * @returns {{ headers: string[], rows: Record<string,string>[] }}
 */
function parseCsv(csvContent) {
  const rows = parse(csvContent, {
    columns: true, // use first row as object keys, whatever they are
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true, // don't crash on ragged rows from messy exports
  });

  const headers = rows.length > 0 ? Object.keys(rows[0]) : [];

  return { headers, rows };
}

module.exports = { parseCsv };
