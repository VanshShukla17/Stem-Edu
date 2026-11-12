const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Subject name is required'],
      trim: true
    },
    nameHindi: {
      type: String,
      required: [true, 'Hindi subject name is required'],
      trim: true
    },
    code: {
      type: String,
      required: [true, 'Subject code is required'],
      unique: true,
      lowercase: true,
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
    icon: {
      type: String,
      default: 'BookOpen'
    },
    color: {
      type: String,
      default: '#2563EB'
    },
    classLevel: {
      type: Number,
      default: 10
    },
    board: {
      type: String,
      default: 'CBSE',
      trim: true
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

subjectSchema.index({ board: 1, classLevel: 1 });

const Subject = mongoose.model('Subject', subjectSchema);

module.exports = Subject;
