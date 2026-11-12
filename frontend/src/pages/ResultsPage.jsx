import React from 'react';
import { Link } from 'react-router-dom';
import { Award, ArrowRight } from 'lucide-react';

export default function ResultsPage() {
  const mockResults = [
    { id: '1', chapter: 'Electricity', subject: 'Physics', score: 3, total: 3, date: 'Today' },
    { id: '2', chapter: 'Electricity', subject: 'Physics', score: 2, total: 3, date: 'Yesterday' }
  ];

  return (
    <div>
      <h1 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '6px' }}>Practice History</h1>
      <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
        Review your past test scores and solution explanations
      </p>

      <div style={{ display: 'grid', gap: '12px' }}>
        {mockResults.map((r) => (
          <div key={r.id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', padding: '10px', borderRadius: '10px' }}>
                <Award size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '0.98rem', fontWeight: '700' }}>{r.chapter}</h3>
                <div style={{ color: 'var(--color-muted)', fontSize: '0.8rem' }}>{r.subject} • {r.date}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontWeight: '700', fontSize: '0.95rem', color: r.score === r.total ? 'var(--color-success)' : 'var(--color-primary)' }}>
                {r.score}/{r.total}
              </span>
              <ArrowRight size={18} style={{ color: 'var(--color-muted)' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

