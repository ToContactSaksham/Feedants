const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Registration = require('../models/Registration');
const Submission = require('../models/Submission');
const { getCompetitionState } = require('../utils/competitionLifecycle');
const { findByIdOrSlug, buildCompetitionPayload } = require('./competitionController');
const { UPLOAD_DIR } = require('../middleware/upload');

function mediaTypeFromMime(mime) {
  return mime.startsWith('video/') ? 'video' : 'image';
}

// POST /api/competitions/:idOrSlug/submissions  (multipart/form-data, field "file")
const uploadSubmission = asyncHandler(async (req, res) => {
  const { idOrSlug } = req.params;

  const competition = await findByIdOrSlug(idOrSlug);
  if (!competition) throw ApiError.notFound('Competition not found');

  const state = getCompetitionState(competition);
  if (state.code !== 'SUBMISSION_OPEN') {
    throw ApiError.conflict('The submission window is not currently open for this competition', state.code);
  }

  const registration = await Registration.findOne({ competition: competition._id, user: req.user._id, status: 'active' });
  if (!registration) throw ApiError.forbidden('You must be registered for this competition to submit an entry');

  if (!req.file) throw ApiError.badRequest('No file was uploaded', 'FILE_REQUIRED');

  const mediaUrl = `/${UPLOAD_DIR}/submissions/${req.file.filename}`;

  // Upsert: if the user already submitted and the window is still open,
  // this is a re-submission that replaces the previous entry's metadata.
  const submission = await Submission.findOneAndUpdate(
    { competition: competition._id, user: req.user._id },
    {
      competition: competition._id,
      user: req.user._id,
      registration: registration._id,
      mediaUrl,
      mediaType: mediaTypeFromMime(req.file.mimetype),
      fileSizeBytes: req.file.size,
      originalFileName: req.file.originalname,
      status: 'submitted',
      submittedAt: new Date(),
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  const fresh = await findByIdOrSlug(idOrSlug);
  const payload = await buildCompetitionPayload(fresh, req.user);
  res.status(201).json({ success: true, data: { ...payload, submission } });
});

// GET /api/competitions/:idOrSlug/submissions/me
const getMySubmission = asyncHandler(async (req, res) => {
  const { idOrSlug } = req.params;
  const competition = await findByIdOrSlug(idOrSlug);
  if (!competition) throw ApiError.notFound('Competition not found');

  const submission = await Submission.findOne({ competition: competition._id, user: req.user._id }).lean();
  res.json({ success: true, data: submission || null });
});

module.exports = { uploadSubmission, getMySubmission };
