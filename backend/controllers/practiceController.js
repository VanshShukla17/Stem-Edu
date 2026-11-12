const Question = require('../models/Question');
const TestResult = require('../models/TestResult');

/**
 * GET /api/chapters/:id/test
 * Returns chapter test questions WITHOUT correct answers or explanations
 * Task 3.4: "Done when: the response has no correctIndex field."
 */
const getChapterTest = async (req, res, next) => {
  try {
    const chapterId = req.params.id;

    const questions = await Question.find({ chapterId })
      .select('-correctOptionIndex -explanation -explanationHindi -__v');

    // Strip any virtuals or accidental leaks to guarantee safety
    const sanitizedQuestions = questions.map(q => {
      const obj = q.toObject();
      delete obj.correctOptionIndex;
      delete obj.correctIndex;
      delete obj.explanation;
      delete obj.explanationHindi;
      obj.id = obj._id;
      return obj;
    });

    res.status(200).json(sanitizedQuestions);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/chapters/:id/test/submit
 * Hand-written scoring route that validates answers on the server, calculates score,
 * saves TestResult, and returns score plus explanations.
 * Task 3.5: "Done when: a known set of answers gives the expected score."
 */
const submitChapterTest = async (req, res, next) => {
  try {
    const chapterId = req.params.id;
    const userId = req.user._id;
    const { answers = [], timeTakenSeconds = 0 } = req.body;

    // 1. Fetch all official questions for this chapter from the database
    const questions = await Question.find({ chapterId });

    if (!questions || questions.length === 0) {
      return res.status(404).json({ message: 'No questions found for this chapter' });
    }

    // 2. Index questions by ID for fast lookup
    const questionMap = new Map();
    questions.forEach(q => {
      questionMap.set(q._id.toString(), q);
    });

    // Map student submitted answers by questionId
    const submittedAnswersMap = new Map();
    answers.forEach(a => {
      if (a && a.questionId) {
        submittedAnswersMap.set(a.questionId.toString(), a.selectedOptionIndex);
      }
    });

    let score = 0;
    const itemizedAnswers = [];

    // 3. Score every question on the server
    for (const question of questions) {
      const qIdStr = question._id.toString();
      const selectedIndex = submittedAnswersMap.has(qIdStr)
        ? Number(submittedAnswersMap.get(qIdStr))
        : -1;

      const isCorrect = selectedIndex === question.correctOptionIndex;
      if (isCorrect) {
        score += 1;
      }

      itemizedAnswers.push({
        questionId: question._id,
        questionText: question.questionText,
        selectedOptionIndex: selectedIndex,
        correctOptionIndex: question.correctOptionIndex,
        isCorrect,
        explanation: question.explanation
      });
    }

    const totalQuestions = questions.length;
    const percentage = totalQuestions > 0
      ? Math.round((score / totalQuestions) * 100)
      : 0;

    // 4. Save attempt in TestResult collection
    const testResult = await TestResult.create({
      userId,
      chapterId,
      totalQuestions,
      score,
      percentage,
      answers: itemizedAnswers,
      timeTakenSeconds: Number(timeTakenSeconds) || 0
    });

    res.status(200).json({
      message: 'Test submitted and scored successfully',
      resultId: testResult._id,
      score,
      totalQuestions,
      percentage,
      timeTakenSeconds: testResult.timeTakenSeconds,
      answers: itemizedAnswers
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/results
 * List past test attempts for the authenticated student, sorted newest first
 * Task 3.6: "Done when: two attempts both appear, newest first."
 */
const getResults = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const results = await TestResult.find({ userId })
      .populate('chapterId', 'chapterNumber title titleHindi subjectId')
      .sort({ createdAt: -1 });

    res.status(200).json(results);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/results/:id
 * Fetch detailed result attempt breakdown
 */
const getResultById = async (req, res, next) => {
  try {
    const result = await TestResult.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate('chapterId', 'chapterNumber title titleHindi subjectId');

    if (!result) {
      return res.status(404).json({ message: 'Test result not found' });
    }

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getChapterTest,
  submitChapterTest,
  getResults,
  getResultById
};

