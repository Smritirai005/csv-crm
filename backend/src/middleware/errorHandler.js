// Catches anything thrown/next(err)'d in route handlers so every error
// returns a consistent JSON shape instead of crashing the process or
// leaking a stack trace to the client.

function errorHandler(err, req, res, next) {
  console.error(err);

  const status = err.status || 400;
  res.status(status).json({
    error: true,
    message: err.message || "Something went wrong",
  });
}

module.exports = errorHandler;
