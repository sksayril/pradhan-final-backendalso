const mongoose = require('mongoose');

const feePaymentSchema = new mongoose.Schema({
  feeRequestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FeeRequest',
    required: true
  },
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
  amount: {
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
    enum: ['online', 'cash', 'bank_transfer', 'cheque'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'completed'
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  transactionId: {
    type: String,
    sparse: true // Allow multiple null values
  },
  paymentReference: {
    type: String,
    sparse: true
  },
  receiptNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  notes: {
    type: String,
    maxlength: 500
  },
  collectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  verificationDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Virtual for payment type description
feePaymentSchema.virtual('paymentTypeDescription').get(function() {
  const descriptions = {
    'online': 'Online Payment',
    'cash': 'Cash Payment',
    'bank_transfer': 'Bank Transfer',
    'cheque': 'Cheque Payment'
  };
  return descriptions[this.paymentMethod] || this.paymentMethod;
});

// Pre-save middleware to generate receipt number for cash payments
feePaymentSchema.pre('save', async function(next) {
  if (this.paymentMethod === 'cash' && !this.receiptNumber) {
    const count = await this.constructor.countDocuments();
    this.receiptNumber = `CASH-${Date.now()}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Index for efficient queries
feePaymentSchema.index({ studentId: 1, paymentDate: -1 });
feePaymentSchema.index({ feeRequestId: 1 });
feePaymentSchema.index({ courseId: 1 });
feePaymentSchema.index({ batchId: 1 });
feePaymentSchema.index({ paymentDate: -1 });
feePaymentSchema.index({ collectedBy: 1 });

module.exports = mongoose.model('FeePayment', feePaymentSchema);
