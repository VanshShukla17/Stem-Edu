const mongoose = require('mongoose');

const chapterSchema = new mongoose.Schema(
  {
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Subject ID is required'],
      index: true
    },
    chapterNumber: {
      type: Number,
      required: [true, 'Chapter number is required']
    },
    title: {
      type: String,
      required: [true, 'Chapter title is required'],
      trim: true
    },
    titleHindi: {
      type: String,
      required: [true, 'Hindi chapter title is required'],
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    descriptionHindi: {
      type: String,
      default: ''
    },
    board: {
      type: String,
      default: 'CBSE',
      trim: true,
      index: true
    },
    classLevel: {
      type: Number,
      default: 10,
      index: true
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

// Virtual alias 'class' for classLevel
chapterSchema.virtual('class')
  .get(function () {
    return this.classLevel;
  })
  .set(function (val) {
    this.classLevel = val;
  });

chapterSchema.index({ subjectId: 1, board: 1, classLevel: 1 });

const Chapter = mongoose.model('Chapter', chapterSchema);

module.exports = Chapter;

