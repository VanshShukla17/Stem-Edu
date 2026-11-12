const express = require('express');
const router = express.Router();
const {
  getSubjects,
  getSubjectChapters,
  getChapterLessons,
  getLessonById
} = require('../controllers/contentController');
const { optionalAuth } = require('../middleware/auth');

// Subjects routes
router.get('/subjects', optionalAuth, getSubjects);
router.get('/subjects/:id/chapters', optionalAuth, getSubjectChapters);

// Chapter lessons routes
router.get('/chapters/:id/lessons', optionalAuth, getChapterLessons);

// Single lesson route
router.get('/lessons/:id', optionalAuth, getLessonById);

module.exports = router;

