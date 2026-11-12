const express = require('express');
const router = express.Router();
const { completeLesson, getProgress } = require('../controllers/progressController');
const { requireAuth } = require('../middleware/auth');

// Complete a lesson
router.post('/lessons/:id/complete', requireAuth, completeLesson);

// Get user progress summary
router.get('/progress', requireAuth, getProgress);

module.exports = router;

