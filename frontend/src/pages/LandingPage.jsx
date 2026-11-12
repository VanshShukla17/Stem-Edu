import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, BookOpen, CheckCircle, Cpu, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '32px 16px' }}>
      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', padding: '6px 14px', borderRadius: '999px', fontSize: '0.85rem', fontWeight: '600', marginBottom: '16px' }}>
          <Sparkles size={16} /> Free STEM Education for Every Student
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', lineHeight: '1.25', marginBottom: '12px' }}>
          Master STEM in Your Board & Language
        </h1>
        <p style={{ color: 'var(--color-muted)', fontSize: '1.05rem', marginBottom: '24px' }}>
          Bilingual CBSE lessons, interactive diagrams, 3D virtual experiments, and instant practice tests right on your phone.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Link to="/signup" className="btn btn-primary" style={{ padding: '14px' }}>
            <span>Start Learning Free</span>
            <ArrowRight size={18} />
          </Link>
          <Link to="/login" className="btn btn-secondary">
            Already have an account? Log In
          </Link>
        </div>
      </div>

      {/* Feature Pillars */}
      <div style={{ display: 'grid', gap: '16px', marginBottom: '32px' }}>
        <div className="card" style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <div style={{ backgroundColor: 'var(--color-primary-light)', padding: '10px', borderRadius: '10px', color: 'var(--color-primary)' }}>
            <BookOpen size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '600', marginBottom: '4px' }}>Board-Aligned Notes</h3>
            <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem' }}>Read chapter lessons in English or Hindi with easy formulas and real-world examples.</p>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <div style={{ backgroundColor: 'var(--color-success-light)', padding: '10px', borderRadius: '10px', color: 'var(--color-success)' }}>
            <CheckCircle size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '600', marginBottom: '4px' }}>Instant MCQ Practice</h3>
            <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem' }}>Test your understanding with instant server-scored quizzes and step-by-step explanations.</p>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <div style={{ backgroundColor: '#F3E8FF', padding: '10px', borderRadius: '10px', color: 'var(--color-secondary)' }}>
            <Cpu size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '600', marginBottom: '4px' }}>3D Virtual Labs</h3>
            <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem' }}>Experience hands-on science experiments like the Simple Pendulum right in your browser.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

