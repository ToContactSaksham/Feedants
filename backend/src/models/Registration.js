const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema(
  {
    competition: { type: mongoose.Schema.Types.ObjectId, ref: 'Competition', required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    status: { type: String, enum: ['active', 'cancelled'], default: 'active', index: true },

    // Payment (mocked - Razorpay is the provider on the reference design).
    // In production this would be created as 'pending' before the payment
    // gateway call, then flipped to 'paid' by a verified webhook - never
    // trusted from the client directly.
    paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded', 'failed'], default: 'paid' },
    paymentId: { type: String },
    amountPaid: { type: Number, required: true },

    referralCodeUsed: { type: String },
  },
  { timestamps: true }
);

// A user may only hold ONE *active* registration per competition. This is
// the safety net that makes double-registration (e.g. two rapid taps,
// retried requests) impossible even if the application-level check races.
// It's a PARTIAL index so a cancelled registration doesn't block the same
// user from registering again later.
registrationSchema.index(
  { competition: 1, user: 1 },
  { unique: true, partialFilterExpression: { status: 'active' } }
);

module.exports = mongoose.model('Registration', registrationSchema);
