const express = require('express');
const router = express.Router();
const {
  getChapterTest,
  submitChapterTest,
  getResults,
  getResultById
} = require('../controllers/practiceController');
const { requireAuth } = require('../middleware/auth');

// Chapter MCQ test routes
router.get('/chapters/:id/test', requireAuth, getChapterTest);
router.post('/chapters/:id/test/submit', requireAuth, submitChapterTest);

// Result history routes
router.get('/results', requireAuth, getResults);
router.get('/results/:id', requireAuth, getResultById);

module.exports = router;

