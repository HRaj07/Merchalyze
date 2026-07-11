const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const db = require('../db');

const router = express.Router();
router.use(authenticateToken);

// GET /api/v1/subscriptions
router.get('/', (req, res) => {
  const { status, plan, page = 1, limit = 20 } = req.query;
  let results = [...db.subscriptions];

  if (status) results = results.filter(s => s.status === status);
  if (plan) results = results.filter(s => s.plan === plan);

  results.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const total = results.length;
  const paginated = results.slice((pageNum - 1) * limitNum, pageNum * limitNum);

  res.json({
    success: true,
    data: paginated,
    pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
  });
});

// GET /api/v1/subscriptions/summary
router.get('/summary', (req, res) => {
  const active = db.subscriptions.filter(s => s.status === 'active');
  const canceled = db.subscriptions.filter(s => s.status === 'canceled');
  const mrr = active.reduce((sum, s) => sum + s.amount, 0) / 100;

  const byPlan = { starter: 0, pro: 0, enterprise: 0 };
  active.forEach(s => { if (byPlan[s.plan] !== undefined) byPlan[s.plan]++; });

  res.json({
    success: true,
    data: {
      totalActive: active.length,
      totalCanceled: canceled.length,
      mrr,
      arr: mrr * 12,
      byPlan,
    },
  });
});

module.exports = router;
