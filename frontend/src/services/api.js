/**
 * API Service Layer
 * Single file wrapping native fetch, attaching JWT authentication tokens,
 * and normalizing API error responses.
 */

const BASE_URL = '/api';

/**
 * Universal request wrapper
 * @param {string} endpoint - API path (e.g. '/health', '/auth/login')
 * @param {object} options - Fetch options (method, headers, body)
 * @returns {Promise<any>}
 */
export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers
  };

  const config = {
    ...options,
    headers
  };

  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, config);

  // Parse JSON response body safely
  let data;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMessage = (data && data.message) || response.statusText || 'Request failed';
    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

// System Health
export const getHealth = () => apiRequest('/health');

// Authentication & Profile
export const signup = (userData) => apiRequest('/auth/signup', { method: 'POST', body: userData });
export const login = (credentials) => apiRequest('/auth/login', { method: 'POST', body: credentials });
export const getMe = () => apiRequest('/me');
export const updateMe = (profileData) => apiRequest('/me', { method: 'PUT', body: profileData });

// Curriculum Content
export const getSubjects = (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return apiRequest(`/subjects${queryString ? `?${queryString}` : ''}`);
};

export const getSubjectChapters = (subjectId, params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return apiRequest(`/subjects/${subjectId}/chapters${queryString ? `?${queryString}` : ''}`);
};

export const getChapterLessons = (chapterId) => apiRequest(`/chapters/${chapterId}/lessons`);
export const getLesson = (lessonId) => apiRequest(`/lessons/${lessonId}`);

// Interactive Diagrams (Phase 8)
export const getDiagrams = (subject) => {
  const query = subject ? `?subject=${subject}` : '';
  return apiRequest(`/diagrams${query}`);
};
export const getDiagramById = (id) => apiRequest(`/diagrams/${id}`);

// AI Summary with Gemini (Phase 7)
export const getLessonSummary = (lessonId, language) =>
  apiRequest(`/lessons/${lessonId}/summary`, { method: 'POST', body: { language } });

// Progress Tracking
export const completeLesson = (lessonId) => apiRequest(`/lessons/${lessonId}/complete`, { method: 'POST' });
export const getProgress = () => apiRequest('/progress');

// MCQ Practice & Results
export const getChapterTest = (chapterId) => apiRequest(`/chapters/${chapterId}/test`);
export const submitChapterTest = (chapterId, submission) =>
  apiRequest(`/chapters/${chapterId}/test/submit`, { method: 'POST', body: submission });
export const getResults = () => apiRequest('/results');
export const getResultById = (id) => apiRequest(`/results/${id}`);

// Virtual Labs (Phase 9)
export const getLabs = (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return apiRequest(`/labs${queryString ? `?${queryString}` : ''}`);
};
export const getLab = (id) => apiRequest(`/labs/${id}`);
export const submitLabQuiz = (id, submission) =>
  apiRequest(`/labs/${id}/submit`, { method: 'POST', body: submission });
export const getMyLabResults = () => apiRequest('/labs/results/me');

// Admin Operations (Phase 10)
export const getAdminStats = () => apiRequest('/admin/stats');

// Admin Subjects
export const createSubject = (data) => apiRequest('/admin/subjects', { method: 'POST', body: data });
export const updateSubject = (id, data) => apiRequest(`/admin/subjects/${id}`, { method: 'PUT', body: data });
export const deleteSubject = (id, force = false) => apiRequest(`/admin/subjects/${id}${force ? '?force=true' : ''}`, { method: 'DELETE' });

// Admin Chapters
export const createChapter = (data) => apiRequest('/admin/chapters', { method: 'POST', body: data });
export const updateChapter = (id, data) => apiRequest(`/admin/chapters/${id}`, { method: 'PUT', body: data });
export const deleteChapter = (id, force = false) => apiRequest(`/admin/chapters/${id}${force ? '?force=true' : ''}`, { method: 'DELETE' });

// Admin Lessons
export const createLesson = (data) => apiRequest('/admin/lessons', { method: 'POST', body: data });
export const updateLesson = (id, data) => apiRequest(`/admin/lessons/${id}`, { method: 'PUT', body: data });
export const deleteLesson = (id, force = false) => apiRequest(`/admin/lessons/${id}${force ? '?force=true' : ''}`, { method: 'DELETE' });

// Admin Questions
export const getAdminQuestions = (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return apiRequest(`/admin/questions${queryString ? `?${queryString}` : ''}`);
};
export const createQuestion = (data) => apiRequest('/admin/questions', { method: 'POST', body: data });
export const updateQuestion = (id, data) => apiRequest(`/admin/questions/${id}`, { method: 'PUT', body: data });
export const deleteQuestion = (id) => apiRequest(`/admin/questions/${id}`, { method: 'DELETE' });

// Admin Users
export const getAdminUsers = () => apiRequest('/admin/users');
export const updateUserRole = (id, role) => apiRequest(`/admin/users/${id}/role`, { method: 'PUT', body: { role } });

export default {
  getHealth,
  signup,
  login,
  getMe,
  updateMe,
  getSubjects,
  getSubjectChapters,
  getChapterLessons,
  getLesson,
  getDiagrams,
  getDiagramById,
  getLessonSummary,
  completeLesson,
  getProgress,
  getChapterTest,
  submitChapterTest,
  getResults,
  getResultById,
  getLabs,
  getLab,
  submitLabQuiz,
  getMyLabResults,
  getAdminStats,
  createSubject,
  updateSubject,
  deleteSubject,
  createChapter,
  updateChapter,
  deleteChapter,
  createLesson,
  updateLesson,
  deleteLesson,
  getAdminQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getAdminUsers,
  updateUserRole
};
