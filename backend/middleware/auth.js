const jwt = require('jsonwebtoken');
const { createError } = require('./errorHandler');

const JWT_SECRET = process.env.JWT_SECRET || 'merchalyze-super-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'merchalyze-refresh-secret-key';

const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) throw createError(401, 'Access denied. No token provided.');

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(createError(401, 'Token expired. Please refresh your token.'));
    }
    if (err.name === 'JsonWebTokenError') {
      return next(createError(403, 'Invalid token.'));
    }
    next(err);
  }
};

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '15m' }
  );
  const refreshToken = jwt.sign(
    { id: user.id, email: user.email },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
  return { accessToken, refreshToken };
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, JWT_REFRESH_SECRET);
};

module.exports = { authenticateToken, generateTokens, verifyRefreshToken };
