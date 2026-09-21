const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema(
  {
    position: { type: Number, required: true }, // 1, 2, 3...
    label: { type: String, required: true }, // "1st Winner"
    amount: { type: Number, required: true },
  },
  { _id: false }
);

const winnerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    position: { type: Number, required: true },
    positionLabel: { type: String, required: true }, // "1st Winner", "2nd Winner"...
    photoUrl: { type: String },
    videoUrl: { type: String },
  },
  { _id: false }
);

const judgeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    title: { type: String }, // "Professional Kathak Dancer"
    experience: { type: String }, // "12+ Years of Experience"
    photoUrl: { type: String },
    introVideoUrl: { type: String },
  },
  { _id: false }
);

const importantDatesSchema = new mongoose.Schema(
  {
    registrationStart: { type: Date, required: true },
    registrationEnd: { type: Date, required: true },
    submissionStart: { type: Date, required: true },
    submissionEnd: { type: Date, required: true },
    resultDate: { type: Date, required: true },
  },
  { _id: false }
);

const competitionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true, lowercase: true },
    category: { type: [String], default: [] }, // e.g. ["Dance"]
    tags: { type: [String], default: [] }, // e.g. ["Multi-Win"]
    hasCertificate: { type: Boolean, default: false },

    prizePool: { type: Number, required: true, min: 0 },
    entryFee: { type: Number, required: true, min: 0 },

    // Capacity. bookedSpots is mutated ONLY via atomic $inc operations
    // guarded by $expr conditions (see registrationController) - never via
    // a read-modify-write in application code, to stay correct under
    // concurrent requests.
    maxSpots: { type: Number, required: true, min: 1 },
    bookedSpots: { type: Number, default: 0, min: 0 },

    judge: judgeSchema,
    importantDates: { type: importantDatesSchema, required: true },

    aboutDescription: { type: String, default: '' },
    judgingParameters: { type: String, default: '' },
    rulesAndEligibility: { type: String, default: '' },

    rewards: { type: [rewardSchema], default: [] },
    previousWinners: { type: [winnerSchema], default: [] },

    referral: {
      enabled: { type: Boolean, default: true },
      earningPerSignup: { type: Number, default: 0 },
    },

    disclaimer: { type: String, default: '' },

    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'published', index: true },
  },
  { timestamps: true }
);

competitionSchema.index({ status: 1, 'importantDates.registrationEnd': 1 });

module.exports = mongoose.model('Competition', competitionSchema);
