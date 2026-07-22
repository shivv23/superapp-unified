const logger = {
  info: (...args) => console.log(`[${new Date().toISOString()}] INFO:`, ...args),
  warn: (...args) => console.warn(`[${new Date().toISOString()}] WARN:`, ...args),
  error: (...args) => console.error(`[${new Date().toISOString()}] ERROR:`, ...args),
};

function notFound(req, res, _next) {
  res.status(404).json({
    success: false,
    error: { code: "NOT_FOUND", message: `Route ${req.method} ${req.originalUrl} not found` },
  });
}

function errorHandler(err, _req, res, _next) {
  logger.error(err.message, err.stack);
  res.status(err.status || 500).json({
    success: false,
    error: { code: err.code || "INTERNAL_ERROR", message: err.message || "Internal server error" },
  });
}

module.exports = { logger, notFound, errorHandler };
