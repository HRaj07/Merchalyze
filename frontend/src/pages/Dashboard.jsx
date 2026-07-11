import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, FunnelChart, Funnel, LabelList } from 'recharts';
import { useAuth, API } from '../context/AuthContext';

const NavItem = ({ icon, label, to, active }) => (
  <Link to={to} className={`nav-item ${active ? 'active' : ''}`}><span style={{ fontSize: 18 }}>{icon}</span> {label}</Link>
);

export const Sidebar = ({ active }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="sidebar">
      <div className="sidebar-logo">📊 <span>Merch</span>alyze</div>
      <nav className="sidebar-nav">
        <div className="nav-section">Analytics</div>
        <NavItem icon="🏠" label="Overview" to="/dashboard" active={active === 'dashboard'} />
        <div className="nav-section">Data</div>
        <NavItem icon="⚡" label="Transactions" to="/transactions" active={active === 'transactions'} />
        <NavItem icon="🔄" label="Subscriptions" to="/subscriptions" active={active === 'subscriptions'} />
      </nav>
      <div className="sidebar-footer">
        <div style={{ marginBottom: 12, padding: '10px 12px', borderRadius: 8, background: 'var(--bg-card)' }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{user?.firstName} {user?.lastName}</p>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{user?.companyName}</p>
        </div>
        <button onClick={() => { logout(); navigate('/'); }} className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'center' }}>Sign Out</button>
      </div>
    </div>
  );
};

const fmt = (n) => `$${Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 0 })}`;
const fmtK = (n) => n >= 1000 ? `$${(n/1000).toFixed(1)}k` : fmt(n);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) return (
    <div style={{ background: '#1c1f28', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '12px 16px' }}>
      <p style={{ color: '#8892a4', fontSize: 12, marginBottom: 4 }}>{label}</p>
      <p style={{ color: '#f0f4ff', fontWeight: 700, fontSize: 16 }}>{fmt(payload[0].value)}</p>
    </div>
  );
  return null;
};

export default function Dashboard() {
  const [overview, setOverview] = useState(null);
  const [timeseries, setTimeseries] = useState([]);
  const [funnel, setFunnel] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [subSummary, setSubSummary] = useState(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    API.get('/api/v1/analytics/overview').then(r => setOverview(r.data.data)).catch(() => {});
    API.get('/api/v1/analytics/revenue-timeseries').then(r => setTimeseries(r.data.data.slice(-14))).catch(() => {});
    API.get('/api/v1/analytics/conversion-funnel').then(r => setFunnel(r.data.data)).catch(() => {});
    API.get('/api/v1/analytics/top-customers').then(r => setTopCustomers(r.data.data.slice(0, 5))).catch(() => {});
    API.get('/api/v1/subscriptions/summary').then(r => setSubSummary(r.data.data)).catch(() => {});
  }, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      const token = localStorage.getItem('mz_token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8081'}/api/v1/analytics/export`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url;
      a.download = `merchalyze-report-${new Date().toISOString().slice(0,10)}.csv`;
      a.click(); URL.revokeObjectURL(url);
    } catch(e) {} finally { setExporting(false); }
  };

  return (
    <div className="layout">
      <Sidebar active="dashboard" />
      <div className="main-content fade-in">
        <div className="page-header">
          <div className="page-header-row">
            <div>
              <h1 className="page-title">Analytics Overview</h1>
              <p className="page-subtitle">Last 30 days · All merchants</p>
            </div>
            <div className="header-actions">
              <button onClick={handleExport} className="btn btn-primary" disabled={exporting}>
                {exporting ? 'Exporting...' : '📥 Export CSV'}
              </button>
            </div>
          </div>
        </div>

        <div className="page-body">
          {overview && (
            <>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon" style={{ background: 'rgba(139,92,246,0.15)' }}>💰</div>
                  <div className="stat-label">Gross Volume</div>
                  <div className="stat-value">{fmtK(overview.grossVolume)}</div>
                  <div className="stat-change text-green">↑ {overview.successRate}% success rate</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon" style={{ background: 'rgba(6,182,212,0.15)' }}>📊</div>
                  <div className="stat-label">MRR</div>
                  <div className="stat-value">{fmtK(overview.mrr)}</div>
                  <div className="stat-change text-green">↑ Monthly Recurring</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.15)' }}>👥</div>
                  <div className="stat-label">Active Subscribers</div>
                  <div className="stat-value">{overview.activeSubscriptions}</div>
                  <div className="stat-change text-green">↑ Growing</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon" style={{ background: 'rgba(244,63,94,0.15)' }}>📉</div>
                  <div className="stat-label">Churn Rate</div>
                  <div className="stat-value">{overview.churnRate}%</div>
                  <div className="stat-change text-red">Revenue churn</div>
                </div>
              </div>

              {/* Revenue Chart */}
              <div className="chart-wrap">
                <div className="chart-title">Revenue · Last 14 Days</div>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={timeseries}>
                    <defs>
                      <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" stroke="#3d4560" fontSize={11} tickLine={false} axisLine={false} tickFormatter={d => d.slice(5)} />
                    <YAxis stroke="#3d4560" fontSize={11} tickLine={false} axisLine={false} tickFormatter={fmtK} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#rev)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
                {/* Conversion Funnel */}
                <div className="chart-wrap" style={{ marginBottom: 0 }}>
                  <div className="chart-title">Conversion Funnel</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
                    {funnel.map((f, i) => (
                      <div key={i}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{f.stage}</span>
                          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{f.count.toLocaleString()}</span>
                        </div>
                        <div style={{ background: 'var(--bg-secondary)', borderRadius: 4, height: 8, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${f.conversionRate}%`, background: i === 0 ? '#8b5cf6' : i === funnel.length-1 ? '#f43f5e' : 'linear-gradient(90deg,#8b5cf6,#06b6d4)', borderRadius: 4, transition: 'width 0.6s ease' }} />
                        </div>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>{f.conversionRate}% conversion</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Customers */}
                <div className="chart-wrap" style={{ marginBottom: 0 }}>
                  <div className="chart-title">Top 5 Customers</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {topCustomers.map((c, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: i < topCustomers.length-1 ? '1px solid var(--border)' : 'none' }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--accent-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: 'var(--accent-light)', flexShrink: 0 }}>{i+1}</div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{c.customerId}</p>
                          <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{c.txCount} transactions</p>
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--green)' }}>{fmt(c.totalSpend)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Subscription Summary */}
              {subSummary && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
                  {[
                    { label: 'Active Subs', val: subSummary.totalActive, color: 'var(--green)' },
                    { label: 'Starter Plan', val: subSummary.byPlan?.starter, color: 'var(--accent-light)' },
                    { label: 'Pro Plan', val: subSummary.byPlan?.pro, color: 'var(--cyan)' },
                  ].map((s, i) => (
                    <div key={i} className="stat-card">
                      <div className="stat-label">{s.label}</div>
                      <div className="stat-value" style={{ color: s.color, fontSize: 40 }}>{s.val}</div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
          {!overview && <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-muted)' }}>Loading analytics...</div>}
        </div>
      </div>
    </div>
  );
}
