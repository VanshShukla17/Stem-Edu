import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Loader2, Sparkles, Image as ImageIcon } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function LessonReaderPage() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [progressInfo, setProgressInfo] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadLesson() {
      try {
        setLoading(true);
        const data = await api.getLesson(lessonId);
        setLesson(data);
        if (data.isCompleted) {
          setCompleted(true);
        }
      } catch (err) {
        console.error('Failed to load lesson:', err);
        setError('Failed to load lesson notes.');
      } finally {
        setLoading(false);
      }
    }

    loadLesson();
  }, [lessonId]);

  // Task 5.3: Handle Mark as Complete
  const handleMarkComplete = async () => {
    try {
      setCompleting(true);
      const res = await api.completeLesson(lessonId);
      setCompleted(true);
      setProgressInfo(res);
    } catch (err) {
      console.error('Error completing lesson:', err);
      setError('Could not update lesson progress.');
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0', color: 'var(--color-primary)' }}>
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div>
        <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ width: 'auto', marginBottom: '16px' }}>
          <ArrowLeft size={16} /> Go Back
        </button>
        <div className="alert alert-error">{error || 'Lesson not found'}</div>
      </div>
    );
  }

  const isHindi = user?.language === 'hi';
  const title = isHindi && lesson.titleHindi ? lesson.titleHindi : lesson.title;

  return (
    <div>
      {/* Top back action */}
      <button
        onClick={() => navigate(-1)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: 'none',
          border: 'none',
          color: 'var(--color-primary)',
          fontSize: '0.9rem',
          fontWeight: '500',
          cursor: 'pointer',
          padding: 0,
          marginBottom: '12px'
        }}
      >
        <ArrowLeft size={16} /> Back to Chapter
      </button>

      {/* Progress banner if marked complete */}
      {completed && progressInfo && (
        <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={18} />
          <span>
            Lesson completed! Chapter progress is now <strong>{progressInfo.completionPercentage}%</strong> ({progressInfo.completedLessonsCount} of {progressInfo.totalLessonsCount} lessons).
          </span>
        </div>
      )}

      {/* Main Lesson Reader Container */}
      <article className="card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: '700', letterSpacing: '0.04em' }}>
            LESSON {lesson.lessonNumber || 1}
          </span>
          <button
            className="btn btn-secondary"
            style={{ width: 'auto', padding: '6px 12px', fontSize: '0.8rem', color: 'var(--color-secondary)' }}
            onClick={() => alert('AI Summary modal will open in Phase 7!')}
          >
            <Sparkles size={14} /> Summarise with AI
          </button>
        </div>

        <h1 style={{ fontSize: '1.35rem', fontWeight: '800', lineHeight: '1.3', marginBottom: '18px' }}>
          {title}
        </h1>

        {/* Content Blocks: Renders text, formula, and image blocks (Task 5.3) */}
        <div style={{ display: 'grid', gap: '16px', lineHeight: '1.7', fontSize: '1rem' }}>
          {lesson.contentBlocks && lesson.contentBlocks.length > 0 ? (
            lesson.contentBlocks.map((block, idx) => {
              const textContent = isHindi && block.contentHindi ? block.contentHindi : block.content;

              if (block.type === 'text') {
                return (
                  <p key={idx} style={{ color: 'var(--color-text)' }}>
                    {textContent}
                  </p>
                );
              }

              if (block.type === 'formula') {
                return (
                  <div
                    key={idx}
                    style={{
                      backgroundColor: 'var(--color-primary-light)',
                      borderLeft: '4px solid var(--color-primary)',
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-sm)',
                      fontWeight: '600',
                      fontFamily: 'monospace',
                      fontSize: '0.98rem',
                      color: 'var(--color-primary-dark)'
                    }}
                  >
                    {textContent}
                  </div>
                );
              }

              if (block.type === 'image') {
                return (
                  <div key={idx} style={{ margin: '8px 0' }}>
                    {block.mediaUrl ? (
                      <img
                        src={block.mediaUrl}
                        alt={textContent || 'Lesson illustration'}
                        style={{
                          width: '100%',
                          maxHeight: '260px',
                          objectFit: 'cover',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--color-border)'
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          padding: '30px',
                          backgroundColor: 'var(--color-background)',
                          borderRadius: 'var(--radius-md)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          color: 'var(--color-muted)'
                        }}
                      >
                        <ImageIcon size={20} />
                        <span>{textContent || 'Diagram visual placeholder'}</span>
                      </div>
                    )}
                    {textContent && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)', textAlign: 'center', marginTop: '6px' }}>
                        {textContent}
                      </div>
                    )}
                  </div>
                );
              }

              if (block.type === 'callout') {
                return (
                  <div
                    key={idx}
                    style={{
                      backgroundColor: '#FEF3C7',
                      borderLeft: '4px solid #D97706',
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.92rem',
                      color: '#92400E'
                    }}
                  >
                    {textContent}
                  </div>
                );
              }

              return <p key={idx}>{textContent}</p>;
            })
          ) : (
            <p>Lesson content will appear here.</p>
          )}
        </div>

        {/* Mark as Complete Footer Button (Task 5.3) */}
        <div style={{ marginTop: '32px', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
          {completed ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '14px',
                backgroundColor: 'var(--color-success-light)',
                color: 'var(--color-success)',
                borderRadius: 'var(--radius-md)',
                fontWeight: '700',
                fontSize: '1rem'
              }}
            >
              <CheckCircle2 size={20} />
              <span>Lesson Completed!</span>
            </div>
          ) : (
            <button
              onClick={handleMarkComplete}
              disabled={completing}
              className="btn btn-primary"
            >
              <CheckCircle2 size={18} />
              <span>{completing ? 'Marking as Complete...' : 'Mark as Complete'}</span>
            </button>
          )}
        </div>
      </article>
    </div>
  );
}
