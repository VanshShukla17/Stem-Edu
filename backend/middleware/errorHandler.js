/**
 * Central Error Handling Middleware
 * Hand-written to return clean JSON with proper HTTP status codes.
 * Omits internal stack traces to ensure security and clean API contracts.
 */
const errorHandler = (err, req, res, next) => {
  // Determine appropriate status code
  let statusCode = 500;
  if (err.statusCode && Number.isInteger(err.statusCode) && err.statusCode >= 400 && err.statusCode < 600) {
    statusCode = err.statusCode;
  } else if (res.statusCode && res.statusCode >= 400 && res.statusCode < 600) {
    statusCode = res.statusCode;
  }

  // Send clean JSON object with message
  res.status(statusCode).json({
    message: err.message || 'An unexpected server error occurred'
  });
};

/**
 * 404 Route Not Found Middleware
 */
const notFoundHandler = (req, res, next) => {
  const error = new Error(`Resource not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

module.exports = {
  errorHandler,
  notFoundHandler
};
