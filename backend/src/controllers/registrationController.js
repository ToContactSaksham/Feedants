const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Competition = require('../models/Competition');
const Registration = require('../models/Registration');
const { getCompetitionState } = require('../utils/competitionLifecycle');
const { findByIdOrSlug, buildCompetitionPayload } = require('./competitionController');

/**
 * POST /api/competitions/:idOrSlug/register
 *
 * Concurrency strategy ("thousands of concurrent users" fighting over a
 * capped number of spots):
 *
 * 1. We never do a plain "read bookedSpots, check < maxSpots, then write"
 *    - that has a classic race: two requests can both read 19/20, both
 *      decide there's room, and both write, overshooting capacity.
 *
 * 2. Instead we issue a SINGLE atomic MongoDB update:
 *        findOneAndUpdate(
 *          { _id, $expr: { $lt: ['$bookedSpots', '$maxSpots'] } },
 *          { $inc: { bookedSpots: 1 } }
 *        )
 *    The condition and the increment happen as one atomic document
 *    operation on the server. If two requests arrive at the same instant,
 *    MongoDB serializes them at the document level - only as many can
 *    succeed as there is remaining capacity, full stop. No spot is ever
 *    double-booked, regardless of app-server concurrency or how many
 *    Node instances are running behind a load balancer.
 *
 * 3. We then create the Registration document. If that fails (most
 *    commonly: the user already has an active registration and hits the
 *    partial-unique index), we COMPENSATE by decrementing bookedSpots back
 *    down, so a failed registration never permanently "burns" a spot.
 *
 *    Note: for full ACID guarantees across both writes, a MongoDB
 *    multi-document transaction (replica set / Atlas) is the production
 *    recommendation - see README "What I'd improve for production". The
 *    compensating-decrement approach used here is deliberately
 *    dependency-light so the assignment runs against a plain standalone
 *    mongod with no extra setup.
 */
const registerForCompetition = asyncHandler(async (req, res) => {
  const { idOrSlug } = req.params;

  const competition = await findByIdOrSlug(idOrSlug);
  if (!competition) throw ApiError.notFound('Competition not found');

  const preCheckState = getCompetitionState(competition);
  if (preCheckState.code !== 'REGISTRATION_OPEN') {
    const reason =
      preCheckState.code === 'REGISTRATION_FULL'
        ? 'All spots for this competition are booked'
        : 'Registration is not open for this competition right now';
    throw ApiError.conflict(reason, preCheckState.code);
  }

  // Step 1: atomically reserve a spot. This is the only line that decides
  // whether capacity is available - everything before it was advisory.
  const reserved = await Competition.findOneAndUpdate(
    { _id: competition._id, $expr: { $lt: ['$bookedSpots', '$maxSpots'] } },
    { $inc: { bookedSpots: 1 } },
    { new: true }
  ).lean();

  if (!reserved) {
    throw ApiError.conflict('All spots for this competition were just booked', 'COMPETITION_FULL');
  }

  // Defensive re-check: the registration window could have closed in the
  // tiny gap between our pre-check read and the atomic reserve above.
  const postReserveState = getCompetitionState(reserved);
  if (postReserveState.code !== 'REGISTRATION_OPEN' && postReserveState.code !== 'REGISTRATION_FULL') {
    await Competition.updateOne({ _id: competition._id }, { $inc: { bookedSpots: -1 } });
    throw ApiError.conflict('Registration closed while processing your request', 'REGISTRATION_CLOSED');
  }

  // Step 2: create the registration record.
  try {
    await Registration.create({
      competition: competition._id,
      user: req.user._id,
      amountPaid: competition.entryFee,
      // Mocked payment - a real integration would create this as 'pending',
      // return a Razorpay order, and only flip to 'paid' from a verified
      // server-to-server webhook, never from the client's say-so.
      paymentStatus: 'paid',
      paymentId: `MOCK_${Date.now()}`,
      referralCodeUsed: req.body.referralCode || undefined,
    });
  } catch (err) {
    // Compensate: give the spot back since no registration was actually created.
    await Competition.updateOne({ _id: competition._id }, { $inc: { bookedSpots: -1 } });

    if (err.code === 11000) {
      throw ApiError.conflict('You are already registered for this competition', 'ALREADY_REGISTERED');
    }
    throw err;
  }

  const fresh = await findByIdOrSlug(idOrSlug);
  const payload = await buildCompetitionPayload(fresh, req.user);
  res.status(201).json({ success: true, data: payload });
});

/**
 * DELETE /api/competitions/:idOrSlug/register
 * Cancels an active registration (only while registration window is still
 * open) and releases the spot atomically.
 */
const cancelRegistration = asyncHandler(async (req, res) => {
  const { idOrSlug } = req.params;
  const competition = await findByIdOrSlug(idOrSlug);
  if (!competition) throw ApiError.notFound('Competition not found');

  const state = getCompetitionState(competition);
  if (state.code !== 'REGISTRATION_OPEN' && state.code !== 'REGISTRATION_FULL') {
    throw ApiError.conflict('Registration can no longer be cancelled for this competition', 'CANNOT_CANCEL');
  }

  const registration = await Registration.findOneAndUpdate(
    { competition: competition._id, user: req.user._id, status: 'active' },
    { status: 'cancelled' },
    { new: true }
  );
  if (!registration) throw ApiError.notFound('No active registration found');

  await Competition.updateOne({ _id: competition._id, bookedSpots: { $gt: 0 } }, { $inc: { bookedSpots: -1 } });

  const fresh = await findByIdOrSlug(idOrSlug);
  const payload = await buildCompetitionPayload(fresh, req.user);
  res.json({ success: true, data: payload });
});

module.exports = { registerForCompetition, cancelRegistration };
