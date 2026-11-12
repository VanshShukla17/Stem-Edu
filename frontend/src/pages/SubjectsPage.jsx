import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Atom, FlaskConical, Dna, Calculator, ArrowRight, Loader2 } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const iconMap = {
  Atom,
  FlaskConical,
  Dna,
  Calculator
};

export default function SubjectsPage() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadSubjects() {
      try {
        setLoading(true);
        const data = await api.getSubjects();
        // If data from API is available, use it
        if (data && data.length > 0) {
          // For each subject, fetch its chapters so we can link directly
          const withChapters = await Promise.all(
            data.map(async (sub) => {
              try {
                const chapters = await api.getSubjectChapters(sub._id || sub.id);
                return {
                  ...sub,
                  chapters: chapters || []
                };
              } catch {
                return { ...sub, chapters: [] };
              }
            })
          );
          setSubjects(withChapters);
        } else {
          // Fallback to default 4 subjects if none in DB
          setSubjects([
            { id: 'physics', code: 'physics', name: 'Physics', nameHindi: 'भौतिक विज्ञान', color: '#2563EB', icon: 'Atom', chapters: [{ id: '1', title: 'Electricity' }] },
            { id: 'chemistry', code: 'chemistry', name: 'Chemistry', nameHindi: 'रसायन विज्ञान', color: '#7C3AED', icon: 'FlaskConical', chapters: [{ id: '1', title: 'Chemical Reactions' }] },
            { id: 'biology', code: 'biology', name: 'Biology', nameHindi: 'जीव विज्ञान', color: '#16A34A', icon: 'Dna', chapters: [{ id: '1', title: 'Life Processes' }] },
            { id: 'mathematics', code: 'mathematics', name: 'Mathematics', nameHindi: 'गणित', color: '#CA8A04', icon: 'Calculator', chapters: [{ id: '1', title: 'Real Numbers' }] }
          ]);
        }
      } catch (err) {
        console.error('Failed to load subjects:', err);
        setError('Could not load subjects. Showing standard curriculum.');
      } finally {
        setLoading(false);
      }
    }

    loadSubjects();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: '800' }}>
          {user?.language === 'hi' ? 'पाठ्यक्रम विषय' : 'STEM Subjects'}
        </h1>
        <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem' }}>
          Class {user?.classLevel || 10} • {user?.board || 'CBSE'}
        </p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0', color: 'var(--color-primary)' }}>
          <Loader2 className="animate-spin" size={32} />
        </div>
      ) : (
        /* Task 5.1: Done when the four subjects show as cards */
        <div style={{ display: 'grid', gap: '12px' }}>
          {subjects.map((sub) => {
            const Icon = iconMap[sub.icon] || Atom;
            const primaryChapter = (sub.chapters && sub.chapters[0]) || { id: '1', title: 'Introductory Concepts' };
            const subId = sub._id || sub.id;
            const chapId = primaryChapter._id || primaryChapter.id || '1';

            return (
              <Link
                key={sub.code || sub.name}
                to={`/subjects/${subId}/chapters/${chapId}`}
                className="card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 0,
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'transform 0.1s ease',
                  borderLeft: `4px solid ${sub.color || 'var(--color-primary)'}`
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      backgroundColor: `${sub.color || '#2563EB'}15`,
                      color: sub.color || '#2563EB',
                      padding: '12px',
                      borderRadius: '12px'
                    }}
                  >
                    <Icon size={26} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.05rem', fontWeight: '700' }}>
                      {user?.language === 'hi' && sub.nameHindi ? sub.nameHindi : sub.name}
                    </h2>
                    <div style={{ color: 'var(--color-muted)', fontSize: '0.82rem' }}>
                      {user?.language === 'hi' ? sub.name : sub.nameHindi}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: sub.color || 'var(--color-primary)', fontWeight: '600', marginTop: '3px' }}>
                      {primaryChapter.title}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-muted)' }}>
                  <ArrowRight size={20} />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
