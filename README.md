# Merchalyze — Merchant Analytics & Statistics Aggregation Platform

A **production-grade, full-stack SaaS analytics platform** built for merchant revenue tracking, subscription management, and financial reporting. Inspired by Stripe's internal statistics aggregation infrastructure.

## 🚀 Features

### Backend API (Node.js + Express)
- **Secure JWT Authentication** — Access tokens (15min expiry) + Refresh tokens (7-day rotation)
- **Helmet.js Security Headers** — XSS, CSRF, clickjacking protection
- **Rate Limiting** — 200 req/15min globally; 20 auth attempts per window
- **Input Validation** — express-validator on all user-facing endpoints
- **Centralized Error Handling** — Consistent JSON error responses with request ID tracking
- **Modular Route Architecture** — Auth, Analytics, Merchants, Transactions, Subscriptions

### Analytics Endpoints
| Endpoint | Description |
|---|---|
| `GET /api/v1/analytics/overview` | KPIs: Gross volume, MRR, ARR, churn rate |
| `GET /api/v1/analytics/revenue-timeseries` | Daily/hourly/weekly revenue aggregation |
| `GET /api/v1/analytics/payment-methods` | Payment method breakdown |
| `GET /api/v1/analytics/conversion-funnel` | Checkout → Payment success funnel |
| `GET /api/v1/analytics/top-customers` | Top 10 customers by spend |
| `GET /api/v1/analytics/export` | Filtered CSV export |

### Data Model
- **90 days** of realistic seeded transaction data
- **3 merchants** with different plans and geographies
- **120 subscriptions** with accurate churn modeling

## 🛠️ Tech Stack
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Auth:** JWT (jsonwebtoken) + Bcrypt
- **Security:** Helmet.js, express-rate-limit
- **Validation:** express-validator
- **Logging:** Morgan
- **Frontend:** React + Vite + Recharts

## 📦 Installation

```bash
cd backend
npm install
node index.js
```

Server starts on `http://localhost:8081`

## 🔐 API Authentication

Register and get tokens:
```bash
POST /api/v1/auth/register
{
  "email": "admin@merchalyze.com",
  "password": "password123",
  "firstName": "Harshit",
  "lastName": "Raj",
  "companyName": "Merchalyze Inc."
}
```

Use token in headers:
```
Authorization: Bearer <accessToken>
```

## 📊 Sample API Response

```json
GET /api/v1/analytics/overview

{
  "success": true,
  "data": {
    "grossVolume": 125432.50,
    "netVolume": 121890.20,
    "mrr": 45000.00,
    "activeSubscriptions": 102,
    "churnRate": 1.8,
    "successRate": 85.3
  }
}
```

## 🌐 Deployment
- Backend → [Render.com](https://render.com) (Set `PORT` and `JWT_SECRET` env vars)
- Frontend → [Vercel](https://vercel.com)
