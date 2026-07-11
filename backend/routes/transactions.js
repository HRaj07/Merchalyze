const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const db = require('../db');

const router = express.Router();
router.use(authenticateToken);

// GET /api/v1/transactions
router.get('/', (req, res) => {
  const { page = 1, limit = 20, status, merchantId, from, to } = req.query;
  let results = [...db.transactions];

  if (status) results = results.filter(t => t.status === status);
  if (merchantId) results = results.filter(t => t.merchantId === merchantId);
  if (from) results = results.filter(t => new Date(t.createdAt) >= new Date(from));
  if (to) results = results.filter(t => new Date(t.createdAt) <= new Date(to));

  results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const total = results.length;
  const paginated = results.slice((pageNum - 1) * limitNum, pageNum * limitNum);

  res.json({
    success: true,
    data: paginated,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
      hasNext: pageNum * limitNum < total,
      hasPrev: pageNum > 1,
    },
  });
});

// GET /api/v1/transactions/:id
router.get('/:id', (req, res) => {
  const txn = db.transactions.find(t => t.id === req.params.id);
  if (!txn) return res.status(404).json({ success: false, error: { message: 'Transaction not found.' } });
  res.json({ success: true, data: txn });
});

module.exports = router;
