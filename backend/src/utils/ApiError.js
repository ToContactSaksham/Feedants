/**
 * Standard operational error used across controllers so the error handler
 * middleware can respond with a consistent shape and correct status code.
 */
class ApiError extends Error {
  constructor(statusCode, message, code = undefined, details = undefined) {
    super(message);
    this.statusCode = statusCode;
    this.code = code; // machine-readable error code for the client, e.g. 'COMPETITION_FULL'
    this.details = details;
    this.isOperational = true;
  }

  static badRequest(message, code, details) {
    return new ApiError(400, message, code, details);
  }
  static unauthorized(message = 'Not authenticated') {
    return new ApiError(401, message, 'UNAUTHORIZED');
  }
  static forbidden(message = 'Not allowed to perform this action') {
    return new ApiError(403, message, 'FORBIDDEN');
  }
  static notFound(message = 'Resource not found') {
    return new ApiError(404, message, 'NOT_FOUND');
  }
  static conflict(message, code, details) {
    return new ApiError(409, message, code, details);
  }
}

module.exports = ApiError;
