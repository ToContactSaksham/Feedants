const rateLimit = require('express-rate-limit');

// General API traffic.
const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

// The registration endpoint is where a "limited spots" competition sees
// bursty, correlated traffic right at open/close time - and it's also the
// endpoint whose result actually matters for consistency, so we rate-limit
// it tighter per-user to blunt double-submit / retry storms before they
// ever reach the DB transaction.
const registerLimiter = rateLimit({
  windowMs: 10 * 1000,
  limit: 3,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id?.toString() || req.ip,
  message: { success: false, code: 'RATE_LIMITED', message: 'Too many attempts, please slow down.' },
});

module.exports = { generalLimiter, registerLimiter };
