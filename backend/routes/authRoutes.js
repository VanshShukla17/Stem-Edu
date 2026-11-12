const express = require('express');
const router = express.Router();
const { signup, login, getProfile, updateProfile } = require('../controllers/authController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// Public auth routes
router.post('/signup', signup);
router.post('/login', login);

module.exports = router;
