const { parseCsv } = require("../services/csvParser");
const { extractCrmRecords } = require("../services/aiExtractor");

/**
 * POST /api/import
 * Body: multipart/form-data with field "file" (the CSV)
 * This is the ONLY endpoint the frontend calls, and only after the user
 * clicks "Confirm Import" - CSV preview parsing happens client-side.
 */
async function handleImport(req, res, next) {
  try {
    if (!req.file) {
      const err = new Error("No CSV file uploaded (expected field 'file')");
      err.status = 400;
      throw err;
    }

    const { rows } = parseCsv(req.file.buffer);

    if (rows.length === 0) {
      return res.json({
        total_rows: 0,
        total_imported: 0,
        total_skipped: 0,
        imported: [],
        skipped: [],
      });
    }

    const { imported, skipped } = await extractCrmRecords(rows);

    res.json({
      total_rows: rows.length,
      total_imported: imported.length,
      total_skipped: skipped.length,
      imported,
      skipped,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { handleImport };
