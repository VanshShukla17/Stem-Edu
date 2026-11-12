const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    chapterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chapter',
      required: [true, 'Chapter ID is required'],
      index: true
    },
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
      default: null
    },
    questionText: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true
    },
    questionTextHindi: {
      type: String,
      default: '',
      trim: true
    },
    options: {
      type: [String],
      required: [true, 'Options are required'],
      validate: [val => val.length >= 2, 'At least 2 options are required']
    },
    optionsHindi: {
      type: [String],
      default: []
    },
    correctOptionIndex: {
      type: Number,
      required: [true, 'Correct option index is required'],
      min: 0
    },
    explanation: {
      type: String,
      required: [true, 'Explanation is required'],
      trim: true
    },
    explanationHindi: {
      type: String,
      default: '',
      trim: true
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium'
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

// Virtual alias 'correctIndex' for 'correctOptionIndex'
questionSchema.virtual('correctIndex')
  .get(function () {
    return this.correctOptionIndex;
  })
  .set(function (val) {
    this.correctOptionIndex = val;
  });

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;
