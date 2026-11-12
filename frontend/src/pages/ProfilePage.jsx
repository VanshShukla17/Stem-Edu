import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Globe, BookOpen, Check } from 'lucide-react';

export default function ProfilePage() {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [language, setLanguage] = useState(user?.language || 'en');
  const [classLevel, setClassLevel] = useState(user?.classLevel || 10);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      await updateProfile({ language, class: Number(classLevel) });
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div>
      <h1 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '16px' }}>Student Profile</h1>

      {message && <div className="alert alert-success">{message}</div>}

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
          <div style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', padding: '14px', borderRadius: '50%' }}>
            <User size={28} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: '700' }}>{user?.name || 'Student'}</h2>
            <p style={{ color: 'var(--color-muted)', fontSize: '0.88rem' }}>{user?.email || user?.phone || 'No identifier'}</p>
          </div>
        </div>

        {/* Learning Settings */}
        <div className="form-group">
          <label className="form-label">
            <BookOpen size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
            Class Grade
          </label>
          <div className="pill-group">
            {[9, 10, 11, 12].map((cls) => (
              <button
                key={cls}
                type="button"
                className={`pill-btn ${classLevel === cls ? 'active' : ''}`}
                onClick={() => setClassLevel(cls)}
              >
                Class {cls}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">
            <Globe size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
            Content Language
          </label>
          <div className="pill-group">
            <button
              type="button"
              className={`pill-btn ${language === 'en' ? 'active' : ''}`}
              onClick={() => setLanguage('en')}
            >
              English
            </button>
            <button
              type="button"
              className={`pill-btn ${language === 'hi' ? 'active' : ''}`}
              onClick={() => setLanguage('hi')}
            >
              हिंदी (Hindi)
            </button>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="btn btn-primary"
          style={{ marginBottom: '12px' }}
        >
          <Check size={16} /> {saving ? 'Saving...' : 'Save Preferences'}
        </button>

        <button onClick={handleLogout} className="btn btn-secondary" style={{ color: 'var(--color-error)' }}>
          <LogOut size={16} /> Log Out
        </button>
      </div>
    </div>
  );
}
