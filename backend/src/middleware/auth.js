const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');

function readToken(req) {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) return header.slice(7);
  return null;
}

/** Requires a valid token. Attaches req.user (Mongoose doc, lean-ish). */
const protect = asyncHandler(async (req, res, next) => {
  const token = readToken(req);
  if (!token) throw ApiError.unauthorized('Missing bearer token');

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw ApiError.unauthorized('Invalid or expired token');
  }

  const user = await User.findById(payload.sub).select('_id name email referralCode');
  if (!user) throw ApiError.unauthorized('User no longer exists');

  req.user = user;
  next();
});

/**
 * Attaches req.user if a valid token is present, but does NOT fail the
 * request otherwise. Used on the competition-details GET endpoint, which
 * must work for logged-out visitors too (they just get no personalized
 * participation state).
 */
const optionalAuth = asyncHandler(async (req, res, next) => {
  const token = readToken(req);
  if (!token) return next();

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub).select('_id name email referralCode');
    if (user) req.user = user;
  } catch (err) {
    // Invalid/expired token on an optional-auth route: treat as a guest
    // rather than rejecting the request.
  }
  next();
});

module.exports = { protect, optionalAuth };
