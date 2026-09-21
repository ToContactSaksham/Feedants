const mongoose = require('mongoose');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Competition = require('../models/Competition');
const Registration = require('../models/Registration');
const Submission = require('../models/Submission');
const { getCompetitionState, getUserCta } = require('../utils/competitionLifecycle');

function findByIdOrSlug(idOrSlug) {
  if (mongoose.isValidObjectId(idOrSlug)) {
    return Competition.findOne({ _id: idOrSlug, status: 'published' }).lean();
  }
  return Competition.findOne({ slug: idOrSlug, status: 'published' }).lean();
}

/**
 * Shapes the raw DB document + derived state into exactly what the
 * Competition Details screen needs, so the client never has to duplicate
 * business logic (spots math, date math, CTA logic) itself.
 */
async function buildCompetitionPayload(competition, user) {
  const now = new Date();
  const state = getCompetitionState(competition, now);

  let registration = null;
  let submission = null;
  if (user) {
    [registration, submission] = await Promise.all([
      Registration.findOne({ competition: competition._id, user: user._id, status: 'active' }).lean(),
      Submission.findOne({ competition: competition._id, user: user._id }).lean(),
    ]);
  }

  const cta = getUserCta(state, registration, submission);

  return {
    id: competition._id,
    slug: competition.slug,
    title: competition.title,
    category: competition.category,
    tags: competition.tags,
    hasCertificate: competition.hasCertificate,
    prizePool: competition.prizePool,
    entryFee: competition.entryFee,
    judge: competition.judge,
    importantDates: competition.importantDates,
    aboutDescription: competition.aboutDescription,
    judgingParameters: competition.judgingParameters,
    rulesAndEligibility: competition.rulesAndEligibility,
    rewards: competition.rewards,
    previousWinners: competition.previousWinners,
    referral: competition.referral,
    disclaimer: competition.disclaimer,

    // Everything below is SERVER-DERIVED, never trust a client-cached copy of it.
    serverTime: now.toISOString(),
    spots: {
      max: state.maxSpots,
      booked: state.spotsBooked,
      left: state.spotsLeft,
      isFull: state.isFull,
    },
    lifecycle: {
      code: state.code,
      label: state.label,
      countdownTarget: state.countdownTarget,
    },
    viewer: {
      isAuthenticated: !!user,
      isRegistered: !!registration,
      hasSubmitted: !!submission,
      registeredAt: registration?.createdAt || null,
      referralCode: user?.referralCode || null,
      submission: submission
        ? { mediaUrl: submission.mediaUrl, mediaType: submission.mediaType, status: submission.status, submittedAt: submission.submittedAt }
        : null,
    },
    cta,
  };
}

// GET /api/competitions/:idOrSlug
const getCompetition = asyncHandler(async (req, res) => {
  const competition = await findByIdOrSlug(req.params.idOrSlug);
  if (!competition) throw ApiError.notFound('Competition not found');

  const payload = await buildCompetitionPayload(competition, req.user);
  res.json({ success: true, data: payload });
});

// GET /api/competitions
const listCompetitions = asyncHandler(async (req, res) => {
  const competitions = await Competition.find({ status: 'published' })
    .select('title slug category tags prizePool entryFee maxSpots bookedSpots importantDates')
    .lean();

  const now = new Date();
  const data = competitions.map((c) => {
    const state = getCompetitionState(c, now);
    return {
      id: c._id,
      slug: c.slug,
      title: c.title,
      category: c.category,
      tags: c.tags,
      prizePool: c.prizePool,
      entryFee: c.entryFee,
      spotsLeft: state.spotsLeft,
      lifecycle: state.code,
    };
  });

  res.json({ success: true, data });
});

module.exports = { getCompetition, listCompetitions, buildCompetitionPayload, findByIdOrSlug };
