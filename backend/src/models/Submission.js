const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema(
  {
    competition: { type: mongoose.Schema.Types.ObjectId, ref: 'Competition', required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    registration: { type: mongoose.Schema.Types.ObjectId, ref: 'Registration', required: true },

    mediaUrl: { type: String, required: true },
    mediaType: { type: String, enum: ['video', 'image'], required: true },
    fileSizeBytes: { type: Number },
    originalFileName: { type: String },

    status: { type: String, enum: ['submitted', 'under_review', 'approved', 'rejected'], default: 'submitted' },
    reviewerNote: { type: String },

    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// One submission slot per user per competition. Re-submitting while the
// window is open is handled as an *update* (upsert) of this same document
// rather than creating duplicates.
submissionSchema.index({ competition: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Submission', submissionSchema);
