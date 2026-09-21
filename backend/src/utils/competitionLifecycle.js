/**
 * All "is registration open?", "is submission open?", "how many spots are
 * left?" logic lives here, in one place, so the API and the app never
 * disagree with each other and nothing is hardcoded on the client.
 *
 * The competition document only stores raw facts (dates, capacity, counts).
 * The *state* is always derived at request time from those facts + now().
 */

const COMPETITION_STATE = {
  UPCOMING: 'UPCOMING', // before registration opens
  REGISTRATION_OPEN: 'REGISTRATION_OPEN',
  REGISTRATION_FULL: 'REGISTRATION_FULL', // window open, but spots exhausted
  REGISTRATION_CLOSED: 'REGISTRATION_CLOSED', // window passed, submission not yet open
  SUBMISSION_OPEN: 'SUBMISSION_OPEN',
  SUBMISSION_CLOSED: 'SUBMISSION_CLOSED', // submission window passed, results pending
  RESULTS_DECLARED: 'RESULTS_DECLARED',
};

const PARTICIPATION_STATE = {
  GUEST: 'GUEST', // not authenticated
  NOT_REGISTERED: 'NOT_REGISTERED',
  REGISTERED: 'REGISTERED',
  SUBMITTED: 'SUBMITTED',
};

/**
 * @param {Object} competition - lean competition document
 * @param {Date} [now]
 * @returns {{code:string, label:string, spotsLeft:number, spotsBooked:number,
 *            maxSpots:number, isFull:boolean, countdownTarget:Date|null}}
 */
function getCompetitionState(competition, now = new Date()) {
  const { registrationStart, registrationEnd, submissionStart, submissionEnd, resultDate } =
    competition.importantDates;

  const spotsBooked = competition.bookedSpots ?? 0;
  const maxSpots = competition.maxSpots ?? 0;
  const spotsLeft = Math.max(maxSpots - spotsBooked, 0);
  const isFull = spotsLeft <= 0;

  let code;
  let countdownTarget = null;

  if (now < new Date(registrationStart)) {
    code = COMPETITION_STATE.UPCOMING;
    countdownTarget = registrationStart;
  } else if (now < new Date(registrationEnd)) {
    if (isFull) {
      code = COMPETITION_STATE.REGISTRATION_FULL;
      countdownTarget = registrationEnd;
    } else {
      code = COMPETITION_STATE.REGISTRATION_OPEN;
      countdownTarget = registrationEnd;
    }
  } else if (now < new Date(submissionStart)) {
    code = COMPETITION_STATE.REGISTRATION_CLOSED;
    countdownTarget = submissionStart;
  } else if (now < new Date(submissionEnd)) {
    code = COMPETITION_STATE.SUBMISSION_OPEN;
    countdownTarget = submissionEnd;
  } else if (now < new Date(resultDate)) {
    code = COMPETITION_STATE.SUBMISSION_CLOSED;
    countdownTarget = resultDate;
  } else {
    code = COMPETITION_STATE.RESULTS_DECLARED;
    countdownTarget = null;
  }

  const LABELS = {
    [COMPETITION_STATE.UPCOMING]: 'Registration opens soon',
    [COMPETITION_STATE.REGISTRATION_OPEN]: 'Registration closes in',
    [COMPETITION_STATE.REGISTRATION_FULL]: 'All spots booked',
    [COMPETITION_STATE.REGISTRATION_CLOSED]: 'Submission opens in',
    [COMPETITION_STATE.SUBMISSION_OPEN]: 'Submission closes in',
    [COMPETITION_STATE.SUBMISSION_CLOSED]: 'Results declare in',
    [COMPETITION_STATE.RESULTS_DECLARED]: 'Results declared',
  };

  return {
    code,
    label: LABELS[code],
    spotsBooked,
    maxSpots,
    spotsLeft,
    isFull,
    countdownTarget,
  };
}

/**
 * Derives what the current user's relationship to this competition is,
 * and what the primary call-to-action button should say/do.
 *
 * @param {ReturnType<typeof getCompetitionState>} competitionState
 * @param {{status:string}|null} registration - active registration doc, if any
 * @param {{status:string}|null} submission - submission doc, if any
 */
function getUserCta(competitionState, registration, submission) {
  const { code } = competitionState;

  if (!registration) {
    switch (code) {
      case COMPETITION_STATE.UPCOMING:
        return { participation: PARTICIPATION_STATE.NOT_REGISTERED, action: 'NONE', label: 'Opens soon', enabled: false };
      case COMPETITION_STATE.REGISTRATION_OPEN:
        return { participation: PARTICIPATION_STATE.NOT_REGISTERED, action: 'REGISTER', label: 'Register Now', enabled: true };
      case COMPETITION_STATE.REGISTRATION_FULL:
        return { participation: PARTICIPATION_STATE.NOT_REGISTERED, action: 'NONE', label: 'Registration Full', enabled: false };
      default:
        return { participation: PARTICIPATION_STATE.NOT_REGISTERED, action: 'NONE', label: 'Registration Closed', enabled: false };
    }
  }

  // User has an active registration.
  if (submission) {
    if (code === COMPETITION_STATE.SUBMISSION_OPEN) {
      return { participation: PARTICIPATION_STATE.SUBMITTED, action: 'RESUBMIT', label: 'Update Submission', enabled: true };
    }
    if (code === COMPETITION_STATE.RESULTS_DECLARED) {
      return { participation: PARTICIPATION_STATE.SUBMITTED, action: 'VIEW_RESULTS', label: 'View Results', enabled: true };
    }
    return { participation: PARTICIPATION_STATE.SUBMITTED, action: 'NONE', label: 'Submission Uploaded', enabled: false };
  }

  switch (code) {
    case COMPETITION_STATE.SUBMISSION_OPEN:
      return { participation: PARTICIPATION_STATE.REGISTERED, action: 'UPLOAD_SUBMISSION', label: 'Upload Submission', enabled: true };
    case COMPETITION_STATE.SUBMISSION_CLOSED:
      return { participation: PARTICIPATION_STATE.REGISTERED, action: 'NONE', label: 'Submission Window Missed', enabled: false };
    case COMPETITION_STATE.RESULTS_DECLARED:
      return { participation: PARTICIPATION_STATE.REGISTERED, action: 'VIEW_RESULTS', label: 'View Results', enabled: true };
    default:
      // REGISTRATION_OPEN / REGISTRATION_CLOSED / REGISTRATION_FULL - waiting for submission window
      return { participation: PARTICIPATION_STATE.REGISTERED, action: 'NONE', label: 'Registered', enabled: false };
  }
}

module.exports = { COMPETITION_STATE, PARTICIPATION_STATE, getCompetitionState, getUserCta };
