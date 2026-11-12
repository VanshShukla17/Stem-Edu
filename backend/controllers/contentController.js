const Subject = require('../models/Subject');
const Chapter = require('../models/Chapter');
const Lesson = require('../models/Lesson');
const Progress = require('../models/Progress');

/**
 * GET /api/subjects
 * List subjects filtered by student profile (board, class) or query params
 */
const getSubjects = async (req, res, next) => {
  try {
    const board = req.query.board || (req.user && req.user.board) || 'CBSE';
    const classLevel = req.query.class || req.query.classLevel || (req.user && req.user.classLevel) || 10;

    const filter = {};
    if (board) filter.board = board;
    if (classLevel) filter.classLevel = Number(classLevel);

    const subjects = await Subject.find(filter).sort({ order: 1 });

    res.status(200).json(subjects);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/subjects/:id/chapters
 * List chapters for a subject filtered by student profile (board, class)
 * Task 3.1: "Done when: a test chapter shows up only for the matching profile."
 */
const getSubjectChapters = async (req, res, next) => {
  try {
    const subjectId = req.params.id;

    // Filter by student profile or query parameters
    const board = req.query.board || (req.user && req.user.board) || 'CBSE';
    const classLevel = req.query.class || req.query.classLevel || (req.user && req.user.classLevel) || 10;

    const filter = {
      subjectId,
      board,
      classLevel: Number(classLevel)
    };

    const chapters = await Chapter.find(filter).sort({ chapterNumber: 1, order: 1 });

    // If user is authenticated, attach completion percentage for each chapter
    let chaptersWithProgress = chapters.map(c => c.toJSON());

    if (req.user) {
      const chapterIds = chapters.map(c => c._id);
      const progressDocs = await Progress.find({
        userId: req.user._id,
        chapterId: { $in: chapterIds }
      });

      const progressMap = {};
      progressDocs.forEach(p => {
        progressMap[p.chapterId.toString()] = p.completionPercentage;
      });

      chaptersWithProgress = chaptersWithProgress.map(c => ({
        ...c,
        completionPercentage: progressMap[c.id.toString()] || 0
      }));
    }

    res.status(200).json(chaptersWithProgress);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/chapters/:id/lessons
 * List all lessons in a chapter in sequence
 */
const getChapterLessons = async (req, res, next) => {
  try {
    const chapterId = req.params.id;

    const lessons = await Lesson.find({ chapterId })
      .select('lessonNumber title titleHindi order diagramId labId')
      .sort({ lessonNumber: 1, order: 1 });

    let lessonsWithStatus = lessons.map(l => l.toJSON());

    if (req.user) {
      const progress = await Progress.findOne({
        userId: req.user._id,
        chapterId
      });

      const completedSet = new Set(
        (progress && progress.completedLessons || []).map(id => id.toString())
      );

      lessonsWithStatus = lessonsWithStatus.map(l => ({
        ...l,
        isCompleted: completedSet.has(l.id.toString())
      }));
    }

    res.status(200).json(lessonsWithStatus);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/lessons/:id
 * Fetch single lesson details with its content blocks (text, image, etc.)
 * Task 3.2: "Done when: a lesson returns its title and content blocks (text, image)."
 */
const getLessonById = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    // Update bookmark in progress if user is authenticated
    if (req.user) {
      await Progress.findOneAndUpdate(
        { userId: req.user._id, chapterId: lesson.chapterId },
        {
          $set: {
            lastAccessedLessonId: lesson._id,
            lastAccessedAt: new Date()
          }
        },
        { upsert: true, new: true }
      );
    }

    res.status(200).json(lesson);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSubjects,
  getSubjectChapters,
  getChapterLessons,
  getLessonById
};

