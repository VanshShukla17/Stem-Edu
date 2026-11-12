const mongoose = require('mongoose');
const Lab = require('../models/Lab');
const LabResult = require('../models/LabResult');

/**
 * GET /api/labs
 * Retrieve list of all virtual labs
 */
exports.getAllLabs = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.subjectId && mongoose.isValidObjectId(req.query.subjectId)) {
      filter.subjectId = req.query.subjectId;
    }
    if (req.query.experimentType) {
      filter.experimentType = req.query.experimentType;
    }

    const labs = await Lab.find(filter)
      .populate('subjectId', 'name nameHindi code color')
      .select('-observationQuestions.correctIndex');

    res.json({
      success: true,
      count: labs.length,
      labs
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/labs/:id
 * Retrieve a specific lab by ObjectId or experimentType identifier
 */
exports.getLabByIdOrType = async (req, res, next) => {
  try {
    const { id } = req.params;
    let query;

    if (mongoose.isValidObjectId(id)) {
      query = { _id: id };
    } else {
      const norm = id === 'pendulum' ? 'simple_pendulum' : id;
      query = { experimentType: norm };
    }

    const lab = await Lab.findOne(query).populate('subjectId', 'name nameHindi code color');
    if (!lab) {
      return res.status(404).json({
        success: false,
        message: `Virtual lab '${id}' not found`
      });
    }

    // Prepare safe questions for student (hide correctIndex until submit)
    const isAdmin = req.user && req.user.role === 'admin';
    const safeLab = lab.toObject();

    if (!isAdmin) {
      safeLab.observationQuestions = safeLab.observationQuestions.map(q => ({
        _id: q._id,
        question: q.question,
        questionHindi: q.questionHindi,
        options: q.options,
        optionsHindi: q.optionsHindi
      }));
    }

    res.json({
      success: true,
      lab: safeLab
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/labs/:id/submit
 * Submit end-of-lab observation quiz and record student result
 */
exports.submitLabQuiz = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { answers, simulationConfig } = req.body;

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid submission: answers array is required'
      });
    }

    let query;
    if (mongoose.isValidObjectId(id)) {
      query = { _id: id };
    } else {
      const norm = id === 'pendulum' ? 'simple_pendulum' : id;
      query = { experimentType: norm };
    }

    const lab = await Lab.findOne(query);
    if (!lab) {
      return res.status(404).json({
        success: false,
        message: `Virtual lab '${id}' not found`
      });
    }

    const totalQuestions = lab.observationQuestions.length;
    let score = 0;
    const evaluatedAnswers = [];

    lab.observationQuestions.forEach((q, idx) => {
      const selectedIndex = answers[idx];
      const isCorrect = selectedIndex === q.correctIndex;
      if (isCorrect) score += 1;

      evaluatedAnswers.push({
        questionIndex: idx,
        questionText: q.question,
        selectedOptionIndex: selectedIndex !== undefined ? selectedIndex : -1,
        correctOptionIndex: q.correctIndex,
        isCorrect,
        explanation: q.explanation || ''
      });
    });

    const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
    const passed = percentage >= 60;

    // Save student lab result
    let savedResult = null;
    if (req.user && req.user._id) {
      const labResult = new LabResult({
        userId: req.user._id,
        labId: lab._id,
        score,
        totalQuestions,
        percentage,
        passed,
        answers: evaluatedAnswers,
        simulationConfig: simulationConfig || {}
      });
      savedResult = await labResult.save();
    }

    res.json({
      success: true,
      resultId: savedResult ? savedResult._id : null,
      score,
      totalQuestions,
      percentage,
      passed,
      evaluatedAnswers
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/labs/results/me
 * Get current user's past lab test results
 */
exports.getMyLabResults = async (req, res, next) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const results = await LabResult.find({ userId: req.user._id })
      .populate('labId', 'title titleHindi experimentType')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      success: true,
      count: results.length,
      results
    });
  } catch (error) {
    next(error);
  }
};
