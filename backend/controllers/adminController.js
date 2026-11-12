const mongoose = require('mongoose');
const User = require('../models/User');
const Subject = require('../models/Subject');
const Chapter = require('../models/Chapter');
const Lesson = require('../models/Lesson');
const Question = require('../models/Question');
const Diagram = require('../models/Diagram');
const Lab = require('../models/Lab');
const Progress = require('../models/Progress');
const TestResult = require('../models/TestResult');

/**
 * GET /api/admin/stats
 * Overview counts and metrics
 */
exports.getAdminStats = async (req, res, next) => {
  try {
    const [
      users,
      subjects,
      chapters,
      lessons,
      questions,
      diagrams,
      labs,
      testResults
    ] = await Promise.all([
      User.countDocuments(),
      Subject.countDocuments(),
      Chapter.countDocuments(),
      Lesson.countDocuments(),
      Question.countDocuments(),
      Diagram.countDocuments(),
      Lab.countDocuments(),
      TestResult.countDocuments()
    ]);

    res.json({
      success: true,
      stats: {
        users,
        subjects,
        chapters,
        lessons,
        questions,
        diagrams,
        labs,
        testResults
      }
    });
  } catch (error) {
    next(error);
  }
};

// =================================================================
// SUBJECTS CRUD
// =================================================================

exports.createSubject = async (req, res, next) => {
  try {
    const { name, nameHindi, code, classLevel, board, color, icon, description } = req.body;
    const subject = new Subject({
      name,
      nameHindi,
      code: code ? code.toLowerCase() : undefined,
      classLevel: classLevel || 10,
      board: board || 'CBSE',
      color: color || '#2563EB',
      icon: icon || 'BookOpen',
      description
    });
    await subject.save();
    res.status(201).json({ success: true, subject });
  } catch (error) {
    next(error);
  }
};

exports.updateSubject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const subject = await Subject.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }
    res.json({ success: true, subject });
  } catch (error) {
    next(error);
  }
};

