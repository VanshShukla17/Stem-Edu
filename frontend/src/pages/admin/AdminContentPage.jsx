import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Layers,
  BookOpen,
  FileText,
  X
} from 'lucide-react';
import {
  getSubjects,
  getSubjectChapters,
  getChapterLessons,
  createSubject,
  updateSubject,
  deleteSubject,
  createChapter,
  updateChapter,
  deleteChapter,
  createLesson,
  updateLesson,
  deleteLesson
} from '../../services/api';

export default function AdminContentPage() {
  const [activeTab, setActiveTab] = useState('chapters'); // 'chapters' | 'subjects' | 'lessons'

  // Master Data
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [lessons, setLessons] = useState([]);

  // Selected Filters
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedChapterId, setSelectedChapterId] = useState('');

  // Loading & Message
  const [loading, setLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState(null); // { type: 'success'|'error', text: '' }

  // Modal State
  const [showChapterModal, setShowChapterModal] = useState(false);
  const [chapterForm, setChapterForm] = useState({
    subjectId: '',
    title: '',
    titleHindi: '',
    chapterNumber: 1,
    description: '',
    descriptionHindi: ''
  });
  const [editingChapterId, setEditingChapterId] = useState(null);

  // Lesson Modal State
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [lessonForm, setLessonForm] = useState({
    chapterId: '',
    title: '',
    titleHindi: '',
    lessonNumber: 1,
    summary: '',
    summaryHindi: '',
    textBlock: '',
    formulaBlock: ''
  });
  const [editingLessonId, setEditingLessonId] = useState(null);

  // Safe Deletion Confirmation Modal (Task 10.3)
  const [deleteConfirmModal, setDeleteConfirmModal] = useState(null); // { type, id, title, warningText }

  // Initial Load: Fetch Subjects
  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      setLoading(true);
      const res = await getSubjects();
      const list = Array.isArray(res) ? res : (res.subjects || []);
      setSubjects(list);
      if (list.length > 0 && !selectedSubjectId) {
        setSelectedSubjectId(list[0]._id);
      }
    } catch (err) {
      setAlertMsg({ type: 'error', text: 'Failed to load subjects: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  // Load Chapters when selectedSubjectId changes
  useEffect(() => {
    if (!selectedSubjectId) return;
    loadChapters(selectedSubjectId);
  }, [selectedSubjectId]);

  const loadChapters = async (subId) => {
    try {
      setLoading(true);
      const res = await getSubjectChapters(subId);
      const list = Array.isArray(res) ? res : (res.chapters || []);
      setChapters(list);
      if (list.length > 0) {
        setSelectedChapterId(list[0]._id);
      } else {
        setSelectedChapterId('');
        setLessons([]);
      }
    } catch (err) {
      setAlertMsg({ type: 'error', text: 'Failed to load chapters: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  // Load Lessons when selectedChapterId changes
  useEffect(() => {
    if (!selectedChapterId) return;
    loadLessons(selectedChapterId);
  }, [selectedChapterId]);

  const loadLessons = async (chapId) => {
    try {
      setLoading(true);
      const res = await getChapterLessons(chapId);
      const list = Array.isArray(res) ? res : (res.lessons || []);
      setLessons(list);
    } catch (err) {
      setAlertMsg({ type: 'error', text: 'Failed to load lessons: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------
  // CHAPTER CRUD HANDLERS
  // -------------------------------------------------------------

  const handleOpenAddChapter = () => {
    setEditingChapterId(null);
    setChapterForm({
      subjectId: selectedSubjectId || (subjects[0]?._id ?? ''),
      title: '',
      titleHindi: '',
      chapterNumber: chapters.length + 1,
      description: '',
      descriptionHindi: ''
    });
    setShowChapterModal(true);
  };

  const handleOpenEditChapter = (chap) => {
    setEditingChapterId(chap._id);
    setChapterForm({
      subjectId: chap.subjectId?._id || chap.subjectId || selectedSubjectId,
      title: chap.title || '',
      titleHindi: chap.titleHindi || '',
      chapterNumber: chap.chapterNumber || 1,
      description: chap.description || '',
      descriptionHindi: chap.descriptionHindi || ''
    });
    setShowChapterModal(true);
  };

  const handleSaveChapter = async (e) => {
    e.preventDefault();
    try {
      if (!chapterForm.title || !chapterForm.subjectId) {
        setAlertMsg({ type: 'error', text: 'Chapter title and subject are required' });
        return;
      }

      if (editingChapterId) {
        await updateChapter(editingChapterId, chapterForm);
        setAlertMsg({ type: 'success', text: `Chapter "${chapterForm.title}" updated successfully!` });
      } else {
        await createChapter(chapterForm);
        setAlertMsg({ type: 'success', text: `New chapter "${chapterForm.title}" created successfully and is now live for students!` });
      }

      setShowChapterModal(false);
      loadChapters(chapterForm.subjectId);
    } catch (err) {
      setAlertMsg({ type: 'error', text: 'Failed to save chapter: ' + err.message });
    }
  };

  const handleDeleteChapterClick = async (chap) => {
    try {
      // First attempt without force to check for student progress
      await deleteChapter(chap._id, false);
      setAlertMsg({ type: 'success', text: `Chapter "${chap.title}" deleted safely.` });
      loadChapters(selectedSubjectId);
    } catch (err) {
      // If 409 conflict: active progress detected
      if (err.status === 409 || err.message.includes('Warning') || err.message.includes('active student progress')) {
        setDeleteConfirmModal({
          type: 'chapter',
          id: chap._id,
          title: chap.title,
          warningText: err.message || 'This chapter has active student progress records. Deleting it will safely remove associated student records.'
        });
      } else {
        setAlertMsg({ type: 'error', text: 'Delete failed: ' + err.message });
      }
    }
  };

  // -------------------------------------------------------------
  // LESSON CRUD HANDLERS
  // -------------------------------------------------------------

  const handleOpenAddLesson = () => {
    setEditingLessonId(null);
    setLessonForm({
      chapterId: selectedChapterId || (chapters[0]?._id ?? ''),
      title: '',
      titleHindi: '',
      lessonNumber: lessons.length + 1,
      summary: '',
      summaryHindi: '',
      textBlock: '',
      formulaBlock: ''
    });
    setShowLessonModal(true);
  };

  const handleSaveLesson = async (e) => {
    e.preventDefault();
    try {
      if (!lessonForm.title || !lessonForm.chapterId) {
        setAlertMsg({ type: 'error', text: 'Lesson title and chapter are required' });
        return;
      }

      const contentBlocks = [];
      if (lessonForm.textBlock) {
        contentBlocks.push({
          type: 'text',
          order: 1,
          content: lessonForm.textBlock
        });
      }
      if (lessonForm.formulaBlock) {
        contentBlocks.push({
          type: 'formula',
          order: 2,
          content: lessonForm.formulaBlock
        });
      }

      const payload = {
        chapterId: lessonForm.chapterId,
        title: lessonForm.title,
        titleHindi: lessonForm.titleHindi,
        lessonNumber: lessonForm.lessonNumber,
        summary: lessonForm.summary,
        summaryHindi: lessonForm.summaryHindi,
        contentBlocks
      };

      if (editingLessonId) {
        await updateLesson(editingLessonId, payload);
        setAlertMsg({ type: 'success', text: `Lesson "${lessonForm.title}" updated successfully!` });
      } else {
        await createLesson(payload);
        setAlertMsg({ type: 'success', text: `Lesson "${lessonForm.title}" created successfully and added to chapter!` });
      }

      setShowLessonModal(false);
      loadLessons(lessonForm.chapterId);
    } catch (err) {
      setAlertMsg({ type: 'error', text: 'Failed to save lesson: ' + err.message });
    }
  };

  const handleDeleteLessonClick = async (lesson) => {
    try {
      await deleteLesson(lesson._id, false);
      setAlertMsg({ type: 'success', text: `Lesson "${lesson.title}" deleted safely.` });
      loadLessons(selectedChapterId);
    } catch (err) {
      if (err.status === 409 || err.message.includes('Warning') || err.message.includes('marked as completed')) {
        setDeleteConfirmModal({
          type: 'lesson',
          id: lesson._id,
          title: lesson.title,
          warningText: err.message || 'This lesson has been completed by students. Confirm deletion to safely update their progress percentages.'
        });
      } else {
        setAlertMsg({ type: 'error', text: 'Delete failed: ' + err.message });
      }
    }
  };

  // Safe Deletion Confirmation Handler (Task 10.3)
  const handleConfirmSafeDelete = async () => {
    if (!deleteConfirmModal) return;
    const { type, id } = deleteConfirmModal;
    try {
      if (type === 'chapter') {
        await deleteChapter(id, true);
        setAlertMsg({ type: 'success', text: 'Chapter and associated student records deleted safely and consistently.' });
        loadChapters(selectedSubjectId);
      } else if (type === 'lesson') {
        await deleteLesson(id, true);
        setAlertMsg({ type: 'success', text: 'Lesson deleted safely. Student completion percentages updated consistently.' });
        loadLessons(selectedChapterId);
      }
    } catch (err) {
      setAlertMsg({ type: 'error', text: 'Confirmed deletion failed: ' + err.message });
    } finally {
      setDeleteConfirmModal(null);
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

      {/* Page Title & Tab Navigation */}
      <div className="card" style={{ padding: '16px', marginBottom: '16px' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: '800', margin: '0 0 12px 0', color: '#0F172A' }}>
          Curriculum Content Manager
        </h1>

        <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #E2E8F0' }}>
          <button
            onClick={() => setActiveTab('chapters')}
            style={{
              padding: '10px 16px',
              fontSize: '0.9rem',
              fontWeight: '600',
              color: activeTab === 'chapters' ? 'var(--color-primary)' : '#64748B',
              borderBottom: activeTab === 'chapters' ? '3px solid var(--color-primary)' : '3px solid transparent',
              background: 'none',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Layers size={16} /> Chapters (अध्याय)
          </button>

          <button
            onClick={() => setActiveTab('lessons')}
            style={{
              padding: '10px 16px',
              fontSize: '0.9rem',
              fontWeight: '600',
              color: activeTab === 'lessons' ? 'var(--color-primary)' : '#64748B',
              borderBottom: activeTab === 'lessons' ? '3px solid var(--color-primary)' : '3px solid transparent',
              background: 'none',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <FileText size={16} /> Lessons (पाठ)
          </button>

          <button
            onClick={() => setActiveTab('subjects')}
            style={{
              padding: '10px 16px',
              fontSize: '0.9rem',
              fontWeight: '600',
              color: activeTab === 'subjects' ? 'var(--color-primary)' : '#64748B',
              borderBottom: activeTab === 'subjects' ? '3px solid var(--color-primary)' : '3px solid transparent',
              background: 'none',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <BookOpen size={16} /> Subjects (विषय)
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: CHAPTERS MANAGEMENT (Task 10.2 & 10.3) */}
      {/* ========================================================= */}
      {activeTab === 'chapters' && (
        <div>
          {/* Subject Filter & Add Chapter Action */}
          <div
            className="card"
            style={{
              padding: '14px',
              marginBottom: '14px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>
                Filter by Subject:
              </label>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-sm, 6px)',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.88rem'
                }}
              >
                {subjects.map((sub) => (
                  <option key={sub._id} value={sub._id}>
                    {sub.name} ({sub.nameHindi})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleOpenAddChapter}
              className="btn btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                fontSize: '0.85rem'
              }}
            >
              <Plus size={16} /> Add New Chapter
            </button>
          </div>

          {/* Chapters Table / List */}
          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            {chapters.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#64748B' }}>
                No chapters found for this subject. Click "Add New Chapter" to create one.
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase' }}>
                    <th style={{ padding: '12px 16px' }}>#</th>
                    <th style={{ padding: '12px 16px' }}>English Title</th>
                    <th style={{ padding: '12px 16px' }}>Hindi Title</th>
                    <th style={{ padding: '12px 16px' }}>Description</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {chapters.map((chap) => (
                    <tr key={chap._id} style={{ borderBottom: '1px solid #F1F5F9', fontSize: '0.88rem' }}>
                      <td style={{ padding: '12px 16px', fontWeight: '700', color: '#0284C7' }}>
                        Ch {chap.chapterNumber}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: '600', color: '#0F172A' }}>
                        {chap.title}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#475569' }}>
                        {chap.titleHindi || '-'}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#64748B', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {chap.description}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <button
                          onClick={() => handleOpenEditChapter(chap)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#2563EB',
                            cursor: 'pointer',
                            marginRight: '8px'
                          }}
                          title="Edit Chapter"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteChapterClick(chap)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#DC2626',
                            cursor: 'pointer'
                          }}
                          title="Delete Chapter Safely"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: LESSONS MANAGEMENT */}
      {/* ========================================================= */}
      {activeTab === 'lessons' && (
        <div>
          {/* Chapter Selector & Add Lesson */}
          <div
            className="card"
            style={{
              padding: '14px',
              marginBottom: '14px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>
                Select Chapter:
              </label>
              <select
                value={selectedChapterId}
                onChange={(e) => setSelectedChapterId(e.target.value)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-sm, 6px)',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.88rem'
                }}
              >
                {chapters.map((chap) => (
                  <option key={chap._id} value={chap._id}>
                    Ch {chap.chapterNumber}: {chap.title}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleOpenAddLesson}
              className="btn btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                fontSize: '0.85rem'
              }}
            >
              <Plus size={16} /> Add New Lesson
            </button>
          </div>

          {/* Lessons List */}
          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            {lessons.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#64748B' }}>
                No lessons found in this chapter. Click "Add New Lesson" to create one.
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase' }}>
                    <th style={{ padding: '12px 16px' }}>#</th>
                    <th style={{ padding: '12px 16px' }}>Title</th>
                    <th style={{ padding: '12px 16px' }}>Hindi Title</th>
                    <th style={{ padding: '12px 16px' }}>Content Blocks</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {lessons.map((les) => (
                    <tr key={les._id} style={{ borderBottom: '1px solid #F1F5F9', fontSize: '0.88rem' }}>
                      <td style={{ padding: '12px 16px', fontWeight: '700', color: '#7C3AED' }}>
                        Lesson {les.lessonNumber}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: '600', color: '#0F172A' }}>
                        {les.title}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#475569' }}>
                        {les.titleHindi || '-'}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#64748B' }}>
                        {les.contentBlocks?.length || 0} blocks
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <button
                          onClick={() => handleDeleteLessonClick(les)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#DC2626',
                            cursor: 'pointer'
                          }}
                          title="Delete Lesson Safely"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: SUBJECTS OVERVIEW */}
      {/* ========================================================= */}
      {activeTab === 'subjects' && (
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase' }}>
                <th style={{ padding: '12px 16px' }}>Code</th>
                <th style={{ padding: '12px 16px' }}>Subject Name</th>
                <th style={{ padding: '12px 16px' }}>Hindi Name</th>
                <th style={{ padding: '12px 16px' }}>Class / Board</th>
                <th style={{ padding: '12px 16px' }}>Accent Color</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((sub) => (
                <tr key={sub._id} style={{ borderBottom: '1px solid #F1F5F9', fontSize: '0.88rem' }}>
                  <td style={{ padding: '12px 16px', fontWeight: '700', textTransform: 'uppercase', color: sub.color || '#2563EB' }}>
                    {sub.code}
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: '600', color: '#0F172A' }}>
                    {sub.name}
                  </td>
                  <td style={{ padding: '12px 16px', color: '#475569' }}>
                    {sub.nameHindi}
                  </td>
                  <td style={{ padding: '12px 16px', color: '#64748B' }}>
                    Class {sub.classLevel} • {sub.board}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '14px', height: '14px', borderRadius: '50%', backgroundColor: sub.color }} />
                      <span style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>{sub.color}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ========================================================= */}
      {/* ADD / EDIT CHAPTER MODAL (Task 10.2) */}
      {/* ========================================================= */}
      {showChapterModal && (
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
              maxWidth: '500px',
              padding: '20px',
              backgroundColor: '#FFFFFF',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: '700', margin: 0 }}>
                {editingChapterId ? 'Edit Chapter' : 'Add New Chapter'}
              </h2>
              <button
                onClick={() => setShowChapterModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveChapter}>
              {/* Subject selector */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>
                  Parent Subject
                </label>
                <select
                  value={chapterForm.subjectId}
                  onChange={(e) => setChapterForm({ ...chapterForm, subjectId: e.target.value })}
                  required
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1' }}
                >
                  {subjects.map((sub) => (
                    <option key={sub._id} value={sub._id}>
                      {sub.name} ({sub.nameHindi})
                    </option>
                  ))}
                </select>
              </div>

              {/* Title & Hindi Title */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>
                    Title (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={chapterForm.title}
                    onChange={(e) => setChapterForm({ ...chapterForm, title: e.target.value })}
                    placeholder="e.g. Electricity"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>
                    Title (Hindi)
                  </label>
                  <input
                    type="text"
                    value={chapterForm.titleHindi}
                    onChange={(e) => setChapterForm({ ...chapterForm, titleHindi: e.target.value })}
                    placeholder="e.g. विद्युत"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1' }}
                  />
                </div>
              </div>

              {/* Chapter Number */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>
                  Chapter Number *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={chapterForm.chapterNumber}
                  onChange={(e) => setChapterForm({ ...chapterForm, chapterNumber: parseInt(e.target.value, 10) || 1 })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1' }}
                />
              </div>

              {/* Description */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>
                  Description (English)
                </label>
                <textarea
                  rows="2"
                  value={chapterForm.description}
                  onChange={(e) => setChapterForm({ ...chapterForm, description: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1' }}
                />
              </div>

              {/* Description Hindi */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>
                  Description (Hindi)
                </label>
                <textarea
                  rows="2"
                  value={chapterForm.descriptionHindi}
                  onChange={(e) => setChapterForm({ ...chapterForm, descriptionHindi: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1' }}
                />
              </div>

              {/* Submit / Cancel Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowChapterModal(false)}
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
                  {editingChapterId ? 'Update Chapter' : 'Create Chapter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ADD / EDIT LESSON MODAL */}
      {/* ========================================================= */}
      {showLessonModal && (
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
              maxWidth: '520px',
              padding: '20px',
              backgroundColor: '#FFFFFF',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: '700', margin: 0 }}>
                {editingLessonId ? 'Edit Lesson' : 'Add New Lesson'}
              </h2>
              <button
                onClick={() => setShowLessonModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveLesson}>
              {/* Chapter selector */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>
                  Parent Chapter
                </label>
                <select
                  value={lessonForm.chapterId}
                  onChange={(e) => setLessonForm({ ...lessonForm, chapterId: e.target.value })}
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

              {/* Title & Hindi Title */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>
                    Lesson Title (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={lessonForm.title}
                    onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                    placeholder="e.g. Ohm's Law"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>
                    Lesson Title (Hindi)
                  </label>
                  <input
                    type="text"
                    value={lessonForm.titleHindi}
                    onChange={(e) => setLessonForm({ ...lessonForm, titleHindi: e.target.value })}
                    placeholder="e.g. ओम का नियम"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1' }}
                  />
                </div>
              </div>

              {/* Lesson Number */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>
                  Lesson Number *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={lessonForm.lessonNumber}
                  onChange={(e) => setLessonForm({ ...lessonForm, lessonNumber: parseInt(e.target.value, 10) || 1 })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1' }}
                />
              </div>

              {/* Text Block Content */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>
                  Text Block Content
                </label>
                <textarea
                  rows="3"
                  value={lessonForm.textBlock}
                  onChange={(e) => setLessonForm({ ...lessonForm, textBlock: e.target.value })}
                  placeholder="Core theoretical explanation for this lesson..."
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1' }}
                />
              </div>

              {/* Formula Block Content */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>
                  Formula Block Content (Optional)
                </label>
                <input
                  type="text"
                  value={lessonForm.formulaBlock}
                  onChange={(e) => setLessonForm({ ...lessonForm, formulaBlock: e.target.value })}
                  placeholder="e.g. V = I * R"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1' }}
                />
              </div>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowLessonModal(false)}
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
                  Save Lesson
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SAFE DELETION CONFIRMATION MODAL (Task 10.3) */}
      {/* ========================================================= */}
      {deleteConfirmModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 120,
            padding: '16px'
          }}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '440px',
              padding: '20px',
              backgroundColor: '#FFFFFF',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ padding: '8px', borderRadius: '50%', backgroundColor: '#FEE2E2', color: '#DC2626' }}>
                <AlertTriangle size={24} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', margin: 0, color: '#991B1B' }}>
                Confirm Safe Deletion
              </h3>
            </div>

            <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.5, margin: '0 0 14px 0' }}>
              <strong>Item:</strong> "{deleteConfirmModal.title}"
            </p>

            <div
              style={{
                padding: '10px 14px',
                backgroundColor: '#FEF2F2',
                borderRadius: '6px',
                borderLeft: '4px solid #DC2626',
                fontSize: '0.82rem',
                color: '#B91C1C',
                lineHeight: 1.5,
                marginBottom: '16px'
              }}
            >
              {deleteConfirmModal.warningText}
            </div>

            <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0 0 16px 0' }}>
              Deleting will safely update remaining completion percentages and maintain database consistency.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setDeleteConfirmModal(null)}
                className="btn btn-secondary"
                style={{ padding: '8px 14px' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSafeDelete}
                className="btn btn-primary"
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#DC2626',
                  borderColor: '#DC2626'
                }}
              >
                Yes, Delete Safely
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
