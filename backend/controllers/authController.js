const User = require('../models/User');
const { generateToken } = require('../utils/jwt');

/**
 * Register a new user
 * POST /api/auth/signup
 */
const signup = async (req, res, next) => {
  try {
    const { name, email, phone, password, role, classLevel, board, language } = req.body;
    const studentClass = req.body.class !== undefined ? req.body.class : classLevel;

    // 1. Basic validation
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Name is required' });
    }

    if (!email && !phone) {
      return res.status(400).json({ message: 'Either email or phone number is required' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // 2. Check for duplicate email
    if (email) {
      const existingEmail = await User.findOne({ email: email.toLowerCase().trim() });
      if (existingEmail) {
        return res.status(400).json({ message: 'An account with this email already exists' });
      }
    }

    // 3. Check for duplicate phone
    if (phone) {
      const existingPhone = await User.findOne({ phone: phone.trim() });
      if (existingPhone) {
        return res.status(400).json({ message: 'An account with this phone number already exists' });
      }
    }

    // 4. Hash password
    const passwordHash = await User.hashPassword(password);

    // 5. Create user
    const user = await User.create({
      name: name.trim(),
      email: email ? email.toLowerCase().trim() : undefined,
      phone: phone ? phone.trim() : undefined,
      passwordHash,
      role: role && ['student', 'admin', 'teacher'].includes(role) ? role : 'student',
      classLevel: studentClass !== undefined ? Number(studentClass) : 10,
      board: board || 'CBSE',
      language: language === 'hi' ? 'hi' : 'en'
    });

    // 6. Generate JWT token
    const token = generateToken({ id: user._id, role: user.role });

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Log in an existing user
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { identifier, email, phone, password } = req.body;
    const loginId = identifier || email || phone;

    if (!loginId || !password) {
      return res.status(400).json({ message: 'Please provide email/phone and password' });
    }

    const trimmedId = loginId.trim();

    // Find user by email or phone
    const user = await User.findOne({
      $or: [
        { email: trimmedId.toLowerCase() },
        { phone: trimmedId }
      ]
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials: user not found' });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials: wrong password' });
    }

    // Generate JWT token
    const token = generateToken({ id: user._id, role: user.role });

    res.status(200).json({
      message: 'Logged in successfully',
      token,
      user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user profile
 * GET /api/me
 */
const getProfile = async (req, res) => {
  res.status(200).json({
    user: req.user
  });
};

/**
 * Update current user profile
 * PUT /api/me
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, classLevel, board, language } = req.body;
    const studentClass = req.body.class !== undefined ? req.body.class : classLevel;

    const user = req.user;

    if (name) user.name = name.trim();
    if (studentClass !== undefined) user.classLevel = Number(studentClass);
    if (board) user.board = board.trim();
    if (language && ['en', 'hi'].includes(language)) user.language = language;

    await user.save();

    res.status(200).json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signup,
  login,
  getProfile,
  updateProfile
};
