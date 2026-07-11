import React from 'react';
import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="landing">
      <nav className="landing-nav">
        <div className="landing-nav-logo"><span>Merch</span>alyze</div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link to="/login" className="btn btn-secondary btn-sm">Sign In</Link>
          <Link to="/register" className="btn btn-primary btn-sm">Get Started →</Link>
        </div>
      </nav>

      <div className="landing-hero">
        <div className="landing-badge">📊 Stripe-style Statistics Aggregation</div>
        <h1 className="landing-title">
          Your Revenue,<br /><span className="grad">Beautifully Analyzed</span>
        </h1>
        <p className="landing-desc">
          A production-grade merchant analytics platform that aggregates thousands of transactions into
          actionable insights — MRR, churn, conversion funnels, and more.
        </p>
        <div className="landing-cta">
          <Link to="/register" className="btn btn-primary btn-lg">View Your Analytics →</Link>
          <Link to="/login" className="btn btn-secondary btn-lg">Sign In</Link>
        </div>
      </div>

      <div className="landing-features">
        <div className="feature-card">
          <div className="feature-icon">📈</div>
          <div className="feature-title">Revenue Timeseries</div>
          <p className="feature-desc">Daily, weekly, and hourly revenue aggregation visualized as beautiful gradient area charts — just like the Stripe Dashboard.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🔄</div>
          <div className="feature-title">Churn & MRR Tracking</div>
          <p className="feature-desc">Track Monthly Recurring Revenue, Annual Run Rate, and revenue churn rate across your entire subscriber base in real-time.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🎯</div>
          <div className="feature-title">Conversion Funnel</div>
          <p className="feature-desc">Visualize your checkout-to-payment funnel stages and identify where customers drop off — built like Stripe Radar analytics.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🏆</div>
          <div className="feature-title">Top Customers</div>
          <p className="feature-desc">Identify your highest-value customers by lifetime spend and transaction frequency to focus your retention efforts.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">📥</div>
          <div className="feature-title">CSV Data Export</div>
          <p className="feature-desc">Export any date range of transaction data as a structured CSV file for offline analysis, accounting, and compliance reporting.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🔐</div>
          <div className="feature-title">Secure by Default</div>
          <p className="feature-desc">JWT authentication with 15-minute access tokens, 7-day refresh token rotation, Helmet.js headers, and rate limiting.</p>
        </div>
      </div>

      <footer style={{ borderTop: '1px solid var(--border)', padding: '40px 80px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="landing-nav-logo" style={{ fontSize: 18 }}><span>Merch</span>alyze</div>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Built for Stripe Software Engineer Intern Application · 2026</p>
      </footer>
    </div>
  );
}
