const express = require("express");
const upload = require("../middleware/upload");
const { handleImport } = require("../controllers/importController");

const router = express.Router();

// upload.single("file") -> req.file is populated by multer before handleImport runs
router.post("/import", upload.single("file"), handleImport);

module.exports = router;
