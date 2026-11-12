const express = require('express');
const router = express.Router();
const { getLessonSummary } = require('../controllers/summaryController');
const { optionalAuth } = require('../middleware/auth');

// POST /api/lessons/:id/summary
router.post('/lessons/:id/summary', optionalAuth, getLessonSummary);

module.exports = router;

