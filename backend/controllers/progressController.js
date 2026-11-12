const Lesson = require('../models/Lesson');
const Progress = require('../models/Progress');

/**
 * POST /api/lessons/:id/complete
 * Mark a lesson as complete for the student and recalculate chapter percentage
 * Task 3.3: "Done when: completing 2 of 4 lessons shows 50%."
 */
const completeLesson = async (req, res, next) => {
  try {
    const lessonId = req.params.id;
    const userId = req.user._id;

    // 1. Find the lesson to get its chapter
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    const chapterId = lesson.chapterId;

    // 2. Count total lessons belonging to this chapter
    const totalLessons = await Lesson.countDocuments({ chapterId });

    // 3. Find or initialize progress document for this user & chapter
    let progress = await Progress.findOne({ userId, chapterId });

    if (!progress) {
      progress = new Progress({
        userId,
        chapterId,
        completedLessons: [lesson._id],
        totalLessonsCount: totalLessons,
        lastAccessedLessonId: lesson._id,
        lastAccessedAt: new Date()
      });
    } else {
      // Add lesson ID if not already in completedLessons
      const alreadyCompleted = progress.completedLessons.some(
        id => id.toString() === lesson._id.toString()
      );

      if (!alreadyCompleted) {
        progress.completedLessons.push(lesson._id);
      }
      progress.totalLessonsCount = totalLessons;
      progress.lastAccessedLessonId = lesson._id;
      progress.lastAccessedAt = new Date();
    }

    // 4. Calculate percentage: (completedCount / totalLessons) * 100
    const completedCount = progress.completedLessons.length;
    const percentage = totalLessons > 0
      ? Math.round((completedCount / totalLessons) * 100)
      : 0;

    progress.completionPercentage = percentage;
    await progress.save();

    res.status(200).json({
      message: 'Lesson marked complete',
      chapterId,
      completedLessonsCount: completedCount,
      totalLessonsCount: totalLessons,
      completionPercentage: percentage,
      progress
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/progress
 * Get student's overall progress across all chapters
 */
const getProgress = async (req, res, next) => {
  try {
    const progressList = await Progress.find({ userId: req.user._id })
      .populate('chapterId', 'chapterNumber title titleHindi subjectId')
      .populate('lastAccessedLessonId', 'lessonNumber title titleHindi')
      .sort({ updatedAt: -1 });

    res.status(200).json(progressList);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  completeLesson,
  getProgress
};
