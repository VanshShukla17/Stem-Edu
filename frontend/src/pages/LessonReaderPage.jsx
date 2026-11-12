import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Sparkles,
  Image as ImageIcon,
  X,
  RotateCcw,
  Zap
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import InteractiveDiagram from '../components/InteractiveDiagram';

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

  // AI Summary State (Phase 7)
  const [showSummarySheet, setShowSummarySheet] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryData, setSummaryData] = useState(null);
  const [summaryError, setSummaryError] = useState('');
  const [summaryLang, setSummaryLang] = useState(user?.language || 'en');

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

  // Handle Mark as Complete (Task 5.3)
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

  // Handle AI Summarize Request (Task 7.6)
  const handleFetchSummary = async (langToUse = summaryLang) => {
    try {
      setShowSummarySheet(true);
      setSummaryLoading(true);
      setSummaryError('');
      const data = await api.getLessonSummary(lessonId, langToUse);
      setSummaryData(data);
    } catch (err) {
      console.error('Error getting AI summary:', err);
      setSummaryError(err.message || 'AI summary is temporarily unavailable. Please retry.');
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleLangToggle = (newLang) => {
    setSummaryLang(newLang);
    handleFetchSummary(newLang);
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

          {/* AI Summarise Action Trigger */}
          <button
            className="btn btn-secondary"
            style={{
              width: 'auto',
              padding: '6px 14px',
              fontSize: '0.82rem',
              color: 'var(--color-secondary)',
              borderColor: 'var(--color-secondary)',
              backgroundColor: '#F5F3FF',
              fontWeight: '600'
            }}
            onClick={() => handleFetchSummary(summaryLang)}
          >
            <Sparkles size={15} /> Summarise with AI
          </button>
        </div>

        <h1 style={{ fontSize: '1.35rem', fontWeight: '800', lineHeight: '1.3', marginBottom: '18px' }}>
          {title}
        </h1>

        {/* Content Blocks: Renders text, formula, image, and diagram blocks (Task 8.7) */}
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

              {/* Task 8.7: Embedded Interactive Diagram Block */}
              if (block.type === 'diagram') {
                return (
                  <div key={idx} style={{ margin: '8px 0' }}>
                    {textContent && (
                      <div style={{ fontWeight: '600', fontSize: '0.95rem', marginBottom: '6px', color: 'var(--color-primary)' }}>
                        {textContent}
                      </div>
                    )}
                    <InteractiveDiagram diagramId={block.diagramId || lesson.diagramId} />
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

          {/* Standalone linked diagram fallback if present and not embedded as block */}
          {lesson.diagramId && !lesson.contentBlocks?.some(b => b.type === 'diagram') && (
            <InteractiveDiagram diagramId={lesson.diagramId} />
          )}
        </div>

        {/* Mark as Complete Footer Button */}
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

      {/* AI Summary Bottom Sheet */}
      {showSummarySheet && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center'
          }}
          onClick={() => setShowSummarySheet(false)}
        >
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              width: '100%',
              maxWidth: '640px',
              borderTopLeftRadius: '20px',
              borderTopRightRadius: '20px',
              padding: '24px 20px 32px 20px',
              boxShadow: '0 -4px 20px rgba(0,0,0,0.15)',
              maxHeight: '80vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sheet Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ backgroundColor: '#F3E8FF', color: 'var(--color-secondary)', padding: '6px', borderRadius: '8px' }}>
                  <Sparkles size={18} />
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800' }}>AI Revision Summary</h3>
              </div>

              <button
                onClick={() => setShowSummarySheet(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted)', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Language toggle within bottom sheet */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <button
                type="button"
                className={`pill-btn ${summaryLang === 'en' ? 'active' : ''}`}
                style={{ padding: '6px 12px', fontSize: '0.82rem' }}
                onClick={() => handleLangToggle('en')}
              >
                English
              </button>
              <button
                type="button"
                className={`pill-btn ${summaryLang === 'hi' ? 'active' : ''}`}
                style={{ padding: '6px 12px', fontSize: '0.82rem' }}
                onClick={() => handleLangToggle('hi')}
              >
                हिंदी (Hindi)
              </button>
            </div>

            {/* Loading State */}
            {summaryLoading && (
              <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--color-secondary)' }}>
                <Loader2 className="animate-spin" size={32} style={{ margin: '0 auto 12px auto' }} />
                <p style={{ fontWeight: '600', fontSize: '0.95rem' }}>
                  Making your revision summary with AI...
                </p>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>
                  Extracting key definitions & formulas
                </span>
              </div>
            )}

            {/* Error State with Retry Button */}
            {summaryError && !summaryLoading && (
              <div style={{ padding: '16px 0' }}>
                <div className="alert alert-error" style={{ marginBottom: '16px' }}>
                  {summaryError}
                </div>
                <button
                  onClick={() => handleFetchSummary(summaryLang)}
                  className="btn btn-primary"
                  style={{ backgroundColor: 'var(--color-secondary)' }}
                >
                  <RotateCcw size={16} /> Retry AI Summary
                </button>
              </div>
            )}

            {/* Summary Result State */}
            {summaryData && !summaryLoading && !summaryError && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px' }}>
                  {summaryData.isCached ? (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        backgroundColor: 'var(--color-success-light)',
                        color: 'var(--color-success)',
                        padding: '4px 8px',
                        borderRadius: '999px',
                        fontSize: '0.75rem',
                        fontWeight: '600'
                      }}
                    >
                      <Zap size={12} /> Instant from Cache
                    </span>
                  ) : (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        backgroundColor: '#F3E8FF',
                        color: 'var(--color-secondary)',
                        padding: '4px 8px',
                        borderRadius: '999px',
                        fontSize: '0.75rem',
                        fontWeight: '600'
                      }}
                    >
                      <Sparkles size={12} /> Generated with Gemini AI
                    </span>
                  )}
                </div>

                <div
                  style={{
                    backgroundColor: 'var(--color-background)',
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    lineHeight: '1.7',
                    fontSize: '0.94rem',
                    whiteSpace: 'pre-line',
                    color: 'var(--color-text)'
                  }}
                >
                  {summaryData.summary}
                </div>

                <div style={{ marginTop: '20px' }}>
                  <button
                    onClick={() => setShowSummarySheet(false)}
                    className="btn btn-secondary"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
