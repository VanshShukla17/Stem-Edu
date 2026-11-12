import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, CheckCircle, Cpu, ArrowRight, Activity } from 'lucide-react';
import api from '../services/api';

export default function DashboardPage() {
  const { user } = useAuth();
  const [healthStatus, setHealthStatus] = useState(null);

  // Call health route from frontend to satisfy Task 4.3
  useEffect(() => {
    async function checkBackendHealth() {
      try {
        const health = await api.getHealth();
        setHealthStatus(health.status);
      } catch (err) {
        console.error('Failed to call health route:', err);
        setHealthStatus('error');
      }
    }
    checkBackendHealth();
  }, []);

  return (
    <div>
      {/* Greeting Banner */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: '800' }}>
          Namaste, {user?.name || 'Student'}! 👋
        </h1>
        <p style={{ color: 'var(--color-muted)', fontSize: '0.92rem' }}>
          Class {user?.classLevel || 10} • {user?.board || 'CBSE'} • {user?.language === 'hi' ? 'हिंदी' : 'English'}
        </p>
      </div>

      {/* Backend API Connection Indicator (Task 4.3) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          backgroundColor: healthStatus === 'ok' ? 'var(--color-success-light)' : '#FEF3C7',
          color: healthStatus === 'ok' ? 'var(--color-success)' : '#B45309',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.85rem',
          fontWeight: '500',
          marginBottom: '16px'
        }}
      >
        <Activity size={16} />
        <span>
          Backend API Status:{' '}
          <strong>{healthStatus ? healthStatus.toUpperCase() : 'Connecting...'}</strong>
        </span>
      </div>

      {/* Continue Learning Card */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #1E40AF 0%, #2563EB 100%)', color: 'white', border: 'none' }}>
        <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.85, marginBottom: '6px' }}>
          Continue Learning
        </div>
        <h2 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '8px' }}>
          Physics: Electricity (विद्युत)
        </h2>
        <p style={{ fontSize: '0.88rem', opacity: 0.9, marginBottom: '14px' }}>
          Next: Ohm's Law and Factors Affecting Resistance
        </p>

        <div className="progress-bar-bg" style={{ backgroundColor: 'rgba(255,255,255,0.25)', height: '6px' }}>
          <div className="progress-bar-fill" style={{ width: '50%', backgroundColor: '#60A5FA' }}></div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
          <span style={{ fontSize: '0.82rem', opacity: 0.85 }}>2 of 4 lessons complete</span>
          <Link
            to="/subjects"
            style={{
              backgroundColor: 'white',
              color: 'var(--color-primary)',
              padding: '8px 14px',
              borderRadius: 'var(--radius-sm)',
              fontWeight: '600',
              fontSize: '0.88rem',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            Resume <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Quick Action Pillars */}
      <h3 style={{ fontSize: '1.05rem', fontWeight: '700', margin: '20px 0 12px 0' }}>
        Explore Curriculum
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
        <Link to="/subjects" className="card" style={{ textDecoration: 'none', color: 'inherit', marginBottom: 0 }}>
          <div style={{ color: 'var(--color-primary)', marginBottom: '8px' }}>
            <BookOpen size={24} />
          </div>
          <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>Subjects</div>
          <div style={{ color: 'var(--color-muted)', fontSize: '0.8rem' }}>4 STEM subjects</div>
        </Link>

        <Link to="/results" className="card" style={{ textDecoration: 'none', color: 'inherit', marginBottom: 0 }}>
          <div style={{ color: 'var(--color-success)', marginBottom: '8px' }}>
            <CheckCircle size={24} />
          </div>
          <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>Practice Tests</div>
          <div style={{ color: 'var(--color-muted)', fontSize: '0.8rem' }}>MCQs & Solutions</div>
        </Link>
      </div>

      {/* 3D Lab Teaser */}
      <div className="card" style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ backgroundColor: '#F3E8FF', color: 'var(--color-secondary)', padding: '10px', borderRadius: '10px' }}>
            <Cpu size={24} />
          </div>
          <div>
            <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>Virtual Physics Lab</div>
            <div style={{ color: 'var(--color-muted)', fontSize: '0.82rem' }}>Simple Pendulum Simulation</div>
          </div>
        </div>
        <Link to="/labs/pendulum" className="btn btn-secondary" style={{ width: 'auto', padding: '6px 12px', fontSize: '0.85rem' }}>
          Launch
        </Link>
      </div>
    </div>
  );
}
