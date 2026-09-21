const express = require('express');
const authRoutes = require('./authRoutes');
const competitionRoutes = require('./competitionRoutes');

const router = express.Router();

router.get('/health', (req, res) => res.json({ success: true, data: { status: 'ok', time: new Date().toISOString() } }));

router.use('/auth', authRoutes);
router.use('/competitions', competitionRoutes);

module.exports = router;
