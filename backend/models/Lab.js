const mongoose = require('mongoose');

const labVariableSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: ['length', 'mass', 'gravity', 'angle']
  },
  label: {
    type: String,
    required: true,
    trim: true
  },
  labelHindi: {
    type: String,
    default: '',
    trim: true
  },
  unit: {
    type: String,
    required: true,
    trim: true
  },
  min: {
    type: Number,
    required: true
  },
  max: {
    type: Number,
    required: true
  },
  step: {
    type: Number,
    required: true,
    default: 0.1
  },
  defaultValue: {
    type: Number,
    required: true
  }
}, { _id: false });

const observationQuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true
  },
  questionHindi: {
    type: String,
    default: '',
    trim: true
  },
  options: [{
    type: String,
    required: true,
    trim: true
  }],
  optionsHindi: [{
    type: String,
    trim: true
  }],
  correctIndex: {
    type: Number,
    required: true,
    min: 0,
    max: 3
  },
  explanation: {
    type: String,
    default: '',
    trim: true
  }
});

const labSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Lab title is required'],
    trim: true
  },
  titleHindi: {
    type: String,
    default: '',
    trim: true
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: [true, 'Parent Subject ID is required']
  },
  experimentType: {
    type: String,
    required: [true, 'Experiment type identifier is required'],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  descriptionHindi: {
    type: String,
    default: '',
    trim: true
  },
  instructions: [{
    type: String,
    trim: true
  }],
  instructionsHindi: [{
    type: String,
    trim: true
  }],
  variables: [labVariableSchema],
  observationQuestions: [observationQuestionSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('Lab', labSchema);

