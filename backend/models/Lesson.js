const mongoose = require('mongoose');

const contentBlockSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['text', 'image', 'formula', 'callout', 'diagram'],
      required: true,
      default: 'text'
    },
    content: {
      type: String,
      default: ''
    },
    contentHindi: {
      type: String,
      default: ''
    },
    mediaUrl: {
      type: String,
      default: null
    },
    diagramId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    }
  },
  { _id: true }
);

const lessonSchema = new mongoose.Schema(
  {
    chapterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chapter',
      required: [true, 'Chapter ID is required'],
      index: true
    },
    lessonNumber: {
      type: Number,
      required: [true, 'Lesson number is required']
    },
    title: {
      type: String,
      required: [true, 'Lesson title is required'],
      trim: true
    },
    titleHindi: {
      type: String,
      required: [true, 'Hindi lesson title is required'],
      trim: true
    },
    contentBlocks: [contentBlockSchema],
    diagramId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    labId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    cachedSummary: {
      en: { type: String, default: null },
      hi: { type: String, default: null }
    },
    order: {
      type: Number,
      default: 0
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

lessonSchema.index({ chapterId: 1, order: 1 });

const Lesson = mongoose.model('Lesson', lessonSchema);

module.exports = Lesson;
