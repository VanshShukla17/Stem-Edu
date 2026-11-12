import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, CheckCircle } from 'lucide-react';

export default function LessonReaderPage() {
  const { lessonId } = useParams();

  return (
    <div>
      <Link to="/subjects" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--color-primary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '500', marginBottom: '12px' }}>
        <ArrowLeft size={16} /> Back to Chapter
      </Link>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: '600' }}>LESSON {lessonId}</span>
          <button className="btn btn-secondary" style={{ width: 'auto', padding: '6px 10px', fontSize: '0.8rem', color: 'var(--color-secondary)' }}>
            <Sparkles size={14} /> AI Summarise
          </button>
        </div>

        <h1 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '12px' }}>
          Electric Current and Simple Circuits
        </h1>

        <div style={{ lineHeight: '1.7', fontSize: '0.98rem', color: 'var(--color-text)', display: 'grid', gap: '12px' }}>
          <p>
            An electric current is expressed by the amount of charge flowing through a particular area in unit time.
            In other words, it is the rate of flow of electric charges.
          </p>
          <div style={{ backgroundColor: 'var(--color-primary-light)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', borderLeft: '4px solid var(--color-primary)', fontWeight: '500' }}>
            Formula: I = Q / t (Current = Charge / Time)
          </div>
          <p>
            The SI unit of electric charge is coulomb (C), which is equivalent to the charge contained in nearly 6 × 10¹⁸ electrons.
            The electric current is expressed by a unit called ampere (A), named after the French scientist Andre-Marie Ampere.
          </p>
        </div>

        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
          <button className="btn btn-primary">
            <CheckCircle size={18} /> Mark Lesson as Complete
          </button>
        </div>
      </div>
    </div>
  );
}
