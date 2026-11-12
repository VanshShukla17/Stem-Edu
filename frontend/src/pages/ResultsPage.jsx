import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Award, ArrowRight, Loader2, Calendar, Clock, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

export default function ResultsPage() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch past test results (Task 6.3)
  useEffect(() => {
    async function loadResults() {
      try {
        setLoading(true);
        const data = await api.getResults();
        setResults(data || []);
      } catch (err) {
        console.error('Failed to load results:', err);
        setError('Failed to fetch test history.');
      } finally {
        setLoading(false);
      }
    }

    loadResults();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: '800' }}>Practice Test History</h1>
        <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem' }}>
          Review your previous test scores and monitor your progress
        </p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '50px 0', color: 'var(--color-primary)' }}>
          <Loader2 className="animate-spin" size={32} />
        </div>
      ) : results.length > 0 ? (
        /* Task 6.3: Done when past attempts are listed */
        <div style={{ display: 'grid', gap: '12px' }}>
          {results.map((item, idx) => {
            const chapTitle = item.chapterId?.title || 'Chapter Practice Test';
            const dateStr = new Date(item.createdAt).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            });
            const isHigh = item.percentage >= 80;

            return (
              <div
                key={item._id || item.id || idx}
                className="card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 0,
                  padding: '16px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      backgroundColor: isHigh ? 'var(--color-success-light)' : 'var(--color-primary-light)',
                      color: isHigh ? 'var(--color-success)' : 'var(--color-primary)',
                      padding: '12px',
                      borderRadius: '12px'
                    }}
                  >
                    <Award size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: '700' }}>{chapTitle}</h3>
                    <div style={{ display: 'flex', gap: '12px', color: 'var(--color-muted)', fontSize: '0.8rem', marginTop: '3px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={13} /> {dateStr}
                      </span>
                      {item.timeTakenSeconds > 0 && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={13} /> {item.timeTakenSeconds}s
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div
                    style={{
                      display: 'inline-block',
                      fontWeight: '700',
                      fontSize: '0.92rem',
                      color: isHigh ? 'var(--color-success)' : 'var(--color-primary)',
                      backgroundColor: isHigh ? 'var(--color-success-light)' : 'var(--color-primary-light)',
                      padding: '4px 10px',
                      borderRadius: '999px',
                      marginBottom: '4px'
                    }}
                  >
                    {item.score} / {item.totalQuestions} ({item.percentage}%)
                  </div>
                  <div style={{ fontSize: '0.75rem', color: isHigh ? 'var(--color-success)' : 'var(--color-muted)', fontWeight: '600' }}>
                    {isHigh ? 'Passed' : 'Needs Practice'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div
          className="card"
          style={{
            textAlign: 'center',
            padding: '36px 20px',
            color: 'var(--color-muted)'
          }}
        >
          <Award size={40} style={{ margin: '0 auto 12px auto', opacity: 0.5 }} />
          <h3 style={{ fontSize: '1.05rem', fontWeight: '600', color: 'var(--color-text)', marginBottom: '6px' }}>
            No Test Attempts Yet
          </h3>
          <p style={{ fontSize: '0.88rem', marginBottom: '20px' }}>
            Take an MCQ test from any chapter to evaluate your understanding and see your detailed history here!
          </p>
          <Link to="/subjects" className="btn btn-primary" style={{ width: 'auto', padding: '10px 20px' }}>
            Browse Subjects to Practice
          </Link>
        </div>
      )}
    </div>
  );
}
