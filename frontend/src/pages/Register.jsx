import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '', companyName: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try { await register(form); navigate('/dashboard'); }
    catch (err) { setError(err.response?.data?.error?.message || err.response?.data?.errors?.[0]?.msg || 'Registration failed.'); }
    finally { setLoading(false); }
  };
  const f = (k) => ({ value: form[k], onChange: e => setForm({...form, [k]: e.target.value}) });

  return (
    <div className="auth-page">
      <div className="auth-card fade-in">
        <div className="auth-logo"><span style={{ background: 'linear-gradient(135deg,#8b5cf6,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Merch</span>alyze</div>
        <p className="auth-subtitle">Create your merchant analytics account</p>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">First Name</label>
              <input className="form-input" placeholder="Harshit" {...f('firstName')} required />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Last Name</label>
              <input className="form-input" placeholder="Raj" {...f('lastName')} required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Company</label>
            <input className="form-input" placeholder="Acme Inc." {...f('companyName')} required />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="form-input" type="email" placeholder="you@company.com" {...f('email')} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="Min. 8 characters" {...f('password')} required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '13px' }} disabled={loading}>
            {loading ? 'Creating Account...' : 'Start Analyzing →'}
          </button>
        </form>
        <div className="auth-footer">Already a member? <Link to="/login">Sign in</Link></div>
      </div>
    </div>
  );
}
