# Feedants — Competition Details Screen (Full Stack Internship Assignment)

A functional, full-stack implementation of the Competition Details screen from the design
reference, built with **React Native (Expo)**, **Node.js + Express**, and **MongoDB**.

Nothing on the screen is hardcoded: spots remaining, the countdown target, which dates are
shown, whether the primary button says "Register Now", "Upload Submission", "Registration
Full", or "Results Declared" — all of it is computed on the backend from raw data (dates,
capacity, registration/submission records) and served to the app.

---

## 1. Project structure

```
feedants-assignment/
├── backend/                    Node.js + Express + MongoDB API
│   ├── src/
│   │   ├── server.js           entrypoint
│   │   ├── app.js              express app (middleware, routes)
│   │   ├── config/db.js        mongoose connection
│   │   ├── models/             Competition, User, Registration, Submission
│   │   ├── controllers/        request handlers / business logic
│   │   ├── routes/             route definitions
│   │   ├── middleware/         auth, rate limiting, error handling, uploads
│   │   ├── utils/               competitionLifecycle.js (state machine), ApiError, asyncHandler
│   │   ├── validators/         request body validation
│   │   └── seed/seed.js        demo data matching the design reference
│   └── package.json
└── frontend/                   React Native (Expo) app
    ├── App.js
    └── src/
        ├── screens/CompetitionDetailsScreen.js
        ├── components/         HeaderCard, JudgeCard, CountdownBanner, ImportantDatesCard,
        │                       PreviousWinnersRow, TabsSection, RewardsCard, ReferEarnCard,
        │                       DisclaimerBanner, BottomActionBar
        ├── hooks/               useCompetitionDetails, useCountdown
        ├── api/                 axios client + competition API calls
        ├── theme/               colors/spacing tokens
        └── utils/format.js
```

---

## 2. Running it

### Backend

```bash
cd backend
cp .env.example .env        # then edit MONGO_URI / JWT_SECRET if needed
npm install
npm run seed                 # creates the demo competition + a demo user, with LIVE relative dates
npm run dev                  # starts on http://localhost:5000
```

Requires a MongoDB instance reachable at `MONGO_URI` — either a local `mongod` or a free
MongoDB Atlas cluster. No other external services are required (payment and file storage are
mocked/local for this assignment — see section 6).

Demo login after seeding: `demo@feedants.com` / `password123` (already registered for the
seeded competition, so you can see the "Registered" / "Upload Submission" states immediately).

Quick check it's alive:
```bash
curl http://localhost:5000/api/health
curl http://localhost:5000/api/competitions/feedants-classical-dance
```

### Frontend

```bash
cd frontend
npm install
npx expo start
```

Then press `i` (iOS simulator), `a` (Android emulator), or scan the QR code with Expo Go.

