import React, { useEffect, useState } from 'react';
import { Sidebar } from './Dashboard';
import { API } from '../context/AuthContext';

export default function Subscriptions() {
  const [subs, setSubs] = useState([]);
  const [summary, setSummary] = useState(null);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [plan, setPlan] = useState('');

  useEffect(() => {
    API.get(`/api/v1/subscriptions?page=${page}&limit=20${status ? `&status=${status}` : ''}${plan ? `&plan=${plan}` : ''}`)
      .then(r => { setSubs(r.data.data); setPagination(r.data.pagination); });
    API.get('/api/v1/subscriptions/summary').then(r => setSummary(r.data.data));
  }, [page, status, plan]);

  const fmt = (n) => `$${Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  const planColors = { starter: 'badge-cyan', pro: 'badge-purple', enterprise: 'badge-yellow' };

  return (
    <div className="layout">
      <Sidebar active="subscriptions" />
      <div className="main-content fade-in">
        <div className="page-header">
          <h1 className="page-title">Subscriptions</h1>
          <p className="page-subtitle">Recurring revenue management</p>
        </div>
        <div className="page-body">
          {summary && (
            <div className="stats-grid" style={{ marginBottom: 28 }}>
              <div className="stat-card">
                <div className="stat-label">MRR</div>
                <div className="stat-value">{fmt(summary.mrr)}</div>
                <div className="stat-change text-green">Monthly Recurring</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">ARR</div>
                <div className="stat-value">{fmt(summary.arr)}</div>
                <div className="stat-change text-green">Annual Run Rate</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Active</div>
                <div className="stat-value">{summary.totalActive}</div>
                <div className="stat-change text-green">Subscribers</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Canceled</div>
                <div className="stat-value">{summary.totalCanceled}</div>
                <div className="stat-change text-red">Churned</div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
            <select className="form-input" style={{ width: 'auto', padding: '8px 14px' }} value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="canceled">Canceled</option>
            </select>
            <select className="form-input" style={{ width: 'auto', padding: '8px 14px' }} value={plan} onChange={e => { setPlan(e.target.value); setPage(1); }}>
              <option value="">All Plans</option>
              <option value="starter">Starter</option>
              <option value="pro">Pro</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>

          <div className="table-wrap">
            <table>
              <thead><tr><th>Subscription ID</th><th>Customer</th><th>Plan</th><th>Amount</th><th>Status</th><th>Start Date</th><th>Canceled At</th></tr></thead>
              <tbody>
                {subs.map(s => (
                  <tr key={s.id}>
                    <td><span className="mono" style={{ fontSize: 11, color: 'var(--accent-light)' }}>{s.id}</span></td>
                    <td><span className="mono" style={{ fontSize: 12 }}>{s.customerId}</span></td>
                    <td><span className={`badge ${planColors[s.plan] || 'badge-purple'}`}>{s.plan}</span></td>
                    <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{fmt(s.amount / 100)}<span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400 }}>/mo</span></td>
                    <td><span className={`badge badge-${s.status === 'active' ? 'green' : 'red'}`}>{s.status}</span></td>
                    <td>{new Date(s.startDate).toLocaleDateString()}</td>
                    <td>{s.canceledAt ? new Date(s.canceledAt).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pagination.totalPages > 1 && (
            <div style={{ display: 'flex', gap: 8, marginTop: 20, justifyContent: 'center' }}>
              <button className="btn btn-secondary btn-sm" disabled={page === 1} onClick={() => setPage(p=>p-1)}>← Previous</button>
              <span style={{ padding: '6px 16px', color: 'var(--text-secondary)', fontSize: 14 }}>Page {page} of {pagination.totalPages}</span>
              <button className="btn btn-secondary btn-sm" disabled={!pagination.hasNext} onClick={() => setPage(p=>p+1)}>Next →</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
