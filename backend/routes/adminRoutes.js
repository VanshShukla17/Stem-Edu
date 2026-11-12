const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// All admin routes strictly require both valid authentication and admin role
router.use(requireAuth, requireAdmin);

// Dashboard overview stats
router.get('/stats', adminController.getAdminStats);

// Subjects CRUD
router.post('/subjects', adminController.createSubject);
router.put('/subjects/:id', adminController.updateSubject);
router.delete('/subjects/:id', adminController.deleteSubject);

// Chapters CRUD
router.post('/chapters', adminController.createChapter);
router.put('/chapters/:id', adminController.updateChapter);
router.delete('/chapters/:id', adminController.deleteChapter);

// Lessons CRUD
router.post('/lessons', adminController.createLesson);
router.put('/lessons/:id', adminController.updateLesson);
router.delete('/lessons/:id', adminController.deleteLesson);

// Questions CRUD
router.get('/questions', adminController.getAdminQuestions);
router.post('/questions', adminController.createQuestion);
router.put('/questions/:id', adminController.updateQuestion);
router.delete('/questions/:id', adminController.deleteQuestion);

// Users Management
router.get('/users', adminController.getUsers);
router.put('/users/:id/role', adminController.updateUserRole);

module.exports = router;

