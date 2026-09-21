const ApiError = require('../utils/ApiError');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateRegisterBody(body) {
  const { name, email, password } = body;
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    throw ApiError.badRequest('Name must be at least 2 characters', 'INVALID_NAME');
  }
  if (!email || !EMAIL_RE.test(email)) {
    throw ApiError.badRequest('A valid email is required', 'INVALID_EMAIL');
  }
  if (!password || password.length < 6) {
    throw ApiError.badRequest('Password must be at least 6 characters', 'INVALID_PASSWORD');
  }
}

function validateLoginBody(body) {
  const { email, password } = body;
  if (!email || !EMAIL_RE.test(email)) {
    throw ApiError.badRequest('A valid email is required', 'INVALID_EMAIL');
  }
  if (!password) {
    throw ApiError.badRequest('Password is required', 'INVALID_PASSWORD');
  }
}

module.exports = { validateRegisterBody, validateLoginBody };
