const Lesson = require('../models/Lesson');
const { generateSummary } = require('../utils/gemini');

/**
 * POST /api/lessons/:id/summary
 * Generates or retrieves cached AI summary for a lesson in the student's language.
 * Tasks 7.2, 7.3, 7.4, 7.5
 */
const getLessonSummary = async (req, res, next) => {
  try {
    const lessonId = req.params.id;
    const requestedLang = req.body.language || (req.user && req.user.language) || 'en';
    const langKey = requestedLang === 'hi' ? 'hi' : 'en';

    // 1. Find lesson document
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    // 2. Task 7.4: Check MongoDB cache first
    // Done when: the second request returns instantly without calling Gemini.
    if (lesson.cachedSummary && lesson.cachedSummary[langKey]) {
      return res.status(200).json({
        lessonId: lesson._id,
        language: langKey,
        summary: lesson.cachedSummary[langKey],
        isCached: true,
        source: 'mongodb_cache'
      });
    }

    // 3. Task 7.2: Generate summary via Gemini API
    const { summary, source } = await generateSummary(lesson, langKey);

    // 4. Task 7.4: Cache the generated summary in MongoDB
    if (!lesson.cachedSummary) {
      lesson.cachedSummary = {};
    }
    lesson.cachedSummary[langKey] = summary;
    lesson.markModified('cachedSummary');
    await lesson.save();

    res.status(200).json({
      lessonId: lesson._id,
      language: langKey,
      summary,
      isCached: false,
      source
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLessonSummary
};

