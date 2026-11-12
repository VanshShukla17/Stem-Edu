const mongoose = require('mongoose');

const diagramElementSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true
    },
    label: {
      type: String,
      required: true
    },
    labelHindi: {
      type: String,
      default: ''
    },
    shape: {
      type: String,
      enum: ['circle', 'rect', 'path', 'polygon', 'text'],
      default: 'path'
    },
    pathData: {
      type: String,
      default: ''
    },
    attributes: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: () => ({})
    },
    explanation: {
      type: String,
      required: true
    },
    explanationHindi: {
      type: String,
      default: ''
    }
  },
  { _id: false }
);

const diagramSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Diagram title is required'],
      trim: true
    },
    titleHindi: {
      type: String,
      default: '',
      trim: true
    },
    subjectCode: {
      type: String,
      enum: ['physics', 'chemistry', 'biology', 'mathematics'],
      required: true,
      index: true
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      default: null
    },
    svgViewBox: {
      type: String,
      default: '0 0 600 400'
    },
    elements: [diagramElementSchema]
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

const Diagram = mongoose.model('Diagram', diagramSchema);

module.exports = Diagram;

