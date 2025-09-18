const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  // Payment identification
  paymentId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true // Allow null values but ensure uniqueness when present
  },
  
  // References
  investmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Investment',
    required: true
  },
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SocietyMember',
    required: true
  },
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InvestmentPlan',
    required: true
  },
  
  // Payment details
  paymentType: {
    type: String,
    enum: ['cash', 'online', 'cheque', 'bank_transfer'],
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'upi', 'net_banking', 'credit_card', 'debit_card', 'wallet', 'cheque', 'bank_transfer'],
    required: true
  },
  
  // Amount details
  amount: {
    type: Number,
    required: [true, 'Payment amount is required'],
    min: [1, 'Payment amount must be greater than 0']
  },
  emiNumber: {
    type: Number,
    required: function() {
      return this.paymentFor === 'emi';
    }
  },
  paymentFor: {
    type: String,
    enum: ['principal', 'emi', 'penalty', 'interest', 'full_investment'],
    required: true
  },
  
  // Payment status
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  
  // Online payment specific fields
  gatewayResponse: {
    gatewayName: {
      type: String,
      enum: ['razorpay', 'payu', 'paytm', 'phonepe', 'google_pay', 'other']
    },
    gatewayTransactionId: String,
    gatewayOrderId: String,
    gatewayPaymentId: String,
    gatewaySignature: String,
    gatewayStatus: String,
    gatewayResponse: mongoose.Schema.Types.Mixed
  },
  
  // Cash payment specific fields
  cashPaymentDetails: {
    receivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    },
    receivedDate: Date,
    receiptNumber: String,
    remarks: String
  },
  
  // Payment screenshots and documents
  paymentScreenshots: [{
    screenshotType: {
      type: String,
      enum: ['payment_confirmation', 'bank_statement', 'upi_screenshot', 'receipt', 'other'],
      required: true
    },
    fileUrl: {
      type: String,
      required: true
    },
    fileName: String,
    fileSize: Number,
    uploadedDate: {
      type: Date,
      default: Date.now
    },
    description: String
  }],
  
  // Payment verification
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  verifiedDate: Date,
  verificationRemarks: String,
  
  // Payment dates
  paymentDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  dueDate: Date,
  processedDate: Date,
  
  // Additional information
  remarks: String,
  notes: [{
    note: {
      type: String,
      required: true,
      trim: true
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true
    },
    addedDate: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Refund information
  refundDetails: {
    refundAmount: Number,
    refundDate: Date,
    refundReason: String,
    refundMethod: String,
    refundTransactionId: String,
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    }
  },
  
  // Admin management
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
paymentSchema.index({ paymentId: 1 });
paymentSchema.index({ transactionId: 1 });
paymentSchema.index({ investmentId: 1 });
paymentSchema.index({ memberId: 1 });
paymentSchema.index({ planId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ paymentType: 1 });
paymentSchema.index({ paymentDate: 1 });
paymentSchema.index({ verificationStatus: 1 });
paymentSchema.index({ 'gatewayResponse.gatewayTransactionId': 1 });

// Pre-save middleware to generate payment ID
paymentSchema.pre('save', async function(next) {
  if (!this.paymentId) {
    const count = await this.constructor.countDocuments();
    const timestamp = new Date().getFullYear().toString().slice(-2);
    const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
    const sequence = (count + 1).toString().padStart(3, '0');
    this.paymentId = `PAY${timestamp}${month}${sequence}`;
  }
  next();
});

// Method to add payment screenshot
paymentSchema.methods.addPaymentScreenshot = function(screenshotData) {
  this.paymentScreenshots.push({
    ...screenshotData,
    uploadedDate: new Date()
  });
};

// Method to update payment status
paymentSchema.methods.updatePaymentStatus = function(status, remarks = null, modifiedBy = null) {
  this.status = status;
  if (remarks) this.remarks = remarks;
  if (modifiedBy) this.lastModifiedBy = modifiedBy;
  
  if (status === 'completed') {
    this.processedDate = new Date();
  }
};

// Method to verify payment
paymentSchema.methods.verifyPayment = function(verifiedBy, status, remarks = null) {
  this.verificationStatus = status;
  this.verifiedBy = verifiedBy;
  this.verifiedDate = new Date();
  if (remarks) this.verificationRemarks = remarks;
};

// Method to add note
paymentSchema.methods.addNote = function(note, addedBy) {
  this.notes.push({
    note: note,
    addedBy: addedBy,
    addedDate: new Date()
  });
};

// Method to process refund
paymentSchema.methods.processRefund = function(refundData, processedBy) {
  this.refundDetails = {
    ...refundData,
    processedBy: processedBy,
    refundDate: new Date()
  };
  this.status = 'refunded';
};

// Method to get payment summary
paymentSchema.methods.getPaymentSummary = function() {
  return {
    paymentId: this.paymentId,
    transactionId: this.transactionId,
    amount: this.amount,
    paymentType: this.paymentType,
    paymentMethod: this.paymentMethod,
    status: this.status,
    verificationStatus: this.verificationStatus,
    paymentDate: this.paymentDate,
    paymentFor: this.paymentFor,
    emiNumber: this.emiNumber,
    screenshots: this.paymentScreenshots.length,
    remarks: this.remarks
  };
};

// Static method to get payments by member
paymentSchema.statics.getPaymentsByMember = function(memberId, options = {}) {
  const query = { memberId: memberId };
  
  if (options.status) query.status = options.status;
  if (options.paymentType) query.paymentType = options.paymentType;
  if (options.verificationStatus) query.verificationStatus = options.verificationStatus;
  if (options.startDate && options.endDate) {
    query.paymentDate = {
      $gte: new Date(options.startDate),
      $lte: new Date(options.endDate)
    };
  }
  
  return this.find(query)
    .populate('investmentId', 'investmentId planId principalAmount')
    .populate('planId', 'planName planType interestRate')
    .populate('memberId', 'firstName lastName memberId email')
    .populate('verifiedBy', 'firstName lastName')
    .sort({ paymentDate: -1 });
};

// Static method to get payments by investment
paymentSchema.statics.getPaymentsByInvestment = function(investmentId) {
  return this.find({ investmentId: investmentId })
    .populate('memberId', 'firstName lastName memberId email')
    .populate('verifiedBy', 'firstName lastName')
    .sort({ paymentDate: -1 });
};

// Static method to get payment statistics
paymentSchema.statics.getPaymentStatistics = function(filters = {}) {
  const matchStage = {};
  
  if (filters.startDate && filters.endDate) {
    matchStage.paymentDate = {
      $gte: new Date(filters.startDate),
      $lte: new Date(filters.endDate)
    };
  }
  
  if (filters.paymentType) matchStage.paymentType = filters.paymentType;
  if (filters.status) matchStage.status = filters.status;
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalPayments: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        completedPayments: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        completedAmount: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$amount', 0] }
        },
        pendingPayments: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        pendingAmount: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, '$amount', 0] }
        },
        failedPayments: {
          $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
        },
        failedAmount: {
          $sum: { $cond: [{ $eq: ['$status', 'failed'] }, '$amount', 0] }
        }
      }
    }
  ]);
};

module.exports = mongoose.model('Payment', paymentSchema);
