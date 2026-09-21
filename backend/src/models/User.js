const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    referralCode: { type: String, unique: true, index: true },
    walletBalance: { type: Number, default: 0 }, // referral earnings, in rupees
  },
  { timestamps: true }
);

userSchema.pre('save', function generateReferralCode(next) {
  if (!this.referralCode) {
    this.referralCode = crypto.randomBytes(4).toString('hex');
  }
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.passwordHash);
};

userSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    referralCode: this.referralCode,
    walletBalance: this.walletBalance,
  };
};

module.exports = mongoose.model('User', userSchema);
