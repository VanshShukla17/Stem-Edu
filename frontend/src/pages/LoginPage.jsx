import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!identifier.trim() || !password) {
      setError('Please enter your email/phone and password');
      return;
    }

    setSubmitting(true);
    try {
      await login({ identifier: identifier.trim(), password });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '420px', margin: '48px auto', padding: '0 16px' }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)', fontWeight: '700', fontSize: '1.4rem' }}>
          <Sparkles /> STEM Edu
        </div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: '700', marginTop: '8px' }}>Welcome Back</h2>
        <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem' }}>Log in to resume your STEM lessons</p>
      </div>

      <div className="card">
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-id">Email or Mobile Number</label>
            <input
              id="login-id"
              type="text"
              className="form-input"
              placeholder="e.g. student@example.com"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              className="form-input"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
            style={{ marginTop: '8px' }}
          >
            {submitting ? 'Logging in...' : 'Log In'}
          </button>
        </form>
      </div>

      <div style={{ textAlign: 'center', fontSize: '0.92rem', color: 'var(--color-muted)' }}>
        New to STEM Edu?{' '}
        <Link to="/signup" style={{ color: 'var(--color-primary)', fontWeight: '600', textDecoration: 'none' }}>
          Create an account
        </Link>
      </div>
    </div>
  );
}

