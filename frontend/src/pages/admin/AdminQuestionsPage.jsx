import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  X
} from 'lucide-react';
import {
  getSubjects,
  getSubjectChapters,
  getAdminQuestions,
  createQuestion,
  deleteQuestion
} from '../../services/api';

export default function AdminQuestionsPage() {
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [questions, setQuestions] = useState([]);

  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedChapterId, setSelectedChapterId] = useState('');

  const [loading, setLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    chapterId: '',
    questionText: '',
    questionTextHindi: '',
    options: ['', '', '', ''],
    optionsHindi: ['', '', '', ''],
    correctIndex: 0,
    explanation: '',
    difficulty: 'medium'
  });

  // Load initial subjects
  useEffect(() => {
    getSubjects().then((res) => {
      const list = Array.isArray(res) ? res : (res.subjects || []);
      setSubjects(list);
      if (list.length > 0) setSelectedSubjectId(list[0]._id);
    });
  }, []);

  // Load chapters for subject
  useEffect(() => {
    if (!selectedSubjectId) return;
    getSubjectChapters(selectedSubjectId).then((res) => {
      const list = Array.isArray(res) ? res : (res.chapters || []);
      setChapters(list);
      if (list.length > 0) setSelectedChapterId(list[0]._id);
      else {
        setSelectedChapterId('');
        setQuestions([]);
      }
    });
  }, [selectedSubjectId]);

  // Load questions for chapter
  useEffect(() => {
    if (!selectedChapterId) return;
    loadQuestions(selectedChapterId);
  }, [selectedChapterId]);

  const loadQuestions = async (chapId) => {
    try {
      setLoading(true);
      const res = await getAdminQuestions({ chapterId: chapId });
      setQuestions(res.questions || []);
    } catch (err) {
      setAlertMsg({ type: 'error', text: 'Failed to load questions: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setForm({
      chapterId: selectedChapterId || (chapters[0]?._id ?? ''),
      questionText: '',
      questionTextHindi: '',
      options: ['', '', '', ''],
      optionsHindi: ['', '', '', ''],
      correctIndex: 0,
      explanation: '',
      difficulty: 'medium'
    });
    setShowModal(true);
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    try {
      if (!form.questionText || !form.chapterId) {
        setAlertMsg({ type: 'error', text: 'Question text and chapter are required' });
        return;
      }
      if (form.options.some((opt) => !opt.trim())) {
        setAlertMsg({ type: 'error', text: 'All 4 options must be filled' });
        return;
      }

      await createQuestion(form);
      setAlertMsg({ type: 'success', text: 'New practice question added to question bank successfully!' });
      setShowModal(false);
      loadQuestions(form.chapterId);
    } catch (err) {
      setAlertMsg({ type: 'error', text: 'Failed to create question: ' + err.message });
    }
  };

  const handleDeleteQuestion = async (qId) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    try {
      await deleteQuestion(qId);
      setAlertMsg({ type: 'success', text: 'Question deleted successfully.' });
      loadQuestions(selectedChapterId);
    } catch (err) {
      setAlertMsg({ type: 'error', text: 'Failed to delete question: ' + err.message });
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '32px' }}>
      {/* Top Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <Link
          to="/admin"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--color-primary)',
            textDecoration: 'none',
            fontSize: '0.9rem',
            fontWeight: '600'
          }}
        >
          <ArrowLeft size={16} /> Back to Admin Dashboard
        </Link>
      </div>

      {/* Banner Alert */}
      {alertMsg && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm, 6px)',
            marginBottom: '14px',
            backgroundColor: alertMsg.type === 'success' ? '#DCFCE7' : '#FEF2F2',
            color: alertMsg.type === 'success' ? '#15803D' : '#991B1B',
            border: `1px solid ${alertMsg.type === 'success' ? '#86EFAC' : '#FECACA'}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.88rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {alertMsg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
            <span>{alertMsg.text}</span>
          </div>
          <button
            onClick={() => setAlertMsg(null)}
            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header & Filter Controls */}
      <div
        className="card"
        style={{
          padding: '16px',
          marginBottom: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: '800', margin: '0 0 6px 0', color: '#0F172A' }}>
            MCQ Practice Question Bank
          </h1>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Subject Select */}
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
            >
              {subjects.map((sub) => (
                <option key={sub._id} value={sub._id}>
                  {sub.name}
                </option>
              ))}
            </select>

            {/* Chapter Select */}
            <select
              value={selectedChapterId}
              onChange={(e) => setSelectedChapterId(e.target.value)}
              style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
            >
              {chapters.map((chap) => (
                <option key={chap._id} value={chap._id}>
                  Ch {chap.chapterNumber}: {chap.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="btn btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', fontSize: '0.85rem' }}
        >
          <Plus size={16} /> Add New MCQ
        </button>
      </div>

      {/* Questions List */}
      {questions.length === 0 ? (
        <div className="card" style={{ padding: '24px', textAlign: 'center', color: '#64748B' }}>
          No questions found for this chapter. Click "Add New MCQ" to author one.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {questions.map((q, idx) => (
            <div key={q._id} className="card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#DC2626', textTransform: 'uppercase', marginRight: '8px' }}>
                    Question {idx + 1} • {q.difficulty || 'Medium'}
                  </span>
                  <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#0F172A', marginTop: '2px' }}>
                    {q.questionText}
                  </div>
                  {q.questionTextHindi && (
                    <div style={{ fontSize: '0.88rem', color: '#475569', marginTop: '2px' }}>
                      {q.questionTextHindi}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteQuestion(q._id)}
                  style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', padding: '4px' }}
                  title="Delete Question"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Options */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', margin: '10px 0' }}>
                {q.options.map((opt, optIdx) => {
                  const isCorrect = q.correctIndex === optIdx;
                  return (
                    <div
                      key={optIdx}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        backgroundColor: isCorrect ? '#DCFCE7' : '#F8FAFC',
                        border: `1.5px solid ${isCorrect ? '#16A34A' : '#E2E8F0'}`,
                        color: isCorrect ? '#15803D' : '#334155',
                        fontWeight: isCorrect ? '700' : '400',
                        display: 'flex',
                        justifyContent: 'space-between'
                      }}
                    >
                      <span>{String.fromCharCode(65 + optIdx)}) {opt}</span>
                      {isCorrect && <span style={{ fontSize: '0.72rem', color: '#15803D' }}>[Correct Key]</span>}
                    </div>
                  );
                })}
              </div>

              {/* Explanation */}
              {q.explanation && (
                <div style={{ fontSize: '0.82rem', color: '#64748B', backgroundColor: '#F1F5F9', padding: '8px 12px', borderRadius: '4px' }}>
                  <strong>Explanation:</strong> {q.explanation}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ADD QUESTION MODAL */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 100,
            padding: '16px'
          }}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '560px',
              padding: '20px',
              backgroundColor: '#FFFFFF',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: '700', margin: 0 }}>
                Add New MCQ
              </h2>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion}>
              {/* Chapter Select */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>
                  Target Chapter *
                </label>
                <select
                  value={form.chapterId}
                  onChange={(e) => setForm({ ...form, chapterId: e.target.value })}
                  required
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1' }}
                >
                  {chapters.map((chap) => (
                    <option key={chap._id} value={chap._id}>
                      Ch {chap.chapterNumber}: {chap.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Question Text */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>
                  Question Statement (English) *
                </label>
                <textarea
                  rows="2"
                  required
                  value={form.questionText}
                  onChange={(e) => setForm({ ...form, questionText: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1' }}
                />
              </div>

              {/* Question Text Hindi */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>
                  Question Statement (Hindi)
                </label>
                <textarea
                  rows="2"
                  value={form.questionTextHindi}
                  onChange={(e) => setForm({ ...form, questionTextHindi: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1' }}
                />
              </div>

              {/* 4 Options */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>
                  Options (A, B, C, D) & Correct Key *
                </label>
                {[0, 1, 2, 3].map((optIdx) => (
                  <div key={optIdx} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <input
                      type="radio"
                      name="correctKey"
                      checked={form.correctIndex === optIdx}
                      onChange={() => setForm({ ...form, correctIndex: optIdx })}
                      title="Set as correct answer"
                    />
                    <span style={{ fontSize: '0.85rem', fontWeight: '700', width: '20px' }}>
                      {String.fromCharCode(65 + optIdx)})
                    </span>
                    <input
                      type="text"
                      required
                      placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                      value={form.options[optIdx] || ''}
                      onChange={(e) => {
                        const newOpts = [...form.options];
                        newOpts[optIdx] = e.target.value;
                        setForm({ ...form, options: newOpts });
                      }}
                      style={{ flex: 1, padding: '6px 10px', borderRadius: '6px', border: '1px solid #CBD5E1' }}
                    />
                  </div>
                ))}
                <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                  Select the radio button next to the correct answer.
                </span>
              </div>

              {/* Explanation */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>
                  Step-by-step Physics / Science Explanation *
                </label>
                <textarea
                  rows="2"
                  required
                  value={form.explanation}
                  onChange={(e) => setForm({ ...form, explanation: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1' }}
                />
              </div>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary"
                  style={{ padding: '8px 14px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ padding: '8px 16px' }}
                >
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
