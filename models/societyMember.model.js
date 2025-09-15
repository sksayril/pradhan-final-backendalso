const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const societyMemberSchema = new mongoose.Schema({
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
  memberId: {
    type: String,
    required: [true, 'Member ID is required'],
    unique: true,
    trim: true,
    uppercase: true,
    validate: {
      validator: function(v) {
        // Validate format: YYYYMMXXX (e.g., 202511001)
        return /^\d{4}\d{2}\d{3}$/.test(v);
      },
      message: 'Member ID must be in format YYYYMMXXX (e.g., 202511001)'
    }
  },
  societyName: {
    type: String,
    required: [true, 'Society name is required'],
    trim: true
  },
  position: {
    type: String,
    required: [true, 'Position is required'],
    enum: ['President', 'Vice-President', 'Secretary', 'Treasurer', 'Member', 'Coordinator', 'Volunteer']
  },
  department: {
    type: String,
    trim: true
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
  joiningDate: {
    type: Date,
    default: Date.now
  },
  skills: [String],
  responsibilities: [String],
  achievements: [{
    title: String,
    description: String,
    date: Date,
    issuer: String
  }],
  eventsOrganized: [{
    eventName: String,
    date: Date,
    description: String,
    attendees: Number
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
societyMemberSchema.index({ email: 1 });
societyMemberSchema.index({ memberId: 1 });
societyMemberSchema.index({ societyName: 1 });
societyMemberSchema.index({ position: 1 });

// Hash password before saving
societyMemberSchema.pre('save', async function(next) {
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
societyMemberSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
societyMemberSchema.methods.toJSON = function() {
  const member = this.toObject();
  delete member.password;
  return member;
};

module.exports = mongoose.model('SocietyMember', societyMemberSchema);
