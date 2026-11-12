const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const { getProfile, updateProfile } = require('../controllers/authController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Authentication routes (/api/auth/signup, /api/auth/login)
router.use('/auth', authRoutes);

// User profile routes (Task 2.5)
router.get('/me', requireAuth, getProfile);
router.put('/me', requireAuth, updateProfile);

// Test routes for middleware verification (Task 1.5, Task 2.4)
router.get('/test-error', (req, res, next) => {
  const error = new Error('Test error: Central error handling is working correctly');
  error.statusCode = 400;
  next(error);
});

router.get('/test/protected', requireAuth, (req, res) => {
  res.status(200).json({
    message: 'Protected route accessed successfully',
    userId: req.user._id,
    role: req.user.role
  });
});

router.get('/test/admin', requireAuth, requireAdmin, (req, res) => {
  res.status(200).json({
    message: 'Admin route accessed successfully',
    userId: req.user._id,
    role: req.user.role
  });
});

module.exports = router;
