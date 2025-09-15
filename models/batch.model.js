const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: [true, 'Date is required']
  },
  startTime: {
    type: String,
    required: [true, 'Start time is required'],
    validate: {
      validator: function(v) {
        // Validate time format (HH:MM)
        return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: 'Start time must be in HH:MM format'
    }
  },
  endTime: {
    type: String,
    required: [true, 'End time is required'],
    validate: {
      validator: function(v) {
        // Validate time format (HH:MM)
        return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: 'End time must be in HH:MM format'
    }
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

const batchSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Batch name is required'],
    trim: true,
    maxlength: [100, 'Batch name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course ID is required']
  },
  // Batch timing - multiple dates and time slots
  timeSlots: [timeSlotSchema],
  // Batch status
  status: {
    type: String,
    enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  // Enrollment
  maxStudents: {
    type: Number,
    required: [true, 'Maximum students is required'],
    min: [1, 'Maximum students must be at least 1']
  },
  enrolledStudents: [{
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student'
    },
    enrolledAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['enrolled', 'completed', 'dropped'],
      default: 'enrolled'
    }
  }],
  // Batch pricing (can override course pricing)
  price: {
    type: Number,
    min: [0, 'Price cannot be negative']
  },
  currency: {
    type: String,
    default: 'INR',
    enum: ['INR', 'USD', 'EUR']
  },
  // Batch metadata
  startDate: {
    type: Date,
    required: [true, 'Batch start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'Batch end date is required']
  },
  registrationStartDate: {
    type: Date,
    required: [true, 'Registration start date is required']
  },
  registrationEndDate: {
    type: Date,
    required: [true, 'Registration end date is required']
  },
  // Admin who created the batch
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  // Batch settings
  isActive: {
    type: Boolean,
    default: true
  },
  allowLateRegistration: {
    type: Boolean,
    default: false
  },
  // Batch statistics
  attendance: [{
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student'
    },
    timeSlotId: {
      type: mongoose.Schema.Types.ObjectId
    },
    attended: {
      type: Boolean,
      default: false
    },
    attendedAt: {
      type: Date
    }
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
batchSchema.index({ courseId: 1 });
batchSchema.index({ status: 1 });
batchSchema.index({ startDate: 1 });
batchSchema.index({ endDate: 1 });
batchSchema.index({ createdBy: 1 });
batchSchema.index({ isActive: 1 });

// Virtual for enrollment count
batchSchema.virtual('enrollmentCount').get(function() {
  if (!this.enrolledStudents) {
    return 0;
  }
  return this.enrolledStudents.filter(student => student.status === 'enrolled').length;
});

// Virtual for available spots
batchSchema.virtual('availableSpots').get(function() {
  return this.maxStudents - this.enrollmentCount;
});

// Virtual for batch duration in days
batchSchema.virtual('durationInDays').get(function() {
  const diffTime = Math.abs(this.endDate - this.startDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Ensure virtual fields are serialized
batchSchema.set('toJSON', { virtuals: true });

// Pre-save middleware to calculate time slot duration
batchSchema.pre('save', function(next) {
  if (this.timeSlots && this.timeSlots.length > 0) {
    this.timeSlots.forEach(slot => {
      if (slot.startTime && slot.endTime) {
        const start = new Date(`2000-01-01T${slot.startTime}:00`);
        const end = new Date(`2000-01-01T${slot.endTime}:00`);
        slot.duration = Math.round((end - start) / (1000 * 60)); // duration in minutes
      }
    });
  }
  next();
});

// Validation middleware
batchSchema.pre('save', function(next) {
  // Validate that end date is after start date
  if (this.endDate <= this.startDate) {
    return next(new Error('End date must be after start date'));
  }
  
  // Validate that registration end date is before or on batch end date
  if (this.registrationEndDate > this.endDate) {
    return next(new Error('Registration end date must be before or on batch end date'));
  }
  
  // Validate that registration start date is before registration end date
  if (this.registrationStartDate >= this.registrationEndDate) {
    return next(new Error('Registration start date must be before registration end date'));
  }
  
  // Optional: Allow registration to continue during the batch (more flexible)
  // This allows registration to continue even after batch starts
  // Remove this validation if you want to allow late registration
  if (!this.allowLateRegistration && this.registrationEndDate > this.startDate) {
    console.warn('Registration end date is after batch start date. Consider enabling allowLateRegistration.');
  }
  
  next();
});

module.exports = mongoose.model('Batch', batchSchema);
