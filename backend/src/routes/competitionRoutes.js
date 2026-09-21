const express = require('express');
const { getCompetition, listCompetitions } = require('../controllers/competitionController');
const { registerForCompetition, cancelRegistration } = require('../controllers/registrationController');
const { uploadSubmission, getMySubmission } = require('../controllers/submissionController');
const { protect, optionalAuth } = require('../middleware/auth');
const { registerLimiter } = require('../middleware/rateLimiter');
const { uploadSubmissionFile } = require('../middleware/upload');

const router = express.Router();

// Public (personalized if a token is present) - never hardcoded, always DB + derived state.
router.get('/', listCompetitions);
router.get('/:idOrSlug', optionalAuth, getCompetition);

// Registration (auth required)
router.post('/:idOrSlug/register', protect, registerLimiter, registerForCompetition);
router.delete('/:idOrSlug/register', protect, cancelRegistration);

// Submission (auth required)
router.post('/:idOrSlug/submissions', protect, uploadSubmissionFile, uploadSubmission);
router.get('/:idOrSlug/submissions/me', protect, getMySubmission);

module.exports = router;
