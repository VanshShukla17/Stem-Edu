import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Award,
  RotateCcw,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function PracticeTestPage() {
  const { chapterId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Test state
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { [questionId]: selectedOptionIndex }
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [testResult, setTestResult] = useState(null); // When submitted, holds scored result
  const [showExitModal, setShowExitModal] = useState(false);
  const [startTime] = useState(Date.now());
  const [error, setError] = useState('');

  // Fetch test questions without correct answers (Task 3.4 & Task 6.1)
  useEffect(() => {
    async function loadQuestions() {
      try {
        setLoading(true);
        setError('');
        const data = await api.getChapterTest(chapterId);
        setQuestions(data || []);
      } catch (err) {
        console.error('Error fetching chapter test:', err);
        // Do not crash with an error screen; graceful fallback
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    }

    loadQuestions();
  }, [chapterId]);

  const handleSelectOption = (questionId, optionIndex) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleSubmitTest = async () => {
    try {
      setSubmitting(true);
      setError('');
      const timeTakenSeconds = Math.round((Date.now() - startTime) / 1000);

      // Format answers payload
      const answersPayload = questions.map(q => {
        const qId = q._id || q.id;
        return {
          questionId: qId,
          selectedOptionIndex: selectedAnswers[qId] !== undefined ? selectedAnswers[qId] : -1
        };
      });

      const result = await api.submitChapterTest(chapterId, {
        answers: answersPayload,
        timeTakenSeconds
      });

      setTestResult(result);
    } catch (err) {
      console.error('Error submitting test:', err);
      setError('Failed to submit test. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetake = () => {
    setSelectedAnswers({});
    setCurrentIndex(0);
    setTestResult(null);
  };

  const handleExitConfirm = () => {
    navigate(-1);
  };

  // Loading state
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0', color: 'var(--color-primary)' }}>
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  // Edge Case 1: Empty Chapter (Task 6.4 - no questions found, must not show error screen)
  if (!loading && (!questions || questions.length === 0)) {
    return (
      <div>
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
            marginBottom: '16px'
          }}
        >
          <ArrowLeft size={16} /> Back to Chapter
        </button>

        <div
          className="card"
          style={{
            textAlign: 'center',
            padding: '36px 20px',
            color: 'var(--color-text)'
          }}
        >
          <div style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
            <HelpCircle size={32} />
          </div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '8px' }}>
            No Questions Available Yet
          </h2>
          <p style={{ color: 'var(--color-muted)', fontSize: '0.92rem', marginBottom: '20px' }}>
            There are currently no practice questions seeded for this chapter. Practice tests will appear here soon!
          </p>
          <button onClick={() => navigate(-1)} className="btn btn-primary" style={{ width: 'auto', padding: '10px 20px' }}>
            Return to Chapter Lessons
          </button>
        </div>
      </div>
    );
  }

  // View B: Result Screen (Task 6.2 - Right & wrong marked with icon AND text)
  if (testResult) {
    const isPassing = testResult.percentage >= 60;

    return (
      <div>
        {/* Score Card Banner */}
        <div
          className="card"
          style={{
            textAlign: 'center',
            padding: '28px 20px',
            background: isPassing ? 'linear-gradient(135deg, #059669 0%, #10B981 100%)' : 'linear-gradient(135deg, #1E40AF 0%, #2563EB 100%)',
            color: 'white',
            border: 'none'
          }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', opacity: 0.9, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
            <Award size={20} /> Test Complete
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: '800', margin: '4px 0' }}>
            {testResult.score} / {testResult.totalQuestions}
          </h1>
          <div style={{ fontSize: '1.1rem', fontWeight: '600', opacity: 0.95, marginBottom: '16px' }}>
            Score: {testResult.percentage}%
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button
              onClick={handleRetake}
              className="btn btn-secondary"
              style={{ width: 'auto', padding: '8px 16px', color: 'var(--color-text)', backgroundColor: 'white' }}
            >
              <RotateCcw size={16} /> Retake Test
            </button>
            <Link
              to="/results"
              className="btn btn-secondary"
              style={{ width: 'auto', padding: '8px 16px', color: 'var(--color-text)', backgroundColor: 'white' }}
            >
              View All Results
            </Link>
          </div>
        </div>

        {/* Detailed Solutions Review (Task 6.2) */}
        <h2 style={{ fontSize: '1.15rem', fontWeight: '700', margin: '24px 0 12px 0' }}>
          Detailed Solutions & Explanations
        </h2>

        <div style={{ display: 'grid', gap: '16px' }}>
          {testResult.answers && testResult.answers.map((ans, idx) => {
            const isCorrect = ans.isCorrect;
            const originalQuestion = questions.find(q => (q._id || q.id) === (ans.questionId?._id || ans.questionId));
            const options = originalQuestion?.options || [];

            return (
              <div
                key={ans.questionId || idx}
                className="card"
                style={{
                  borderLeft: isCorrect ? '4px solid var(--color-success)' : '4px solid var(--color-error)'
                }}
              >
                {/* Status indicator: ICON AND TEXT (not colour alone, WCAG compliant) */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--color-muted)' }}>
                    QUESTION {idx + 1}
                  </span>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.82rem',
                      fontWeight: '700',
                      color: isCorrect ? 'var(--color-success)' : 'var(--color-error)'
                    }}
                  >
                    {isCorrect ? (
                      <>
                        <CheckCircle2 size={16} />
                        <span>[Your Answer: Correct]</span>
                      </>
                    ) : (
                      <>
                        <XCircle size={16} />
                        <span>[Your Answer: Incorrect]</span>
                      </>
                    )}
                  </div>
                </div>

                <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '12px' }}>
                  {ans.questionText || originalQuestion?.questionText}
                </h3>

                {/* Options Breakdown */}
                <div style={{ display: 'grid', gap: '8px', marginBottom: '12px' }}>
                  {options.map((optText, optIdx) => {
                    const isStudentChoice = ans.selectedOptionIndex === optIdx;
                    const isRightAnswer = ans.correctOptionIndex === optIdx;

                    let borderStyle = '1px solid var(--color-border)';
                    let bgStyle = 'var(--color-surface)';
                    let textBadge = null;

                    if (isRightAnswer) {
                      borderStyle = '2px solid var(--color-success)';
                      bgStyle = 'var(--color-success-light)';
                      textBadge = (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--color-success)', fontWeight: '700', fontSize: '0.8rem' }}>
                          <CheckCircle2 size={14} /> [Correct Answer]
                        </span>
                      );
                    } else if (isStudentChoice && !isCorrect) {
                      borderStyle = '2px solid var(--color-error)';
                      bgStyle = 'var(--color-error-light)';
                      textBadge = (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--color-error)', fontWeight: '700', fontSize: '0.8rem' }}>
                          <XCircle size={14} /> [Your Answer: Incorrect]
                        </span>
                      );
                    }

                    return (
                      <div
                        key={optIdx}
                        style={{
                          padding: '10px 14px',
                          borderRadius: 'var(--radius-sm)',
                          border: borderStyle,
                          backgroundColor: bgStyle,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: '0.92rem'
                        }}
                      >
                        <span>{optText}</span>
                        {textBadge}
                      </div>
                    );
                  })}
                </div>

                {/* Step-by-Step Pedagogical Explanation */}
                {ans.explanation && (
                  <div
                    style={{
                      backgroundColor: 'var(--color-background)',
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.88rem',
                      lineHeight: '1.5',
                      borderLeft: '3px solid var(--color-primary)'
                    }}
                  >
                    <strong>Explanation: </strong>
                    {ans.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ margin: '24px 0' }}>
          <button onClick={() => navigate(-1)} className="btn btn-primary">
            Back to Chapter Lessons
          </button>
        </div>
      </div>
    );
  }

  // View A: Active Test Mode (Task 6.1 - One question at a time with navigation)
  const currentQ = questions[currentIndex];
  const currentQId = currentQ?._id || currentQ?.id;
  const selectedIndex = selectedAnswers[currentQId];
  const isLastQuestion = currentIndex === questions.length - 1;
  const progressPercentage = Math.round(((currentIndex + 1) / questions.length) * 100);

  const isHindi = user?.language === 'hi';
  const questionText = isHindi && currentQ.questionTextHindi ? currentQ.questionTextHindi : currentQ.questionText;
  const options = isHindi && currentQ.optionsHindi && currentQ.optionsHindi.length > 0 ? currentQ.optionsHindi : currentQ.options;

  return (
    <div>
      {/* Top Header & Exit button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <button
          onClick={() => setShowExitModal(true)}
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
            padding: 0
          }}
        >
          <ArrowLeft size={16} /> Exit Test
        </button>

        <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--color-muted)' }}>
          Question {currentIndex + 1} of {questions.length}
        </span>
      </div>

      {/* Test Progress Bar */}
      <div className="progress-bar-bg" style={{ height: '6px', marginBottom: '16px' }}>
        <div className="progress-bar-fill" style={{ width: `${progressPercentage}%` }}></div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Single Question Card (Task 6.1) */}
      <div className="card">
        <h2 style={{ fontSize: '1.15rem', fontWeight: '700', lineHeight: '1.4', marginBottom: '20px' }}>
          {questionText}
        </h2>

        {/* Options Selector with Large Touch Targets */}
        <div style={{ display: 'grid', gap: '10px', marginBottom: '24px' }}>
          {options && options.map((optText, optIdx) => {
            const isSelected = selectedIndex === optIdx;

            return (
              <label
                key={optIdx}
                onClick={() => handleSelectOption(currentQId, optIdx)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-sm)',
                  border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                  backgroundColor: isSelected ? 'var(--color-primary-light)' : 'var(--color-surface)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    border: isSelected ? '6px solid var(--color-primary)' : '2px solid var(--color-border)',
                    backgroundColor: 'white',
                    flexShrink: 0
                  }}
                />
                <span style={{ fontSize: '0.95rem', fontWeight: isSelected ? '600' : '400' }}>
                  {optText}
                </span>
              </label>
            );
          })}
        </div>

        {/* Navigation Buttons: Previous and Next / Submit (Task 6.1) */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="btn btn-secondary"
            style={{ width: '40%', opacity: currentIndex === 0 ? 0.5 : 1 }}
          >
            <ArrowLeft size={16} /> Previous
          </button>

          {isLastQuestion ? (
            <button
              onClick={handleSubmitTest}
              disabled={submitting}
              className="btn btn-primary"
              style={{ width: '60%' }}
            >
              {submitting ? 'Scoring...' : 'Submit Test'}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="btn btn-primary"
              style={{ width: '60%' }}
            >
              Next <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Edge Case 2: Midway Exit Modal (Task 6.4) */}
      {showExitModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '16px'
          }}
        >
          <div className="card" style={{ maxWidth: '380px', width: '100%', padding: '24px', margin: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#D97706', marginBottom: '12px' }}>
              <AlertTriangle size={24} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Leave Practice Test?</h3>
            </div>
            <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
              Your answers on this attempt will not be scored or saved if you leave now.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setShowExitModal(false)}
                className="btn btn-secondary"
                style={{ width: '50%' }}
              >
                Stay & Finish
              </button>
              <button
                onClick={handleExitConfirm}
                className="btn btn-danger"
                style={{ width: '50%' }}
              >
                Leave Test
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
