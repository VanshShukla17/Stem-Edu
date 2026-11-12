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

// Progress Tracking
export const completeLesson = (lessonId) => apiRequest(`/lessons/${lessonId}/complete`, { method: 'POST' });
export const getProgress = () => apiRequest('/progress');

// MCQ Practice & Results
export const getChapterTest = (chapterId) => apiRequest(`/chapters/${chapterId}/test`);
export const submitChapterTest = (chapterId, submission) =>
  apiRequest(`/chapters/${chapterId}/test/submit`, { method: 'POST', body: submission });
export const getResults = () => apiRequest('/results');
export const getResultById = (id) => apiRequest(`/results/${id}`);

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
  completeLesson,
  getProgress,
  getChapterTest,
  submitChapterTest,
  getResults,
  getResultById
};

