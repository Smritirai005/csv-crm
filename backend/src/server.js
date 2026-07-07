const express = require("express");
const cors = require("cors");
const config = require("./config");
const importRoutes = require("./routes/importRoutes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());

app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/api", importRoutes);

// Must be registered LAST - Express uses arg count to identify error middleware
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`GrowEasy CSV Importer API running on port ${config.port}`);
  console.log(`AI provider: ${config.aiProvider}`);
});
