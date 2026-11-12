import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { BookOpen, CheckCircle, ArrowLeft } from 'lucide-react';

export default function ChapterPage() {
  const { subjectId, chapterId } = useParams();

  return (
    <div>
      <Link to="/subjects" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--color-primary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '500', marginBottom: '12px' }}>
        <ArrowLeft size={16} /> Back to Subjects
      </Link>

      <div className="card">
        <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--color-primary)', fontWeight: '600' }}>
          {subjectId?.toUpperCase()} • CHAPTER {chapterId}
        </div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: '700', margin: '4px 0 8px 0' }}>Electricity (विद्युत)</h1>
        <p style={{ color: 'var(--color-muted)', fontSize: '0.88rem', marginBottom: '16px' }}>
          Explore electric circuits, Ohm's law, resistance, and energy calculations.
        </p>

        <div style={{ display: 'flex', gap: '8px' }}>
          <Link to={`/practice/${chapterId}`} className="btn btn-primary" style={{ padding: '10px' }}>
            Take Chapter Test
          </Link>
        </div>
      </div>

      <h2 style={{ fontSize: '1rem', fontWeight: '700', margin: '20px 0 12px 0' }}>Chapter Lessons</h2>

      <div style={{ display: 'grid', gap: '10px' }}>
        {[
          { id: '1', title: 'Electric Current and Simple Circuits', completed: true },
          { id: '2', title: 'Electric Potential and Potential Difference', completed: true },
          { id: '3', title: "Ohm's Law and Resistance", completed: false },
          { id: '4', title: 'Heating Effect of Current', completed: false }
        ].map((les) => (
          <Link
            key={les.id}
            to={`/lessons/${les.id}`}
            className="card"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 0,
              textDecoration: 'none',
              color: 'inherit'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontWeight: '700', color: 'var(--color-muted)', width: '20px' }}>{les.id}.</span>
              <span style={{ fontSize: '0.92rem', fontWeight: '500' }}>{les.title}</span>
            </div>
            {les.completed ? (
              <CheckCircle size={18} style={{ color: 'var(--color-success)' }} />
            ) : (
              <BookOpen size={18} style={{ color: 'var(--color-muted)' }} />
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