**Important — API URL on a physical device:** `app.json`'s `expo.extra.apiBaseUrl` defaults to
`http://localhost:5000/api`, which is correct for a simulator/emulator but **not** for a
physical phone in Expo Go (the phone's `localhost` is the phone itself). On a real device,
change that value to `http://<your-computer's-LAN-IP>:5000/api`.

The screen is hardcoded to load the `feedants-classical-dance` slug (see
`CompetitionDetailsScreen.js`) since the assignment scope is this one screen, not a full
competitions list/router.

To log in as the demo user for testing registration/submission, the simplest approach for this
assignment is to obtain a token from `POST /api/auth/login` (e.g. via curl or Postman) and set
it once via the app's AsyncStorage key `feedants_token` — a login screen was intentionally left
out of scope (see Assumptions below).

---

## 3. API reference

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| GET | `/api/health` | — | liveness check |
| POST | `/api/auth/register` | — | create account |
| POST | `/api/auth/login` | — | get a JWT |
| GET | `/api/auth/me` | required | current user |
| GET | `/api/competitions` | optional | list published competitions |
| GET | `/api/competitions/:idOrSlug` | optional | full details + derived lifecycle + viewer state |
| POST | `/api/competitions/:idOrSlug/register` | required | atomically claim a spot + register |
| DELETE | `/api/competitions/:idOrSlug/register` | required | cancel registration, release spot |
| POST | `/api/competitions/:idOrSlug/submissions` | required | upload entry (multipart, field `file`) |
| GET | `/api/competitions/:idOrSlug/submissions/me` | required | fetch own submission |

`GET /api/competitions/:idOrSlug` response shape (trimmed):
```json
{
  "success": true,
  "data": {
    "title": "Feedants Classical Dance",
    "prizePool": 1500, "entryFee": 99,
    "spots": { "max": 20, "booked": 1, "left": 19, "isFull": false },
    "lifecycle": { "code": "REGISTRATION_OPEN", "label": "Registration closes in", "countdownTarget": "2026-09-23T..." },
    "viewer": { "isAuthenticated": true, "isRegistered": true, "hasSubmitted": false },
    "cta": { "action": "NONE", "label": "Registered", "enabled": false }
  }
}
```

---

## 4. Data model

- **Competition** — all static facts (title, prize pool, entry fee, judge, dates, rewards,
  previous winners, rules text) plus `maxSpots`/`bookedSpots`. Everything time- or
  capacity-dependent is *derived*, never stored as a boolean flag, so it can never go stale.
- **User** — auth + a generated `referralCode`.
- **Registration** — one per (competition, user); a **partial unique index** on
  `{competition, user}` where `status: 'active'` prevents double-registration while still
  allowing a user to re-register after cancelling.
- **Submission** — one per (competition, user); re-uploads while the window is open are
  handled as an update (`findOneAndUpdate` with `upsert`), not a new row.

## 5. Business logic & concurrency — the part I spent the most care on

All state derivation lives in **`backend/src/utils/competitionLifecycle.js`**, covered by a
small unit-test suite (13 assertions) I wrote against it directly. Two functions:

- `getCompetitionState(competition, now)` → one of `UPCOMING`, `REGISTRATION_OPEN`,
  `REGISTRATION_FULL`, `REGISTRATION_CLOSED`, `SUBMISSION_OPEN`, `SUBMISSION_CLOSED`,
  `RESULTS_DECLARED` — purely from dates + `bookedSpots` vs `maxSpots`.
- `getUserCta(state, registration, submission)` → what the bottom button should say and do,
  for every combination of competition state × participation state (10+ branches: not
  registered + open, not registered + full, registered + waiting for submission window,
  registered + submission open, submitted + can resubmit, submitted + results declared, etc).

**Concurrency (the "thousands of concurrent users fighting for 20 spots" problem):**
A naive "read `bookedSpots`, check it's `< maxSpots`, then write" has a race: two requests can
both read 19/20, both decide there's room, and both write — overshooting capacity. Instead,
registration does one atomic document operation:

```js
Competition.findOneAndUpdate(
  { _id, $expr: { $lt: ['$bookedSpots', '$maxSpots'] } },
  { $inc: { bookedSpots: 1 } }
)
```

The condition and the increment are evaluated together, atomically, by MongoDB itself — not by
the Node process. However many requests arrive simultaneously, exactly as many succeed as
there is remaining capacity; none can overshoot. If the `Registration` document then fails to
create (most commonly: the user already has one, caught by the partial unique index), the
reserved spot is explicitly given back via a compensating `$inc: -1`, so a failed registration
never permanently burns a spot. The register endpoint is also more tightly rate-limited than
the rest of the API, since it's where correlated, bursty traffic is most likely (a popular
competition's registration window opening or about to close).

## 6. Assumptions

- **Auth is minimal by design.** Email/password + JWT, no refresh tokens, no password
  reset, no login screen in the RN app — the assignment is scoped to the Competition Details
  feature, not a full account system. A real deployment would want refresh tokens and a
  proper login/signup flow.
- **Payment is mocked.** `Registration.paymentStatus` is set straight to `'paid'` with a fake
  `paymentId`. The reference design shows "Secure payments powered by Razorpay"; I modelled the
  schema (`paymentStatus: pending|paid|refunded|failed`, `paymentId`) as if a real gateway sits
  behind it, but did not wire one up, since that's a third-party integration exercise rather
  than the full-stack/data-modelling one this assignment is testing.
- **File storage is local disk (via Multer)**, not object storage — good enough to prove the
  upload → validate-eligibility → persist flow end-to-end without needing AWS/GCP credentials
  to run the assignment. See section 7 for what I'd change.
- **One competition, hardcoded slug on the frontend.** There's no competitions list screen or
  navigation library, since the brief is specifically the Details screen.
- **Referral payouts are not automated.** `referralCodeUsed` is recorded on the Registration,
  and `User.walletBalance` exists as a field, but nothing currently credits it — I'd wire that
  up via the queue described below rather than inline in the request path.

## 7. Trade-offs & what I'd change for a real production system

- **Multi-document transactions.** The register flow uses an atomic single-document update
  (`$expr` + `$inc`) plus a compensating decrement on failure, specifically so this assignment
  runs against a plain standalone `mongod` with zero extra setup. In production, MongoDB
  replica sets (which Atlas gives you by default) support proper multi-document ACID
  transactions — I'd wrap the reserve-spot + create-registration + (eventually) charge-payment
  steps in a single `session.withTransaction(...)`, which removes even the tiny window where a
  crash between the two writes could leave a spot "stuck" reserved without a registration
  (a scheduled reconciliation job is the low-tech mitigation for that window as-is).
- **File uploads via pre-signed URLs.** Local disk storage doesn't scale past one app server.
  I'd move to the client uploading directly to S3/GCS via a short-lived pre-signed URL that the
  backend issues, with the backend only recording metadata after upload — keeps large media
  off the Node process entirely and lets the app tier scale horizontally.
- **Caching hot competition reads.** For a competition seeing bursty traffic, I'd put a
  short-TTL (1-5s) cache in front of the full details payload and serve `spotsLeft` from a
  cheap, separate, uncached read — the two values don't need the same freshness guarantee, and
  decoupling them avoids the "everyone's cache is stale for the thing they actually care about
  right now" problem.
- **Idempotency keys** on the register/submit endpoints, so a client retry after a dropped
  response (e.g. flaky mobile network right as a spot is claimed) can't accidentally double a
  side effect.
- **Async side-effects via a queue** (e.g. BullMQ + Redis) for anything that isn't required to
  answer the request itself — referral payout crediting, confirmation emails/push, generating
  certificates after results — rather than doing them inline and making the user's request
  slower or more failure-prone.
- **Read replicas / indexes at scale.** Current indexes (`{competition, user}` on
  Registration/Submission, `{status, registrationEnd}` on Competition) cover this assignment's
  query patterns; a real system with a large competitions catalog would want to revisit this
  alongside actual query telemetry.
- **Observability.** Structured logging with request IDs, and metrics on registration
  attempt/success/conflict rates specifically, since that's the endpoint most likely to reveal
  a correctness bug under real load.
- **Testing.** I unit-tested the pure lifecycle/state logic (13 assertions, all passing) since
  it's the highest-risk, highest-value code to get right; I did not have a MongoDB instance
  available in the environment I built this in to also write integration tests against the
  live API, which I'd add first if continuing this (in particular: a load test hammering the
  register endpoint concurrently to confirm `bookedSpots` never exceeds `maxSpots` in practice,
  not just in the unit-level reasoning above).

