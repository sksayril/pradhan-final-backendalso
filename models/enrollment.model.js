const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Student ID is required']
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course ID is required']
  },
  batchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
    required: [true, 'Batch ID is required']
  },
  enrollmentDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'enrolled', 'active', 'completed', 'dropped', 'suspended'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'partial', 'refunded'],
    default: 'pending'
  },
  paymentAmount: {
    type: Number,
    required: [true, 'Payment amount is required'],
    min: [0, 'Payment amount cannot be negative']
  },
  currency: {
    type: String,
    default: 'INR',
    enum: ['INR', 'USD', 'EUR']
  },
  paymentDate: {
    type: Date
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'upi', 'netbanking', 'wallet', 'other']
  },
  transactionId: {
    type: String,
    trim: true
  },
  // Progress tracking
  progress: {
    completedLessons: [{
      lessonId: String,
      completedAt: Date,
      score: Number
    }],
    overallProgress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    lastAccessedAt: {
      type: Date,
      default: Date.now
    }
  },
  // Attendance tracking (for offline courses)
  attendance: [{
    date: Date,
    timeSlot: String,
    status: {
      type: String,
      enum: ['present', 'absent', 'late', 'excused']
    },
    notes: String
  }],
  // Course completion
  completionDate: {
    type: Date
  },
  certificateIssued: {
    type: Boolean,
    default: false
  },
  certificateUrl: {
    type: String
  },
  // Feedback and rating
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  review: {
    type: String,
    maxlength: [1000, 'Review cannot exceed 1000 characters']
  },
  reviewDate: {
    type: Date
  },
  // Admin notes
  adminNotes: {
    type: String,
    maxlength: [500, 'Admin notes cannot exceed 500 characters']
  },
  // Approval workflow
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  approvedAt: {
    type: Date
  },
  rejectionReason: {
    type: String,
    maxlength: [500, 'Rejection reason cannot exceed 500 characters']
  },
  rejectionNotes: {
    type: String,
    maxlength: [500, 'Rejection notes cannot exceed 500 characters']
  },
  // Enrollment metadata
  enrollmentSource: {
    type: String,
    enum: ['website', 'mobile_app', 'admin', 'referral', 'other'],
    default: 'website'
  },
  referralCode: {
    type: String,
    trim: true
  },
  discountApplied: {
    type: Number,
    default: 0,
    min: 0
  },
  discountCode: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
enrollmentSchema.index({ studentId: 1 });
enrollmentSchema.index({ courseId: 1 });
enrollmentSchema.index({ batchId: 1 });
enrollmentSchema.index({ status: 1 });
enrollmentSchema.index({ paymentStatus: 1 });
enrollmentSchema.index({ enrollmentDate: 1 });
enrollmentSchema.index({ approvalStatus: 1 });
enrollmentSchema.index({ approvedBy: 1 });

// Compound indexes
enrollmentSchema.index({ studentId: 1, courseId: 1 });
enrollmentSchema.index({ studentId: 1, batchId: 1 });
enrollmentSchema.index({ courseId: 1, batchId: 1 });

// Virtual for enrollment duration
enrollmentSchema.virtual('enrollmentDuration').get(function() {
  if (this.completionDate) {
    return Math.ceil((this.completionDate - this.enrollmentDate) / (1000 * 60 * 60 * 24));
  }
  return Math.ceil((Date.now() - this.enrollmentDate) / (1000 * 60 * 60 * 24));
});

// Virtual for payment status
enrollmentSchema.virtual('isPaid').get(function() {
  return this.paymentStatus === 'paid';
});

// Virtual for completion status
enrollmentSchema.virtual('isCompleted').get(function() {
  return this.status === 'completed';
});

// Ensure virtual fields are serialized
enrollmentSchema.set('toJSON', { virtuals: true });

// Pre-save middleware to update progress
enrollmentSchema.pre('save', function(next) {
  if (this.progress && this.progress.completedLessons) {
    // Calculate overall progress based on completed lessons
    // This would need to be implemented based on your course structure
    this.progress.lastAccessedAt = new Date();
  }
  next();
});

// Static method to get enrollment statistics
enrollmentSchema.statics.getEnrollmentStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalEnrollments: { $sum: 1 },
        activeEnrollments: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
        },
        completedEnrollments: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        totalRevenue: { $sum: '$paymentAmount' },
        averageRating: { $avg: '$rating' }
      }
    }
  ]);
  
  return stats[0] || {
    totalEnrollments: 0,
    activeEnrollments: 0,
    completedEnrollments: 0,
    totalRevenue: 0,
    averageRating: 0
  };
};

module.exports = mongoose.model('Enrollment', enrollmentSchema);
