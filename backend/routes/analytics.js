const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const db = require('../db');

const router = express.Router();
router.use(authenticateToken);

// Helper: parse date range from query
const getDateRange = (from, to) => {
  const end = to ? new Date(to) : new Date();
  const start = from ? new Date(from) : new Date(Date.now() - 30 * 86400000);
  return { start, end };
};

// GET /api/v1/analytics/overview
router.get('/overview', (req, res) => {
  const { start, end } = getDateRange(req.query.from, req.query.to);

  const filtered = db.transactions.filter(t => {
    const d = new Date(t.createdAt);
    return d >= start && d <= end;
  });

  const succeeded = filtered.filter(t => t.status === 'succeeded');
  const failed = filtered.filter(t => t.status === 'failed');
  const refunded = filtered.filter(t => t.status === 'refunded');

  const grossVolume = succeeded.reduce((sum, t) => sum + t.amount, 0);
  const totalFees = succeeded.reduce((sum, t) => sum + t.fee, 0);
  const netVolume = grossVolume - totalFees;
  const successRate = filtered.length > 0 ? ((succeeded.length / filtered.length) * 100).toFixed(2) : 0;

  const activeSubscriptions = db.subscriptions.filter(s => s.status === 'active').length;
  const canceledThisPeriod = db.subscriptions.filter(s => {
    if (!s.canceledAt) return false;
    const d = new Date(s.canceledAt);
    return d >= start && d <= end;
  }).length;
  const mrr = db.subscriptions.filter(s => s.status === 'active').reduce((sum, s) => sum + s.amount, 0) / 100;
  const churnRate = activeSubscriptions > 0 ? ((canceledThisPeriod / (activeSubscriptions + canceledThisPeriod)) * 100).toFixed(2) : 0;

  res.json({
    success: true,
    data: {
      grossVolume: grossVolume / 100,
      netVolume: netVolume / 100,
      totalFees: totalFees / 100,
      transactionCount: filtered.length,
      successRate: parseFloat(successRate),
      failedCount: failed.length,
      refundedCount: refunded.length,
      mrr,
      activeSubscriptions,
      churnRate: parseFloat(churnRate),
      period: { from: start.toISOString(), to: end.toISOString() },
    },
  });
});

// GET /api/v1/analytics/revenue-timeseries
router.get('/revenue-timeseries', (req, res) => {
  const { start, end } = getDateRange(req.query.from, req.query.to);
  const granularity = req.query.granularity || 'daily';

  const succeeded = db.transactions.filter(t => {
    const d = new Date(t.createdAt);
    return t.status === 'succeeded' && d >= start && d <= end;
  });

  const grouped = {};
  succeeded.forEach(t => {
    const d = new Date(t.createdAt);
    let key;
    if (granularity === 'hourly') key = `${d.toISOString().substring(0, 13)}:00:00Z`;
    else if (granularity === 'weekly') {
      const weekStart = new Date(d); weekStart.setDate(d.getDate() - d.getDay());
      key = weekStart.toISOString().substring(0, 10);
    } else key = d.toISOString().substring(0, 10);

    if (!grouped[key]) grouped[key] = { date: key, revenue: 0, transactions: 0, fees: 0 };
    grouped[key].revenue += t.amount / 100;
    grouped[key].transactions += 1;
    grouped[key].fees += t.fee / 100;
  });

  const timeseries = Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));
  res.json({ success: true, data: timeseries, granularity });
});

// GET /api/v1/analytics/payment-methods
router.get('/payment-methods', (req, res) => {
  const breakdown = [
    { method: 'Visa', count: 1240, volume: 52300, percentage: 45.2 },
    { method: 'Mastercard', count: 870, volume: 38100, percentage: 31.8 },
    { method: 'American Express', count: 310, volume: 15200, percentage: 11.4 },
    { method: 'PayPal', count: 220, volume: 9800, percentage: 8.0 },
    { method: 'Apple Pay', count: 95, volume: 4100, percentage: 3.6 },
  ];
  res.json({ success: true, data: breakdown });
});

// GET /api/v1/analytics/conversion-funnel
router.get('/conversion-funnel', (req, res) => {
  const { start, end } = getDateRange(req.query.from, req.query.to);
  const total = db.transactions.filter(t => new Date(t.createdAt) >= start && new Date(t.createdAt) <= end).length;
  const succeeded = db.transactions.filter(t => t.status === 'succeeded' && new Date(t.createdAt) >= start && new Date(t.createdAt) <= end).length;
  const failed = db.transactions.filter(t => t.status === 'failed' && new Date(t.createdAt) >= start && new Date(t.createdAt) <= end).length;

  res.json({
    success: true,
    data: [
      { stage: 'Checkout Initiated', count: Math.floor(total * 1.6), conversionRate: 100 },
      { stage: 'Payment Submitted', count: total, conversionRate: 62.5 },
      { stage: 'Payment Succeeded', count: succeeded, conversionRate: parseFloat(((succeeded / total) * 100).toFixed(1)) },
      { stage: 'Failed / Declined', count: failed, conversionRate: parseFloat(((failed / total) * 100).toFixed(1)) },
    ],
  });
});

// GET /api/v1/analytics/top-customers
router.get('/top-customers', (req, res) => {
  const customerMap = {};
  db.transactions.filter(t => t.status === 'succeeded').forEach(t => {
    if (!customerMap[t.customer]) customerMap[t.customer] = { customerId: t.customer, totalSpend: 0, txCount: 0 };
    customerMap[t.customer].totalSpend += t.amount / 100;
    customerMap[t.customer].txCount += 1;
  });

  const topCustomers = Object.values(customerMap)
    .sort((a, b) => b.totalSpend - a.totalSpend)
    .slice(0, 10);

  res.json({ success: true, data: topCustomers });
});

// GET /api/v1/analytics/export
router.get('/export', (req, res) => {
  const { start, end } = getDateRange(req.query.from, req.query.to);
  const rows = db.transactions.filter(t => {
    const d = new Date(t.createdAt);
    return d >= start && d <= end;
  });

  let csv = 'Transaction ID,Merchant ID,Amount (USD),Currency,Status,Type,Customer,Date,Fee\n';
  rows.forEach(t => {
    csv += `${t.id},${t.merchantId},${(t.amount / 100).toFixed(2)},${t.currency},${t.status},${t.type},${t.customer},${t.createdAt},${(t.fee / 100).toFixed(2)}\n`;
  });

  res.header('Content-Type', 'text/csv');
  res.attachment(`merchalyze-report-${new Date().toISOString().substring(0, 10)}.csv`);
  res.send(csv);
});

module.exports = router;
