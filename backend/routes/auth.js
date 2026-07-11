const express = require('express');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');
const { generateTokens, verifyRefreshToken } = require('../middleware/auth');
const { createError } = require('../middleware/errorHandler');
const db = require('../db');

const router = express.Router();

// POST /api/v1/auth/register
router.post('/register', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('firstName').trim().notEmpty().withMessage('First name required'),
  body('lastName').trim().notEmpty().withMessage('Last name required'),
  body('companyName').trim().notEmpty().withMessage('Company name required'),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { email, password, firstName, lastName, companyName } = req.body;

    if (db.users.find(u => u.email === email)) {
      throw createError(409, 'An account with this email already exists.');
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = {
      id: uuidv4(),
      email,
      password: hashedPassword,
      firstName,
      lastName,
      companyName,
      role: 'admin',
      createdAt: new Date().toISOString(),
    };
    db.users.push(user);

    const { accessToken, refreshToken } = generateTokens(user);
    db.refreshTokens.add(refreshToken);

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      data: {
        user: { id: user.id, email: user.email, firstName, lastName, companyName, role: user.role },
        accessToken,
        refreshToken,
      },
    });
  } catch (err) { next(err); }
});

// POST /api/v1/auth/login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { email, password } = req.body;
    const user = db.users.find(u => u.email === email);
    if (!user) throw createError(401, 'Invalid email or password.');

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw createError(401, 'Invalid email or password.');

    const { accessToken, refreshToken } = generateTokens(user);
    db.refreshTokens.add(refreshToken);

    res.json({
      success: true,
      data: {
        user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, companyName: user.companyName, role: user.role },
        accessToken,
        refreshToken,
      },
    });
  } catch (err) { next(err); }
});

// POST /api/v1/auth/refresh
router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken || !db.refreshTokens.has(refreshToken)) {
      throw createError(401, 'Invalid refresh token.');
    }
    const decoded = verifyRefreshToken(refreshToken);
    const user = db.users.find(u => u.id === decoded.id);
    if (!user) throw createError(401, 'User not found.');

    db.refreshTokens.delete(refreshToken);
    const tokens = generateTokens(user);
    db.refreshTokens.add(tokens.refreshToken);

    res.json({ success: true, data: tokens });
  } catch (err) { next(err); }
});

// POST /api/v1/auth/logout
router.post('/logout', (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) db.refreshTokens.delete(refreshToken);
    res.json({ success: true, message: 'Logged out successfully.' });
  } catch (err) { next(err); }
});

// GET /api/v1/auth/me
router.get('/me', require('../middleware/auth').authenticateToken, (req, res) => {
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ success: false, error: { message: 'User not found.' } });
  const { password, ...safeUser } = user;
  res.json({ success: true, data: safeUser });
});

module.exports = router;
