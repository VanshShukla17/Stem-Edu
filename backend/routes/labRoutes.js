const express = require('express');
const router = express.Router();
const labController = require('../controllers/labController');
const { requireAuth, optionalAuth } = require('../middleware/auth');

// Public or optionalAuth listing of labs
router.get('/', optionalAuth, labController.getAllLabs);

// Student's personal past lab results
router.get('/results/me', requireAuth, labController.getMyLabResults);

// Specific lab details
router.get('/:id', optionalAuth, labController.getLabByIdOrType);

// Submit observation quiz
router.post('/:id/submit', requireAuth, labController.submitLabQuiz);

module.exports = router;
