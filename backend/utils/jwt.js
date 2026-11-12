const jwt = require('jsonwebtoken');

/**
 * Generate signed JWT token
 * @param {Object} payload - User identification payload { id, role }
 * @param {string} expiresIn - Expiration time (default: 7d)
 * @returns {string} Signed JWT
 */
const generateToken = (payload, expiresIn = '7d') => {
  const secret = process.env.JWT_SECRET || 'dev_secret_jwt_key_12345';
  return jwt.sign(payload, secret, { expiresIn });
};

/**
 * Verify and decode JWT token
 * @param {string} token - Bearer JWT string
 * @returns {Object} Decoded payload
 */
const verifyToken = (token) => {
  const secret = process.env.JWT_SECRET || 'dev_secret_jwt_key_12345';
  return jwt.verify(token, secret);
};

module.exports = {
  generateToken,
  verifyToken
};