exports.deleteSubject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { force } = req.query;

    const chapterCount = await Chapter.countDocuments({ subjectId: id });
    if (chapterCount > 0 && force !== 'true') {
      return res.status(409).json({
        success: false,
        requiresConfirmation: true,
        chapterCount,
        message: `This subject contains ${chapterCount} chapters. Confirm deletion with force=true.`
      });
    }

    if (force === 'true') {
      // Find all chapters under this subject
      const chapters = await Chapter.find({ subjectId: id }).select('_id');
      const chapterIds = chapters.map(c => c._id);

      // Clean up child lessons, questions, and progress
      await Promise.all([
        Lesson.deleteMany({ chapterId: { $in: chapterIds } }),
        Question.deleteMany({ chapterId: { $in: chapterIds } }),
        Progress.deleteMany({ chapterId: { $in: chapterIds } }),
        TestResult.deleteMany({ chapterId: { $in: chapterIds } }),
        Chapter.deleteMany({ subjectId: id })
      ]);
    }

    await Subject.findByIdAndDelete(id);
    res.json({ success: true, message: 'Subject deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// =================================================================
// CHAPTERS CRUD
// =================================================================

exports.createChapter = async (req, res, next) => {
  try {
    const { subjectId, title, titleHindi, chapterNumber, description, descriptionHindi } = req.body;
    const chapter = new Chapter({
      subjectId,
      title,
      titleHindi,
      chapterNumber: chapterNumber || 1,
      description,
      descriptionHindi
    });
    await chapter.save();
    res.status(201).json({ success: true, chapter });
  } catch (error) {
    next(error);
  }
};

exports.updateChapter = async (req, res, next) => {
  try {
    const { id } = req.params;
    const chapter = await Chapter.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!chapter) {
      return res.status(404).json({ success: false, message: 'Chapter not found' });
    }
    res.json({ success: true, chapter });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/admin/chapters/:id (Task 10.3: Delete Safely)
 * Confirms before deleting content that has student progress.
 * Keeps progress data consistent after delete.
 */
exports.deleteChapter = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { force } = req.query;

    const chapter = await Chapter.findById(id);
    if (!chapter) {
      return res.status(404).json({ success: false, message: 'Chapter not found' });
    }

    // Check active student progress and test results
    const [activeProgressCount, testCount, lessonCount, questionCount] = await Promise.all([
      Progress.countDocuments({ chapterId: id }),
      TestResult.countDocuments({ chapterId: id }),
      Lesson.countDocuments({ chapterId: id }),
      Question.countDocuments({ chapterId: id })
    ]);

    if ((activeProgressCount > 0 || testCount > 0) && force !== 'true') {
      return res.status(409).json({
        success: false,
        requiresConfirmation: true,
        activeProgressCount,
        testCount,
        lessonCount,
        questionCount,
        message: `Warning: This chapter has ${activeProgressCount} student progress records and ${testCount} test attempts. Confirm deletion with force=true to proceed safely.`
      });
    }

    // Safe cascading cleanup: delete lessons, questions, and orphan student records
    await Promise.all([
      Lesson.deleteMany({ chapterId: id }),
      Question.deleteMany({ chapterId: id }),
      Progress.deleteMany({ chapterId: id }),
      TestResult.deleteMany({ chapterId: id }),
      Chapter.findByIdAndDelete(id)
    ]);

    res.json({
      success: true,
      message: 'Chapter and associated student records deleted safely and consistently.',
      cleaned: {
        lessonsDeleted: lessonCount,
        questionsDeleted: questionCount,
        progressDeleted: activeProgressCount,
        testResultsDeleted: testCount
      }
    });
  } catch (error) {
    next(error);
  }
};

// =================================================================
// LESSONS CRUD
// =================================================================

exports.createLesson = async (req, res, next) => {
  try {
    const {
      chapterId,
      title,
      titleHindi,
      lessonNumber,
      summary,
      summaryHindi,
      contentBlocks,
      diagramId,
      labId
    } = req.body;

    const lesson = new Lesson({
      chapterId,
      title,
      titleHindi: titleHindi || title,
      lessonNumber: lessonNumber || 1,
      summary: summary || '',
      summaryHindi: summaryHindi || '',
      contentBlocks: contentBlocks || [],
      diagramId: diagramId && mongoose.isValidObjectId(diagramId) ? diagramId : null,
      labId: labId && mongoose.isValidObjectId(labId) ? labId : null
    });

    await lesson.save();

    // Update chapter lesson count across existing progress records
    const totalChapterLessons = await Lesson.countDocuments({ chapterId });
    await Progress.updateMany(
      { chapterId },
      { $set: { totalLessonsCount: totalChapterLessons } }
    );

    res.status(201).json({ success: true, lesson });
  } catch (error) {
    next(error);
  }
};

exports.updateLesson = async (req, res, next) => {
  try {
    const { id } = req.params;
    const lesson = await Lesson.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }
    res.json({ success: true, lesson });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/admin/lessons/:id (Task 10.3: Delete Safely)
 * Removes lesson from student completedLessons and recalculates completion percentage.
 */
exports.deleteLesson = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { force } = req.query;

    const lesson = await Lesson.findById(id);
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    // Check how many students have completed this lesson
    const affectedProgress = await Progress.find({ completedLessons: id });
    if (affectedProgress.length > 0 && force !== 'true') {
      return res.status(409).json({
        success: false,
        requiresConfirmation: true,
        affectedStudentsCount: affectedProgress.length,
        message: `Warning: ${affectedProgress.length} students have marked this lesson complete. Confirm deletion with force=true to safely update their progress percentages.`
      });
    }

    const chapterId = lesson.chapterId;

    // Delete the lesson
    await Lesson.findByIdAndDelete(id);

    // Calculate remaining lessons in chapter
    const remainingTotal = await Lesson.countDocuments({ chapterId });

    // Update all affected student progress records so data remains 100% mathematically consistent
    const allChapterProgress = await Progress.find({ chapterId });
    for (const prog of allChapterProgress) {
      prog.completedLessons = prog.completedLessons.filter(lId => lId.toString() !== id.toString());
      prog.totalLessonsCount = remainingTotal;
      prog.completionPercentage = remainingTotal > 0
        ? Math.round((prog.completedLessons.length / remainingTotal) * 100)
        : 0;
      await prog.save();
    }

    res.json({
      success: true,
      message: 'Lesson deleted safely and student progress percentages updated consistently.',
      remainingLessonsInChapter: remainingTotal
    });
  } catch (error) {
    next(error);
  }
};

// =================================================================
// QUESTIONS CRUD
// =================================================================

exports.getAdminQuestions = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.chapterId && mongoose.isValidObjectId(req.query.chapterId)) {
      filter.chapterId = req.query.chapterId;
    }

    const questions = await Question.find(filter)
      .populate('chapterId', 'title titleHindi chapterNumber')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: questions.length, questions });
  } catch (error) {
    next(error);
  }
};

exports.createQuestion = async (req, res, next) => {
  try {
    const {
      chapterId,
      questionText,
      questionTextHindi,
      options,
      optionsHindi,
      correctIndex,
      explanation,
      explanationHindi,
      difficulty
    } = req.body;

    const question = new Question({
      chapterId,
      questionText,
      questionTextHindi,
      options,
      optionsHindi,
      correctIndex,
      explanation,
      explanationHindi,
      difficulty: difficulty || 'medium'
    });

    await question.save();
    res.status(201).json({ success: true, question });
  } catch (error) {
    next(error);
  }
};

exports.updateQuestion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const question = await Question.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }
    res.json({ success: true, question });
  } catch (error) {
    next(error);
  }
};

exports.deleteQuestion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const question = await Question.findByIdAndDelete(id);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }
    res.json({ success: true, message: 'Question deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// =================================================================
// USER MANAGEMENT
// =================================================================

exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find({})
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ success: true, count: users.length, users });
  } catch (error) {
    next(error);
  }
};

exports.updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['student', 'admin', 'teacher'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    ).select('-passwordHash');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};
