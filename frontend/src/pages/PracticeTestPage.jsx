import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function PracticeTestPage() {
  const { chapterId } = useParams();

  return (
    <div>
      <Link to="/subjects" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--color-primary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '500', marginBottom: '12px' }}>
        <ArrowLeft size={16} /> Exit Test
      </Link>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--color-muted)' }}>Question 1 of 10</span>
          <span style={{ fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: '600' }}>Chapter {chapterId}</span>
        </div>

        <h2 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '16px' }}>
          What is the SI unit of electric current?
        </h2>

        <div style={{ display: 'grid', gap: '10px' }}>
          {['Volt', 'Ampere', 'Ohm', 'Joule'].map((opt, i) => (
            <label
              key={opt}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 14px',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer'
              }}
            >
              <input type="radio" name="answer" value={i} />
              <span style={{ fontSize: '0.95rem' }}>{opt}</span>
            </label>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
          <button className="btn btn-secondary" style={{ width: '48%' }}>Previous</button>
          <button className="btn btn-primary" style={{ width: '48%' }}>Next Question</button>
        </div>
      </div>
    </div>
  );
}
