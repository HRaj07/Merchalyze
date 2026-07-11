import React, { useEffect, useState } from 'react';
import { Sidebar } from './Dashboard';
import { API } from '../context/AuthContext';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');

  useEffect(() => {
    API.get(`/api/v1/transactions?page=${page}&limit=20${status ? `&status=${status}` : ''}`)
      .then(r => { setTransactions(r.data.data); setPagination(r.data.pagination); });
  }, [page, status]);

  const fmt = (n) => `$${Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

  return (
    <div className="layout">
      <Sidebar active="transactions" />
      <div className="main-content fade-in">
        <div className="page-header">
          <div className="page-header-row">
            <div>
              <h1 className="page-title">Transactions</h1>
              <p className="page-subtitle">{pagination.total || 0} total transactions</p>
            </div>
            <select className="form-input" style={{ width: 'auto', padding: '8px 14px' }} value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
              <option value="">All Status</option>
              <option value="succeeded">Succeeded</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>
        <div className="page-body">
          <div className="table-wrap">
            <table>
              <thead><tr><th>Transaction ID</th><th>Amount</th><th>Currency</th><th>Status</th><th>Type</th><th>Customer</th><th>Fee</th><th>Date</th></tr></thead>
              <tbody>
                {transactions.map(t => (
                  <tr key={t.id}>
                    <td><span className="mono" style={{ fontSize: 11, color: 'var(--accent-light)' }}>{t.id}</span></td>
                    <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{fmt(t.amount / 100)}</td>
                    <td><span className="badge badge-cyan">{t.currency}</span></td>
                    <td><span className={`badge badge-${t.status === 'succeeded' ? 'green' : t.status === 'failed' ? 'red' : 'yellow'}`}>{t.status}</span></td>
                    <td><span className="badge badge-purple">{t.type}</span></td>
                    <td><span className="mono" style={{ fontSize: 12 }}>{t.customer}</span></td>
                    <td style={{ color: 'var(--text-muted)' }}>{fmt(t.fee / 100)}</td>
                    <td>{new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pagination.totalPages > 1 && (
            <div style={{ display: 'flex', gap: 8, marginTop: 20, justifyContent: 'center' }}>
              <button className="btn btn-secondary btn-sm" disabled={!pagination.hasPrev} onClick={() => setPage(p=>p-1)}>← Previous</button>
              <span style={{ padding: '6px 16px', color: 'var(--text-secondary)', fontSize: 14 }}>Page {pagination.page} of {pagination.totalPages}</span>
              <button className="btn btn-secondary btn-sm" disabled={!pagination.hasNext} onClick={() => setPage(p=>p+1)}>Next →</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
