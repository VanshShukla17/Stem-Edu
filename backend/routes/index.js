const express = require('express');
const router = express.Router();

/**
 * Health check route
 * Task 1.2: Returns { status: "ok" }
 */
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

/**
 * Test error route
 * Task 1.5: Throws an error to verify central error-handling middleware returns clean JSON { message }
 */
router.get('/test-error', (req, res, next) => {
  const error = new Error('Test error: Central error handling is working correctly');
  error.statusCode = 400;
  next(error);
});

module.exports = router;
