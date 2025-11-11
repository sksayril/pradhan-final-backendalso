const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const studentSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false
  },
  originalPassword: {
    type: String,
    required: [true, 'Original password is required'],
    select: false
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  studentId: {
    type: String,
    unique: true,
    trim: true,
    uppercase: true
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true
  },
  year: {
    type: String,
    required: [true, 'Academic year is required'],
    enum: ['1st', '2nd', '3rd', '4th', '5th', 'Graduate', 'Post-Graduate']
  },
  phoneNumber: {
    type: String
  },
  dateOfBirth: {
    type: Date,
    validate: {
      validator: function(v) {
        return !v || v < new Date();
      },
      message: 'Date of birth must be in the past'
    }
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: {
      type: String,
      default: 'India'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  kycStatus: {
    type: String,
    enum: ['not_submitted', 'pending', 'approved', 'rejected'],
    default: 'not_submitted'
  },
  lastLogin: {
    type: Date
  },
  profilePicture: {
    type: String
  },
  interests: [String],
  achievements: [{
    title: String,
    description: String,
    date: Date,
    issuer: String
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
studentSchema.index({ email: 1 });
studentSchema.index({ studentId: 1 });
studentSchema.index({ department: 1 });
studentSchema.index({ year: 1 });

// Auto-generate student ID before saving
studentSchema.pre('save', async function(next) {
  if (this.isNew && !this.studentId) {
    try {
      const { generateStudentId } = require('../utilities/studentIdGenerator');
      this.studentId = await generateStudentId();
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Hash password before saving
studentSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    // Store original password in text format
    this.originalPassword = this.password;
    
    // Hash the password
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
studentSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
studentSchema.methods.toJSON = function() {
  const student = this.toObject();
  delete student.password;
  return student;
};

module.exports = mongoose.model('Student', studentSchema);
