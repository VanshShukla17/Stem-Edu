const User = require('../models/User');
const { verifyToken } = require('../utils/jwt');

/**
 * Hand-written Authentication Middleware
 * Validates JWT in Authorization: Bearer <token> header and attaches user to req
 */
const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication token required' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Authentication token required' });
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (tokenErr) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'User no longer exists' });
    }

    // Attach user document to request object
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Hand-written Authorization Middleware for Admin Access
 * Must be preceded by requireAuth
 */
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access forbidden: Admin privilege required' });
  }

  next();
};

module.exports = {
  requireAuth,
  requireAdmin
};
