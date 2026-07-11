const { v4: uuidv4 } = require('uuid');

// In-memory database
const db = {
  users: [],
  refreshTokens: new Set(),
  merchants: [],
  transactions: [],
  subscriptions: [],
};

// Seed realistic mock data
const seedData = () => {
  const merchantIds = [uuidv4(), uuidv4(), uuidv4()];
  
  db.merchants = [
    { id: merchantIds[0], name: 'Acme Corp', email: 'billing@acme.com', plan: 'enterprise', country: 'US', currency: 'USD', createdAt: '2025-01-15T00:00:00Z' },
    { id: merchantIds[1], name: 'Nexus Solutions', email: 'accounts@nexus.io', plan: 'pro', country: 'GB', currency: 'GBP', createdAt: '2025-03-01T00:00:00Z' },
    { id: merchantIds[2], name: 'SparkTech', email: 'finance@sparktech.dev', plan: 'starter', country: 'IN', currency: 'INR', createdAt: '2025-06-10T00:00:00Z' },
  ];

  // Generate 90 days of transactions
  const statuses = ['succeeded', 'succeeded', 'succeeded', 'failed', 'refunded'];
  for (let i = 90; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const txCount = Math.floor(Math.random() * 15) + 5;
    for (let j = 0; j < txCount; j++) {
      db.transactions.push({
        id: 'txn_' + uuidv4().replace(/-/g, '').substring(0, 16),
        merchantId: merchantIds[Math.floor(Math.random() * merchantIds.length)],
        amount: Math.floor(Math.random() * 50000) + 1000,
        currency: 'USD',
        status: statuses[Math.floor(Math.random() * statuses.length)],
        type: Math.random() > 0.3 ? 'payment' : 'subscription',
        customer: `customer_${Math.floor(Math.random() * 500)}`,
        createdAt: date.toISOString(),
        fee: Math.floor(Math.random() * 200) + 30,
      });
    }
  }

  // Subscriptions
  const plans = ['starter', 'pro', 'enterprise'];
  for (let i = 0; i < 120; i++) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 180));
    const isActive = Math.random() > 0.15;
    db.subscriptions.push({
      id: 'sub_' + uuidv4().replace(/-/g, '').substring(0, 16),
      customerId: `customer_${i}`,
      merchantId: merchantIds[Math.floor(Math.random() * merchantIds.length)],
      plan: plans[Math.floor(Math.random() * plans.length)],
      amount: [2900, 7900, 29900][Math.floor(Math.random() * 3)],
      currency: 'USD',
      status: isActive ? 'active' : 'canceled',
      startDate: startDate.toISOString(),
      canceledAt: isActive ? null : new Date(startDate.getTime() + Math.random() * 90 * 86400000).toISOString(),
    });
  }
};

seedData();

module.exports = db;
