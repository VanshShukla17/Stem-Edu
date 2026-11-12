import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BookOpen, CheckCircle2, ArrowLeft, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ChapterPage() {
  const { subjectId, chapterId } = useParams();
  const { user } = useAuth();

  const [lessons, setLessons] = useState([]);
  const [chapterInfo, setChapterInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadChapterData() {
      try {
        setLoading(true);
        // Fetch lessons for this chapter
        const lessonsData = await api.getChapterLessons(chapterId);
        setLessons(lessonsData || []);

        // Also fetch parent subject chapters to get chapter metadata
        if (subjectId) {
          try {
            const chapters = await api.getSubjectChapters(subjectId);
            const current = chapters.find(c => (c._id || c.id) === chapterId);
            if (current) {
              setChapterInfo(current);
            }
          } catch (_) {}
        }
      } catch (err) {
        console.error('Failed to load chapter lessons:', err);
        setError('Failed to load lessons for this chapter.');
      } finally {
        setLoading(false);
      }
    }

    loadChapterData();
  }, [chapterId, subjectId]);

  // Compute progress percentage
  const totalCount = lessons.length;
  const completedCount = lessons.filter(l => l.isCompleted).length;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div>
      <Link
        to="/subjects"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          color: 'var(--color-primary)',
          textDecoration: 'none',
          fontSize: '0.9rem',
          fontWeight: '500',
          marginBottom: '12px'
        }}
      >
        <ArrowLeft size={16} /> Back to Subjects
      </Link>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Chapter Overview Header */}
      <div className="card">
        <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--color-primary)', fontWeight: '700', letterSpacing: '0.04em' }}>
          CHAPTER OVERVIEW
        </div>
        <h1 style={{ fontSize: '1.3rem', fontWeight: '800', margin: '4px 0 6px 0' }}>
          {user?.language === 'hi' && chapterInfo?.titleHindi
            ? chapterInfo.titleHindi
            : (chapterInfo?.title || 'Electricity (विद्युत)')}
        </h1>
        <p style={{ color: 'var(--color-muted)', fontSize: '0.88rem', marginBottom: '14px' }}>
          {user?.language === 'hi' && chapterInfo?.descriptionHindi
            ? chapterInfo.descriptionHindi
            : (chapterInfo?.description || 'Learn core concepts, formulas, interactive diagrams, and practical applications.')}
        </p>

        {/* Chapter Progress Bar (Task 5.2) */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>
            <span>Chapter Progress</span>
            <span style={{ color: percentage === 100 ? 'var(--color-success)' : 'var(--color-primary)' }}>
              {completedCount} of {totalCount} completed ({percentage}%)
            </span>
          </div>
          <div className="progress-bar-bg" style={{ height: '8px' }}>
            <div
              className="progress-bar-fill"
              style={{
                width: `${percentage}%`,
                backgroundColor: percentage === 100 ? 'var(--color-success)' : 'var(--color-primary)'
              }}
            ></div>
          </div>
        </div>

        <Link to={`/practice/${chapterId}`} className="btn btn-primary" style={{ padding: '10px' }}>
          <Sparkles size={16} /> Practice Chapter MCQs
        </Link>
      </div>

      <h2 style={{ fontSize: '1.05rem', fontWeight: '700', margin: '20px 0 12px 0' }}>
        Lessons in this Chapter
      </h2>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '30px 0', color: 'var(--color-primary)' }}>
          <Loader2 className="animate-spin" size={28} />
        </div>
      ) : (
        /* Lessons List with Ticks for Completed Lessons (Task 5.2) */
        <div style={{ display: 'grid', gap: '10px' }}>
          {lessons.map((lesson) => {
            const isDone = !!lesson.isCompleted;
            const lessonId = lesson._id || lesson.id;

            return (
              <Link
                key={lessonId}
                to={`/lessons/${lessonId}`}
                className="card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 0,
                  textDecoration: 'none',
                  color: 'inherit',
                  borderLeft: isDone ? '4px solid var(--color-success)' : '4px solid var(--color-border)',
                  backgroundColor: isDone ? '#F0FDF4' : 'var(--color-surface)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: isDone ? 'var(--color-success-light)' : 'var(--color-border)',
                      color: isDone ? 'var(--color-success)' : 'var(--color-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '700',
                      fontSize: '0.82rem'
                    }}
                  >
                    {lesson.lessonNumber || 1}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: '600' }}>
                      {user?.language === 'hi' && lesson.titleHindi ? lesson.titleHindi : lesson.title}
                    </h3>
                    <div style={{ fontSize: '0.78rem', color: isDone ? 'var(--color-success)' : 'var(--color-muted)' }}>
                      {isDone ? 'Completed' : 'Ready to start'}
                    </div>
                  </div>
                </div>

                {/* Tick icon for completed lessons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {isDone ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-success)', fontWeight: '600', fontSize: '0.85rem' }}>
                      <CheckCircle2 size={20} />
                    </div>
                  ) : (
                    <BookOpen size={18} style={{ color: 'var(--color-muted)' }} />
                  )}
                  <ArrowRight size={16} style={{ color: 'var(--color-muted)' }} />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
