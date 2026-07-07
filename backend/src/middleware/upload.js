// Configures multer to accept a single CSV file in memory (no disk writes -
// we're a stateless service, per the assignment's "optional database" note).

const multer = require("multer");

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB - generous for a CSV
  fileFilter: (req, file, cb) => {
    const isCsv =
      file.mimetype === "text/csv" ||
      file.mimetype === "application/vnd.ms-excel" ||
      file.originalname.toLowerCase().endsWith(".csv");

    if (!isCsv) {
      return cb(new Error("Only .csv files are accepted"));
    }
    cb(null, true);
  },
});

module.exports = upload;
