import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles } from 'lucide-react';

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    identifier: '',
    password: '',
    board: 'CBSE',
    class: 10,
    language: 'en'
  });

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Please enter your full name');
      return;
    }

    if (!formData.identifier.trim()) {
      setError('Please provide an email address or mobile number');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setSubmitting(true);
    try {
      const isEmail = formData.identifier.includes('@');
      const payload = {
        name: formData.name.trim(),
        email: isEmail ? formData.identifier.trim() : undefined,
        phone: !isEmail ? formData.identifier.trim() : undefined,
        password: formData.password,
        board: formData.board,
        class: Number(formData.class),
        language: formData.language
      };

      await signup(payload);
      // Land on dashboard as per Task 4.5
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '440px', margin: '40px auto', padding: '0 16px' }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)', fontWeight: '700', fontSize: '1.4rem' }}>
          <Sparkles /> STEM Edu
        </div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: '700', marginTop: '8px' }}>Create Student Account</h2>
        <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem' }}>Join free STEM learning personalized to your curriculum</p>
      </div>

      <div className="card">
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              className="form-input"
              placeholder="e.g. Kushal Kumar"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="identifier">Email or Phone Number</label>
            <input
              id="identifier"
              type="text"
              className="form-input"
              placeholder="name@example.com or 9876543210"
              value={formData.identifier}
              onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="At least 6 characters"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>

          {/* Board Selector */}
          <div className="form-group">
            <label className="form-label">Education Board</label>
            <div className="pill-group">
              <button
                type="button"
                className={`pill-btn ${formData.board === 'CBSE' ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, board: 'CBSE' })}
              >
                CBSE
              </button>
              <button
                type="button"
                className={`pill-btn ${formData.board === 'State Board' ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, board: 'State Board' })}
              >
                State Board
              </button>
            </div>
          </div>

          {/* Class Selector */}
          <div className="form-group">
            <label className="form-label">Class Standard</label>
            <div className="pill-group">
              {[9, 10, 11, 12].map((cls) => (
                <button
                  key={cls}
                  type="button"
                  className={`pill-btn ${formData.class === cls ? 'active' : ''}`}
                  onClick={() => setFormData({ ...formData, class: cls })}
                >
                  Class {cls}
                </button>
              ))}
            </div>
          </div>

          {/* Language Selector */}
          <div className="form-group">
            <label className="form-label">Preferred Language</label>
            <div className="pill-group">
              <button
                type="button"
                className={`pill-btn ${formData.language === 'en' ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, language: 'en' })}
              >
                English
              </button>
              <button
                type="button"
                className={`pill-btn ${formData.language === 'hi' ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, language: 'hi' })}
              >
                हिंदी (Hindi)
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
            style={{ marginTop: '8px' }}
          >
            {submitting ? 'Creating account...' : 'Create Account & Start Learning'}
          </button>
        </form>
      </div>

      <div style={{ textAlign: 'center', fontSize: '0.92rem', color: 'var(--color-muted)' }}>
        Already have an account?{' '}
        <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: '600', textDecoration: 'none' }}>
          Log In
        </Link>
      </div>
    </div>
  );
}
