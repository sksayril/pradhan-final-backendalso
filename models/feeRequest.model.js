const mongoose = require('mongoose');

const feeRequestSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  batchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
    required: true
  },
  enrollmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Enrollment',
    required: true
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'INR',
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['online', 'cash'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'partial', 'overdue'],
    default: 'pending'
  },
  paidAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  remainingAmount: {
    type: Number,
    default: function() {
      return this.totalAmount - this.paidAmount;
    }
  },
  dueDate: {
    type: Date,
    required: true
  },
  requestDate: {
    type: Date,
    default: Date.now
  },
  paymentDate: {
    type: Date
  },
  notes: {
    type: String,
    maxlength: 500
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true
});

// Virtual for payment status
feeRequestSchema.virtual('paymentStatus').get(function() {
  if (this.paidAmount === 0) return 'unpaid';
  if (this.paidAmount >= this.totalAmount) return 'paid';
  return 'partial';
});

// Virtual for days overdue
feeRequestSchema.virtual('daysOverdue').get(function() {
  if (this.status === 'paid' || this.status === 'partial') return 0;
  const today = new Date();
  const due = new Date(this.dueDate);
  const diffTime = today - due;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to update remaining amount
feeRequestSchema.pre('save', function(next) {
  this.remainingAmount = this.totalAmount - this.paidAmount;
  
  // Update status based on payment
  if (this.paidAmount >= this.totalAmount) {
    this.status = 'paid';
    this.paymentDate = new Date();
  } else if (this.paidAmount > 0) {
    this.status = 'partial';
  } else if (new Date() > this.dueDate) {
    this.status = 'overdue';
  } else {
    this.status = 'pending';
  }
  
  next();
});

// Index for efficient queries
feeRequestSchema.index({ studentId: 1, status: 1 });
feeRequestSchema.index({ courseId: 1 });
feeRequestSchema.index({ batchId: 1 });
feeRequestSchema.index({ dueDate: 1 });
feeRequestSchema.index({ createdBy: 1 });

module.exports = mongoose.model('FeeRequest', feeRequestSchema);
