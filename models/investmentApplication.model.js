const mongoose = require('mongoose');

const investmentApplicationSchema = new mongoose.Schema({
  // Application details
  applicationId: {
    type: String,
    unique: true,
    uppercase: true
  },
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InvestmentPlan',
    required: true
  },
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SocietyMember',
    required: true
  },
  // Investment details
  investmentAmount: {
    type: Number,
    required: true
  },
  monthlyEMI: {
    type: Number
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'online', 'both'],
    default: 'online'
  },
  // Application status
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled', 'completed'],
    default: 'pending'
  },
  // Application dates
  applicationDate: {
    type: Date,
    default: Date.now
  },
  approvalDate: {
    type: Date
  },
  rejectionDate: {
    type: Date
  },
  // Admin management
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  rejectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  rejectionReason: {
    type: String,
    trim: true
  },
  // Payment tracking
  paymentStatus: {
    type: String,
    enum: ['pending', 'partial', 'completed', 'failed'],
    default: 'pending'
  },
  totalAmountPaid: {
    type: Number,
    default: 0
  },
  remainingAmount: {
    type: Number
  },
  // EMI schedule for RD plans
  emiSchedule: [{
    emiNumber: {
      type: Number,
      required: true
    },
    dueDate: {
      type: Date,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'overdue', 'cancelled'],
      default: 'pending'
    },
    paidDate: {
      type: Date
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'online']
    },
    transactionId: {
      type: String,
      trim: true
    },
    penaltyAmount: {
      type: Number,
      default: 0
    },
    remarks: {
      type: String,
      trim: true
    }
  }],
  // Payment history
  paymentHistory: [{
    date: {
      type: Date,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'online'],
      required: true
    },
    transactionId: {
      type: String,
      trim: true
    },
    emiNumber: {
      type: Number
    },
    status: {
      type: String,
      enum: ['success', 'failed', 'pending'],
      default: 'success'
    },
    remarks: {
      type: String,
      trim: true
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    }
  }],
  // Documents
  documents: [{
    documentType: {
      type: String,
      enum: ['application_form', 'identity_proof', 'address_proof', 'income_proof', 'bank_statement'],
      required: true
    },
    documentUrl: {
      type: String,
      required: true
    },
    uploadedDate: {
      type: Date,
      default: Date.now
    }
  }],
  // Notes and remarks
  notes: [{
    date: {
      type: Date,
      default: Date.now
    },
    note: {
      type: String,
      required: true,
      trim: true
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true
    }
  }],
  // Terms and conditions acceptance
  termsAccepted: {
    type: Boolean,
    default: false
  },
  termsAcceptedDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for better query performance
investmentApplicationSchema.index({ applicationId: 1 });
investmentApplicationSchema.index({ planId: 1 });
investmentApplicationSchema.index({ memberId: 1 });
investmentApplicationSchema.index({ status: 1 });
investmentApplicationSchema.index({ applicationDate: 1 });
investmentApplicationSchema.index({ approvedBy: 1 });

// Pre-save middleware to generate application ID
investmentApplicationSchema.pre('save', async function(next) {
  try {
    // Always generate applicationId if not provided or empty
    if (!this.applicationId || this.applicationId.trim() === '') {
      const count = await this.constructor.countDocuments();
      const timestamp = new Date().getFullYear().toString().slice(-2);
      const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
      const sequence = (count + 1).toString().padStart(3, '0');
      this.applicationId = `APP${timestamp}${month}${sequence}`;
    }
    
    // Calculate remaining amount
    if (this.investmentAmount && this.totalAmountPaid) {
      this.remainingAmount = this.investmentAmount - this.totalAmountPaid;
    }
    
    next();
  } catch (error) {
    console.error('Error in pre-save middleware:', error);
    next(error);
  }
});

// Method to generate applicationId if not exists
investmentApplicationSchema.methods.generateApplicationId = async function() {
  if (!this.applicationId || this.applicationId.trim() === '') {
    const count = await this.constructor.countDocuments();
    const timestamp = new Date().getFullYear().toString().slice(-2);
    const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
    const sequence = (count + 1).toString().padStart(3, '0');
    this.applicationId = `APP${timestamp}${month}${sequence}`;
  }
  return this.applicationId;
};

// Method to get application summary
investmentApplicationSchema.methods.getApplicationSummary = function() {
  const totalEMIs = this.emiSchedule.length;
  const paidEMIs = this.emiSchedule.filter(emi => emi.status === 'paid').length;
  const pendingEMIs = this.emiSchedule.filter(emi => emi.status === 'pending').length;
  const overdueEMIs = this.emiSchedule.filter(emi => 
    emi.status === 'pending' && emi.dueDate < new Date()
  ).length;
  
  return {
    applicationId: this.applicationId,
    status: this.status,
    investmentAmount: this.investmentAmount,
    totalAmountPaid: this.totalAmountPaid,
    remainingAmount: this.remainingAmount,
    paymentStatus: this.paymentStatus,
    emiProgress: {
      total: totalEMIs,
      paid: paidEMIs,
      pending: pendingEMIs,
      overdue: overdueEMIs
    },
    applicationDate: this.applicationDate,
    approvalDate: this.approvalDate
  };
};

// Method to add payment
investmentApplicationSchema.methods.addPayment = function(amount, paymentMethod, emiNumber = null, transactionId = null, remarks = null, processedBy = null) {
  this.paymentHistory.push({
    date: new Date(),
    amount: amount,
    paymentMethod: paymentMethod,
    transactionId: transactionId,
    emiNumber: emiNumber,
    status: 'success',
    remarks: remarks,
    processedBy: processedBy
  });
  
  this.totalAmountPaid += amount;
  this.remainingAmount = this.investmentAmount - this.totalAmountPaid;
  
  // Update payment status
  if (this.remainingAmount <= 0) {
    this.paymentStatus = 'completed';
  } else if (this.totalAmountPaid > 0) {
    this.paymentStatus = 'partial';
  }
};

// Method to update EMI status
investmentApplicationSchema.methods.updateEMIStatus = function(emiNumber, status, paidDate = null, paymentMethod = null, transactionId = null, penaltyAmount = 0, remarks = null) {
  const emi = this.emiSchedule.find(e => e.emiNumber === emiNumber);
  if (emi) {
    emi.status = status;
    if (paidDate) emi.paidDate = paidDate;
    if (paymentMethod) emi.paymentMethod = paymentMethod;
    if (transactionId) emi.transactionId = transactionId;
    if (penaltyAmount > 0) emi.penaltyAmount = penaltyAmount;
    if (remarks) emi.remarks = remarks;
  }
};

// Method to approve application
investmentApplicationSchema.methods.approveApplication = function(adminId) {
  this.status = 'approved';
  this.approvalDate = new Date();
  this.approvedBy = adminId;
};

// Method to reject application
investmentApplicationSchema.methods.rejectApplication = function(adminId, reason) {
  this.status = 'rejected';
  this.rejectionDate = new Date();
  this.rejectedBy = adminId;
  this.rejectionReason = reason;
};

module.exports = mongoose.model('InvestmentApplication', investmentApplicationSchema);
