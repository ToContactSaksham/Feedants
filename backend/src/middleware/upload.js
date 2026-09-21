const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const ApiError = require('../utils/ApiError');

const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';
const MAX_UPLOAD_MB = Number(process.env.MAX_UPLOAD_MB || 50);

const absoluteUploadDir = path.join(process.cwd(), UPLOAD_DIR, 'submissions');
fs.mkdirSync(absoluteUploadDir, { recursive: true });

/**
 * NOTE on production scalability:
 * Writing uploads to local disk works for a single-instance dev/demo setup,
 * but does not scale horizontally (multiple app servers would each have a
 * different local disk). In production this should be replaced with direct
 * client -> object storage (S3/GCS) uploads via a short-lived pre-signed
 * URL that the backend issues, with the backend only ever recording
 * metadata (mediaUrl, size, checksum) after upload. See README "What I'd
 * improve for production".
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, absoluteUploadDir),
  filename: (req, file, cb) => {
    const unique = crypto.randomBytes(8).toString('hex');
    cb(null, `${req.user.id}_${Date.now()}_${unique}${path.extname(file.originalname)}`);
  },
});

const ALLOWED_MIME = ['video/mp4', 'video/quicktime', 'image/jpeg', 'image/png', 'image/webp'];

function fileFilter(req, file, cb) {
  if (!ALLOWED_MIME.includes(file.mimetype)) {
    return cb(ApiError.badRequest(`Unsupported file type: ${file.mimetype}`, 'UNSUPPORTED_MEDIA'));
  }
  cb(null, true);
}

const uploadSubmissionFile = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_UPLOAD_MB * 1024 * 1024 },
}).single('file');

module.exports = { uploadSubmissionFile, absoluteUploadDir, UPLOAD_DIR };
