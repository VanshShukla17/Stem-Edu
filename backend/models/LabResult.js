const mongoose = require('mongoose');

const labResultSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true
    },
    labId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lab',
      required: [true, 'Lab ID is required'],
      index: true
    },
    score: {
      type: Number,
      required: true
    },
    totalQuestions: {
      type: Number,
      required: true
    },
    percentage: {
      type: Number,
      required: true
    },
    passed: {
      type: Boolean,
      required: true
    },
    answers: [{
      questionIndex: Number,
      selectedOptionIndex: Number,
      correctOptionIndex: Number,
      isCorrect: Boolean,
      explanation: String
    }],
    simulationConfig: {
      length: Number,
      mass: Number,
      gravity: Number,
      angle: Number
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

module.exports = mongoose.model('LabResult', labResultSchema);

