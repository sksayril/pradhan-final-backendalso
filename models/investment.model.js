const mongoose = require('mongoose');

const investmentSchema = new mongoose.Schema({
  // Investment details
  investmentId: {
    type: String,
    required: true,
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
  // Investment amount details
  principalAmount: {
    type: Number,
    required: [true, 'Principal amount is required'],
    min: [1000, 'Principal amount must be at least ₹1000']
  },
  monthlyInstallment: {
    type: Number,
    min: [100, 'Monthly installment must be at least ₹100']
  },
  // Investment dates
  investmentDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  maturityDate: {
    type: Date,
    required: true
  },
  // EMI tracking for RD
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
      enum: ['pending', 'paid', 'overdue', 'penalty_applied'],
      default: 'pending'
    },
    paidDate: {
      type: Date
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
  // Investment status
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled', 'defaulted'],
    default: 'active'
  },
  // Returns and maturity
  expectedMaturityAmount: {
    type: Number,
    required: true
  },
  actualMaturityAmount: {
    type: Number
  },
  totalInterestEarned: {
    type: Number,
    default: 0
  },
  // Penalty tracking
  totalPenaltyPaid: {
    type: Number,
    default: 0
  },
  penaltyHistory: [{
    date: {
      type: Date,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    reason: {
      type: String,
      required: true,
      trim: true
    },
    emiNumber: {
      type: Number
    }
  }],
  // Payment tracking
  paymentHistory: [{
    date: {
      type: Date,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    paymentType: {
      type: String,
      enum: ['principal', 'emi', 'penalty', 'interest'],
      required: true
    },
    emiNumber: {
      type: Number
    },
    transactionId: {
      type: String,
      trim: true
    },
    remarks: {
      type: String,
      trim: true
    }
  }],
  // Documents and certificates
  documents: [{
    documentType: {
      type: String,
      enum: ['investment_certificate', 'emi_receipt', 'maturity_certificate', 'penalty_receipt'],
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
  // Admin management
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
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
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
investmentSchema.index({ investmentId: 1 });
investmentSchema.index({ planId: 1 });
investmentSchema.index({ memberId: 1 });
investmentSchema.index({ status: 1 });
investmentSchema.index({ investmentDate: 1 });
investmentSchema.index({ maturityDate: 1 });
investmentSchema.index({ createdBy: 1 });

// Pre-save middleware to generate investment ID
investmentSchema.pre('save', async function(next) {
  if (!this.investmentId) {
    const count = await this.constructor.countDocuments();
    const timestamp = new Date().getFullYear().toString().slice(-2);
    const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
    const sequence = (count + 1).toString().padStart(3, '0');
    this.investmentId = `INV${timestamp}${month}${sequence}`;
  }
  next();
});

// Method to calculate next EMI due date
investmentSchema.methods.getNextEMIDueDate = function() {
  const pendingEMIs = this.emiSchedule.filter(emi => emi.status === 'pending');
  if (pendingEMIs.length > 0) {
    return pendingEMIs[0].dueDate;
  }
  return null;
};

// Method to get overdue EMIs
investmentSchema.methods.getOverdueEMIs = function() {
  const today = new Date();
  return this.emiSchedule.filter(emi => 
    emi.status === 'pending' && emi.dueDate < today
  );
};

// Method to calculate total penalty
investmentSchema.methods.calculateTotalPenalty = function() {
  return this.penaltyHistory.reduce((total, penalty) => total + penalty.amount, 0);
};

// Method to get investment summary
investmentSchema.methods.getInvestmentSummary = function() {
  const totalEMIs = this.emiSchedule.length;
  const paidEMIs = this.emiSchedule.filter(emi => emi.status === 'paid').length;
  const overdueEMIs = this.getOverdueEMIs().length;
  
  return {
    investmentId: this.investmentId,
    status: this.status,
    principalAmount: this.principalAmount,
    expectedMaturityAmount: this.expectedMaturityAmount,
    totalInterestEarned: this.totalInterestEarned,
    totalPenaltyPaid: this.totalPenaltyPaid,
    emiProgress: {
      total: totalEMIs,
      paid: paidEMIs,
      pending: totalEMIs - paidEMIs,
      overdue: overdueEMIs
    },
    investmentDate: this.investmentDate,
    maturityDate: this.maturityDate
  };
};

// Method to add penalty
investmentSchema.methods.addPenalty = function(amount, reason, emiNumber = null) {
  this.penaltyHistory.push({
    date: new Date(),
    amount: amount,
    reason: reason,
    emiNumber: emiNumber
  });
  this.totalPenaltyPaid += amount;
};

// Method to record payment
investmentSchema.methods.recordPayment = function(amount, paymentType, emiNumber = null, transactionId = null, remarks = null) {
  this.paymentHistory.push({
    date: new Date(),
    amount: amount,
    paymentType: paymentType,
    emiNumber: emiNumber,
    transactionId: transactionId,
    remarks: remarks
  });
};

// Method to update EMI status
investmentSchema.methods.updateEMIStatus = function(emiNumber, status, paidDate = null, penaltyAmount = 0, remarks = null) {
  const emi = this.emiSchedule.find(e => e.emiNumber === emiNumber);
  if (emi) {
    emi.status = status;
    if (paidDate) emi.paidDate = paidDate;
    if (penaltyAmount > 0) emi.penaltyAmount = penaltyAmount;
    if (remarks) emi.remarks = remarks;
  }
};

module.exports = mongoose.model('Investment', investmentSchema);
