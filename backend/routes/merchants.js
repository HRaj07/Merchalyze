const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const db = require('../db');

const router = express.Router();
router.use(authenticateToken);

// GET /api/v1/merchants
router.get('/', (req, res) => {
  res.json({ success: true, data: db.merchants, count: db.merchants.length });
});

// GET /api/v1/merchants/:id
router.get('/:id', (req, res) => {
  const merchant = db.merchants.find(m => m.id === req.params.id);
  if (!merchant) return res.status(404).json({ success: false, error: { message: 'Merchant not found.' } });

  const txns = db.transactions.filter(t => t.merchantId === merchant.id);
  const volume = txns.filter(t => t.status === 'succeeded').reduce((sum, t) => sum + t.amount / 100, 0);
  const subs = db.subscriptions.filter(s => s.merchantId === merchant.id && s.status === 'active').length;

  res.json({
    success: true,
    data: { ...merchant, metrics: { totalVolume: volume, transactionCount: txns.length, activeSubscriptions: subs } },
  });
});

module.exports = router;
