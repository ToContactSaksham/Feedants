const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');
const { validateRegisterBody, validateLoginBody } = require('../validators/validators');

function signToken(user) {
  return jwt.sign({ sub: user._id.toString() }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  validateRegisterBody(req.body);
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) throw ApiError.conflict('An account with this email already exists', 'EMAIL_TAKEN');

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email: email.toLowerCase(), passwordHash });

  res.status(201).json({ success: true, data: { token: signToken(user), user: user.toPublicJSON() } });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  validateLoginBody(req.body);
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw ApiError.badRequest('Invalid email or password', 'INVALID_CREDENTIALS');

  const ok = await user.comparePassword(password);
  if (!ok) throw ApiError.badRequest('Invalid email or password', 'INVALID_CREDENTIALS');

  res.json({ success: true, data: { token: signToken(user), user: user.toPublicJSON() } });
});

// GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { user: req.user.toPublicJSON ? req.user.toPublicJSON() : req.user } });
});

module.exports = { register, login, getMe };
