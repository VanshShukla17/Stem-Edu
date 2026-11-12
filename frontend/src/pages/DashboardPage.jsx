import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen,
  CheckCircle,
  Cpu,
  ArrowRight,
  Award,
  Loader2,
  Atom,
  FlaskConical,
  Dna,
  Calculator
} from 'lucide-react';
import api from '../services/api';

const iconMap = {
  Atom,
  FlaskConical,
  Dna,
  Calculator
};

export default function DashboardPage() {
  const { user } = useAuth();

  const [subjects, setSubjects] = useState([]);
  const [progressList, setProgressList] = useState([]);
  const [recentScores, setRecentScores] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch real data from the API (Task 5.4)
  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);

        const [subjectsRes, progressRes, resultsRes] = await Promise.allSettled([
          api.getSubjects(),
          api.getProgress(),
          api.getResults()
        ]);

        const loadedSubjects = subjectsRes.status === 'fulfilled' ? subjectsRes.value : [];
        const loadedProgress = progressRes.status === 'fulfilled' ? progressRes.value : [];
        const loadedResults = resultsRes.status === 'fulfilled' ? resultsRes.value : [];

        // For each subject, fetch its chapters so we have progress per subject
        const subjectsWithProgress = await Promise.all(
          loadedSubjects.map(async (sub) => {
            try {
              const chapters = await api.getSubjectChapters(sub._id || sub.id);
              // Calculate average subject completion
              let avgProgress = 0;
              if (chapters && chapters.length > 0) {
                const totalPct = chapters.reduce((acc, c) => acc + (c.completionPercentage || 0), 0);
                avgProgress = Math.round(totalPct / chapters.length);
              }
              return {
                ...sub,
                chapters: chapters || [],
                progressPercentage: avgProgress
              };
            } catch {
              return { ...sub, chapters: [], progressPercentage: 0 };
            }
          })
        );

        setSubjects(subjectsWithProgress);
        setProgressList(loadedProgress);
        setRecentScores(loadedResults);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  // Determine Continue Learning bookmark
  const latestProgress = progressList && progressList.length > 0 ? progressList[0] : null;
  const firstSubject = subjects && subjects.length > 0 ? subjects[0] : null;
  const firstChapter = firstSubject && firstSubject.chapters && firstSubject.chapters[0] ? firstSubject.chapters[0] : null;

  const continueChapterTitle = latestProgress?.chapterId?.title || firstChapter?.title || 'Electricity (विद्युत)';
  const continueSubjectId = latestProgress?.chapterId?.subjectId || firstSubject?._id || firstSubject?.id || 'physics';
  const continueChapterId = latestProgress?.chapterId?._id || latestProgress?.chapterId || firstChapter?._id || firstChapter?.id || '1';
  const continuePercentage = latestProgress?.completionPercentage || firstSubject?.progressPercentage || 0;
  const continueLessonText = latestProgress?.lastAccessedLessonId?.title
    ? `Resuming: ${latestProgress.lastAccessedLessonId.title}`
    : 'Start learning the basics of electric charge & circuits';

  return (
    <div>
      {/* Student Welcome Header */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: '800' }}>
          Namaste, {user?.name || 'Student'}! 👋
        </h1>
        <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem' }}>
          Class {user?.classLevel || 10} • {user?.board || 'CBSE'} • {user?.language === 'hi' ? 'हिंदी माध्यम' : 'English Medium'}
        </p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0', color: 'var(--color-primary)' }}>
          <Loader2 className="animate-spin" size={32} />
        </div>
      ) : (
        <>
          {/* Section 1: Continue Learning (Task 5.4) */}
          <div
            className="card"
            style={{
              background: 'linear-gradient(135deg, #1E40AF 0%, #2563EB 100%)',
              color: 'white',
              border: 'none',
              marginBottom: '20px'
            }}
          >
            <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.85, marginBottom: '6px' }}>
              CONTINUE LEARNING
            </div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '6px' }}>
              {continueChapterTitle}
            </h2>
            <p style={{ fontSize: '0.88rem', opacity: 0.9, marginBottom: '14px' }}>
              {continueLessonText}
            </p>

            <div className="progress-bar-bg" style={{ backgroundColor: 'rgba(255,255,255,0.25)', height: '6px' }}>
              <div
                className="progress-bar-fill"
                style={{ width: `${continuePercentage}%`, backgroundColor: '#60A5FA' }}
              ></div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
              <span style={{ fontSize: '0.82rem', opacity: 0.85 }}>
                {continuePercentage}% completed
              </span>
              <Link
                to={`/subjects/${continueSubjectId}/chapters/${continueChapterId}`}
                style={{
                  backgroundColor: 'white',
                  color: 'var(--color-primary)',
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: '600',
                  fontSize: '0.88rem',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                Resume <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Section 2: Progress Per Subject (Task 5.4) */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Progress per Subject</h2>
              <Link to="/subjects" style={{ color: 'var(--color-primary)', fontSize: '0.85rem', fontWeight: '600', textDecoration: 'none' }}>
                View All
              </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              {subjects.map((sub) => {
                const Icon = iconMap[sub.icon] || Atom;
                const pct = sub.progressPercentage || 0;
                const primaryChap = sub.chapters && sub.chapters[0];
                const linkUrl = primaryChap
                  ? `/subjects/${sub._id || sub.id}/chapters/${primaryChap._id || primaryChap.id}`
                  : '/subjects';

                return (
                  <Link
                    key={sub.code || sub.name}
                    to={linkUrl}
                    className="card"
                    style={{
                      marginBottom: 0,
                      textDecoration: 'none',
                      color: 'inherit',
                      padding: '14px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ color: sub.color || 'var(--color-primary)', marginBottom: '8px' }}>
                        <Icon size={24} />
                      </div>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '2px' }}>{sub.name}</h3>
                      <div style={{ color: 'var(--color-muted)', fontSize: '0.78rem' }}>{sub.nameHindi}</div>
                    </div>

                    <div style={{ marginTop: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: '600', color: 'var(--color-muted)', marginBottom: '4px' }}>
                        <span>Progress</span>
                        <span style={{ color: pct > 0 ? 'var(--color-primary)' : 'inherit' }}>{pct}%</span>
                      </div>
                      <div className="progress-bar-bg" style={{ height: '5px', margin: 0 }}>
                        <div
                          className="progress-bar-fill"
                          style={{ width: `${pct}%`, backgroundColor: sub.color || 'var(--color-primary)' }}
                        ></div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Section 3: Recent Test Scores (Task 5.4) */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Recent Test Scores</h2>
              <Link to="/results" style={{ color: 'var(--color-primary)', fontSize: '0.85rem', fontWeight: '600', textDecoration: 'none' }}>
                All Results
              </Link>
            </div>

            {recentScores && recentScores.length > 0 ? (
              <div style={{ display: 'grid', gap: '10px' }}>
                {recentScores.slice(0, 3).map((res) => {
                  const chapName = res.chapterId?.title || 'Chapter Practice Test';
                  const dateStr = new Date(res.createdAt).toLocaleDateString();

                  return (
                    <div
                      key={res._id || res.id}
                      className="card"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 0,
                        padding: '12px 14px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', padding: '8px', borderRadius: '8px' }}>
                          <Award size={18} />
                        </div>
                        <div>
                          <div style={{ fontWeight: '600', fontSize: '0.92rem' }}>{chapName}</div>
                          <div style={{ color: 'var(--color-muted)', fontSize: '0.78rem' }}>{dateStr}</div>
                        </div>
                      </div>
                      <div
                        style={{
                          fontWeight: '700',
                          fontSize: '0.92rem',
                          color: res.percentage >= 80 ? 'var(--color-success)' : 'var(--color-primary)',
                          backgroundColor: res.percentage >= 80 ? 'var(--color-success-light)' : 'var(--color-primary-light)',
                          padding: '4px 10px',
                          borderRadius: '999px'
                        }}
                      >
                        {res.score}/{res.totalQuestions} ({res.percentage}%)
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
                  padding: '24px',
                  color: 'var(--color-muted)',
                  fontSize: '0.9rem'
                }}
              >
                No test attempts yet. Practice chapter MCQs to track your performance!
              </div>
            )}
          </div>

          {/* Quick 3D Virtual Lab Link */}
          <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ backgroundColor: '#F3E8FF', color: 'var(--color-secondary)', padding: '10px', borderRadius: '10px' }}>
                <Cpu size={22} />
              </div>
              <div>
                <div style={{ fontWeight: '600', fontSize: '0.92rem' }}>Physics Virtual Lab</div>
                <div style={{ color: 'var(--color-muted)', fontSize: '0.8rem' }}>Simple Pendulum Simulation</div>
              </div>
            </div>
            <Link to="/labs/pendulum" className="btn btn-secondary" style={{ width: 'auto', padding: '6px 12px', fontSize: '0.85rem' }}>
              Open Lab
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
