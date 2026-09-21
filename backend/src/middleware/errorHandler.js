const ApiError = require('../utils/ApiError');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // Mongo duplicate key -> surface as a clean 409, not a 500.
  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      code: 'DUPLICATE',
      message: 'This action was already performed (duplicate request).',
    });
  }

  // Mongoose validation errors -> 400 with field-level detail.
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details: Object.fromEntries(
        Object.entries(err.errors).map(([field, e]) => [field, e.message])
      ),
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, code: 'INVALID_ID', message: 'Invalid identifier' });
  }

  const statusCode = err.statusCode || 500;
  const isOperational = err instanceof ApiError || err.isOperational;

  if (!isOperational) {
    // Unexpected/programmer error - log full detail server-side, hide internals from client.
    console.error('[unhandled error]', err);
  }

  res.status(statusCode).json({
    success: false,
    code: err.code || 'INTERNAL_ERROR',
    message: isOperational ? err.message : 'Something went wrong. Please try again.',
    ...(err.details ? { details: err.details } : {}),
  });
}

function notFoundHandler(req, res) {
  res.status(404).json({ success: false, code: 'ROUTE_NOT_FOUND', message: `No route for ${req.method} ${req.originalUrl}` });
}

module.exports = { errorHandler, notFoundHandler };
