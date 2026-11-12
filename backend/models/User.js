const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      sparse: true,
      unique: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address'
      ]
    },
    phone: {
      type: String,
      trim: true,
      sparse: true,
      unique: true
    },
    passwordHash: {
      type: String,
      required: [true, 'Please provide a password hash']
    },
    role: {
      type: String,
      enum: ['student', 'admin', 'teacher'],
      default: 'student'
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
    language: {
      type: String,
      enum: ['en', 'hi'],
      default: 'en'
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.passwordHash;
        delete ret.__v;
        ret.id = ret._id;
        return ret;
      }
    }
  }
);

// Virtual alias: 'class' maps to 'classLevel' for API compatibility
userSchema.virtual('class')
  .get(function () {
    return this.classLevel;
  })
  .set(function (val) {
    this.classLevel = val;
  });

// Validate that either email or phone is present
userSchema.pre('validate', function (next) {
  if (!this.email && !this.phone) {
    this.invalidate('email', 'Either an email or phone number is required');
  }
  next();
});

// Instance method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Static helper to hash password
userSchema.statics.hashPassword = async function (password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
