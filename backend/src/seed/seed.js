/**
 * Seeds the database with:
 *  - a demo user (demo@feedants.com / password123) already registered
 *  - the "Feedants Classical Dance" competition from the design reference
 *
 * Dates are generated RELATIVE TO NOW so that whoever runs this gets a
 * live, functional demo (registration open now, closing soon; submission
 * opening after that, etc.) instead of a competition that's already in
 * the past. Run again any time to reset to a fresh "just opened" state.
 *
 * Usage: npm run seed   (from backend/)
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const mongoose = require('mongoose');
const User = require('../models/User');
const Competition = require('../models/Competition');
const Registration = require('../models/Registration');

function daysFromNow(days, hours = 0) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(d.getHours() + hours);
  return d;
}

async function run() {
  await connectDB();

  console.log('[seed] clearing existing demo data...');
  await Promise.all([
    Competition.deleteMany({ slug: 'feedants-classical-dance' }),
    User.deleteMany({ email: 'demo@feedants.com' }),
  ]);

  console.log('[seed] creating demo user...');
  const passwordHash = await bcrypt.hash('password123', 10);
  const demoUser = await User.create({ name: 'Demo Participant', email: 'demo@feedants.com', passwordHash });

  console.log('[seed] creating competition...');
  const competition = await Competition.create({
    title: 'Feedants Classical Dance',
    slug: 'feedants-classical-dance',
    category: ['Dance'],
    tags: ['Multi-Win'],
    hasCertificate: true,
    prizePool: 1500,
    entryFee: 99,
    maxSpots: 20,
    bookedSpots: 0, // will be incremented by the registration below, same as production flow
    judge: {
      name: 'Manju Dubey',
      title: 'Professional Kathak Dancer',
      experience: '12+ Years of Experience',
      photoUrl: 'https://example.com/judges/manju-dubey.jpg',
      introVideoUrl: 'https://example.com/videos/manju-dubey-intro.mp4',
    },
    importantDates: {
      registrationStart: daysFromNow(-2),
      registrationEnd: daysFromNow(1, 6), // "closes in ~1d 6h", matching the reference screenshot's countdown
      submissionStart: daysFromNow(2, 6),
      submissionEnd: daysFromNow(22, 6),
      resultDate: daysFromNow(24, 6),
    },
    aboutDescription:
      'This is an online classical dance competition open for all age groups. Participate from anywhere and showcase your talent. Express your passion through traditional dance. Solo performances only, up to 3 minutes in length, in any recognized classical Indian dance form (Kathak, Bharatanatyam, Odissi, Kuchipudi, Manipuri, Mohiniyattam, or Kathakali).',
    judgingParameters:
      'Technique and form (30%), expression and storytelling (25%), rhythm and musicality (20%), costume and presentation (15%), originality (10%).',
    rulesAndEligibility:
      'Open to all age groups and skill levels. One entry per participant. Entry must be an original, unedited recording of a single continuous performance. By submitting, participants grant Feedants a license to display the entry for judging and promotional purposes.',
    rewards: [
      { position: 1, label: '1st Winner', amount: 550 },
      { position: 2, label: '2nd Winner', amount: 300 },
      { position: 3, label: '3rd Winner', amount: 240 },
      { position: 4, label: '4th Winner', amount: 200 },
      { position: 5, label: '5th Winner', amount: 130 },
      { position: 6, label: '6th Winner', amount: 80 },
    ],
    previousWinners: [
      { name: 'Riya Shah', position: 1, positionLabel: '1st Winner', photoUrl: 'https://example.com/winners/riya-shah.jpg', videoUrl: 'https://example.com/winners/riya-shah.mp4' },
      { name: 'Aarav Mehta', position: 1, positionLabel: '1st Winner', photoUrl: 'https://example.com/winners/aarav-mehta.jpg', videoUrl: 'https://example.com/winners/aarav-mehta.mp4' },
      { name: 'Neha Verma', position: 2, positionLabel: '2nd Winner', photoUrl: 'https://example.com/winners/neha-verma.jpg', videoUrl: 'https://example.com/winners/neha-verma.mp4' },
      { name: 'Ishita Chopra', position: 3, positionLabel: '3rd Winner', photoUrl: 'https://example.com/winners/ishita-chopra.jpg', videoUrl: 'https://example.com/winners/ishita-chopra.mp4' },
    ],
    referral: { enabled: true, earningPerSignup: 10 },
    disclaimer: 'Only contributions from paid participants will be considered for judging.',
    status: 'published',
  });

  console.log('[seed] registering demo user (via the same atomic path as the API)...');
  await Competition.updateOne({ _id: competition._id }, { $inc: { bookedSpots: 1 } });
  await Registration.create({
    competition: competition._id,
    user: demoUser._id,
    amountPaid: competition.entryFee,
    paymentStatus: 'paid',
    paymentId: 'SEED_MOCK_PAYMENT',
  });

  console.log('\n[seed] Done!');
  console.log('  Competition slug:', competition.slug);
  console.log('  Demo login: demo@feedants.com / password123');
  console.log('  -> GET /api/competitions/feedants-classical-dance');

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error('[seed] failed:', err);
  process.exit(1);
});
