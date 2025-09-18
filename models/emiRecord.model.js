const mongoose = require('mongoose');

const emiRecordSchema = new mongoose.Schema({
  // EMI identification
  emiId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  
  // References
  investmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Investment',
    required: false // Not required for loan EMIs
  },
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SocietyMember',
    required: true
  },
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InvestmentPlan',
    required: false // Not required for loan EMIs
  },
  loanRequestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LoanRequest',
    required: false // Not required for investment EMIs
  },
  
  // EMI details
  emiNumber: {
    type: Number,
    required: true,
    min: 1
  },
  emiAmount: {
    type: Number,
    required: [true, 'EMI amount is required'],
    min: [1, 'EMI amount must be greater than 0']
  },
  
  // EMI dates
  dueDate: {
    type: Date,
    required: true
  },
  gracePeriodEndDate: {
    type: Date,
    required: true
  },
  
  // Payment status
  status: {
    type: String,
    enum: ['pending', 'paid', 'overdue', 'penalty_applied', 'waived', 'cancelled'],
    default: 'pending'
  },
  
  // Payment details
  paidDate: Date,
  paidAmount: {
    type: Number,
    default: 0
  },
  penaltyAmount: {
    type: Number,
    default: 0
  },
  totalPaidAmount: {
    type: Number,
    default: 0
  },
  
  // Payment references
  paymentIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  }],
  
  // Penalty details
  penaltyDetails: {
    isPenaltyApplied: {
      type: Boolean,
      default: false
    },
    penaltyRate: {
      type: Number,
      default: 0
    },
    penaltyCalculationDate: Date,
    penaltyReason: String,
    penaltyWaived: {
      type: Boolean,
      default: false
    },
    penaltyWaivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    },
    penaltyWaivedDate: Date,
    penaltyWaivedReason: String
  },
  
  // EMI calculation details
  calculationDetails: {
    principalComponent: {
      type: Number,
      required: true
    },
    interestComponent: {
      type: Number,
      required: true
    },
    remainingPrincipal: {
      type: Number,
      required: true
    },
    cumulativeInterest: {
      type: Number,
      required: true
    }
  },
  
  // Reminders and notifications
  reminders: [{
    reminderType: {
      type: String,
      enum: ['due_date', 'overdue', 'penalty_applied', 'grace_period'],
      required: true
    },
    sentDate: {
      type: Date,
      required: true
    },
    sentTo: {
      type: String,
      required: true
    },
    reminderMethod: {
      type: String,
      enum: ['email', 'sms', 'push_notification', 'whatsapp'],
      required: true
    },
    status: {
      type: String,
      enum: ['sent', 'delivered', 'failed', 'read'],
      default: 'sent'
    }
  }],
  
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
  
  // Admin management
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true
});

// Custom validation to ensure either investmentId or loanRequestId is provided
emiRecordSchema.pre('validate', function(next) {
  if (!this.investmentId && !this.loanRequestId) {
    return next(new Error('Either investmentId or loanRequestId must be provided'));
  }
  if (this.investmentId && this.loanRequestId) {
    return next(new Error('Cannot have both investmentId and loanRequestId'));
  }
  next();
});

// Indexes for better query performance
emiRecordSchema.index({ emiId: 1 });
emiRecordSchema.index({ investmentId: 1 });
emiRecordSchema.index({ loanRequestId: 1 });
emiRecordSchema.index({ memberId: 1 });
emiRecordSchema.index({ planId: 1 });
emiRecordSchema.index({ emiNumber: 1 });
emiRecordSchema.index({ status: 1 });
emiRecordSchema.index({ dueDate: 1 });
emiRecordSchema.index({ gracePeriodEndDate: 1 });
emiRecordSchema.index({ paidDate: 1 });

// Compound indexes
emiRecordSchema.index({ investmentId: 1, emiNumber: 1 });
emiRecordSchema.index({ memberId: 1, status: 1 });
emiRecordSchema.index({ dueDate: 1, status: 1 });

// Pre-save middleware to generate EMI ID
emiRecordSchema.pre('save', async function(next) {
  if (!this.emiId) {
    const count = await this.constructor.countDocuments();
    const timestamp = new Date().getFullYear().toString().slice(-2);
    const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
    const sequence = (count + 1).toString().padStart(3, '0');
    this.emiId = `EMI${timestamp}${month}${sequence}`;
  }
  next();
});

// Method to mark EMI as paid
emiRecordSchema.methods.markAsPaid = function(paidAmount, paymentId, paidDate = null) {
  this.status = 'paid';
  this.paidAmount = paidAmount;
  this.totalPaidAmount = paidAmount + this.penaltyAmount;
  this.paidDate = paidDate || new Date();
  
  if (paymentId) {
    this.paymentIds.push(paymentId);
  }
};

// Method to apply penalty
emiRecordSchema.methods.applyPenalty = function(penaltyAmount, penaltyRate, reason, appliedBy) {
  this.penaltyAmount = penaltyAmount;
  this.totalPaidAmount = this.paidAmount + penaltyAmount;
  this.status = 'penalty_applied';
  
  this.penaltyDetails = {
    isPenaltyApplied: true,
    penaltyRate: penaltyRate,
    penaltyCalculationDate: new Date(),
    penaltyReason: reason
  };
  
  this.lastModifiedBy = appliedBy;
};

// Method to waive penalty
emiRecordSchema.methods.waivePenalty = function(waivedBy, reason) {
  this.penaltyDetails.penaltyWaived = true;
  this.penaltyDetails.penaltyWaivedBy = waivedBy;
  this.penaltyDetails.penaltyWaivedDate = new Date();
  this.penaltyDetails.penaltyWaivedReason = reason;
  
  this.penaltyAmount = 0;
  this.totalPaidAmount = this.paidAmount;
  this.status = this.paidAmount > 0 ? 'paid' : 'pending';
  
  this.lastModifiedBy = waivedBy;
};

// Method to add reminder
emiRecordSchema.methods.addReminder = function(reminderData) {
  this.reminders.push({
    ...reminderData,
    sentDate: new Date()
  });
};

// Method to add note
emiRecordSchema.methods.addNote = function(note, addedBy) {
  this.notes.push({
    note: note,
    addedBy: addedBy,
    addedDate: new Date()
  });
};

// Method to check if EMI is overdue
emiRecordSchema.methods.isOverdue = function() {
  const today = new Date();
  return this.status === 'pending' && this.dueDate < today;
};

// Method to check if EMI is in grace period
emiRecordSchema.methods.isInGracePeriod = function() {
  const today = new Date();
  return this.status === 'pending' && 
         this.dueDate < today && 
         this.gracePeriodEndDate >= today;
};

// Method to get EMI summary
emiRecordSchema.methods.getEMISummary = function() {
  return {
    emiId: this.emiId,
    emiNumber: this.emiNumber,
    emiAmount: this.emiAmount,
    dueDate: this.dueDate,
    status: this.status,
    paidAmount: this.paidAmount,
    penaltyAmount: this.penaltyAmount,
    totalPaidAmount: this.totalPaidAmount,
    paidDate: this.paidDate,
    isOverdue: this.isOverdue(),
    isInGracePeriod: this.isInGracePeriod(),
    remindersCount: this.reminders.length,
    paymentIds: this.paymentIds
  };
};

// Static method to get EMIs by member
emiRecordSchema.statics.getEMIsByMember = function(memberId, options = {}) {
  const query = { memberId: memberId };
  
  if (options.status) query.status = options.status;
  if (options.investmentId) query.investmentId = options.investmentId;
  if (options.overdue) {
    query.dueDate = { $lt: new Date() };
    query.status = 'pending';
  }
  
  return this.find(query)
    .populate('investmentId', 'investmentId principalAmount')
    .populate('planId', 'planName planType interestRate')
    .populate('memberId', 'firstName lastName memberId email')
    .populate('paymentIds', 'paymentId amount status paymentDate')
    .sort({ emiNumber: 1 });
};

// Static method to get pending EMIs by month
emiRecordSchema.statics.getPendingEMIsByMonth = function(options = {}) {
  const query = { status: 'pending' };
  
  if (options.memberId) query.memberId = options.memberId;
  if (options.investmentId) query.investmentId = options.investmentId;
  if (options.month && options.year) {
    const startDate = new Date(options.year, options.month - 1, 1);
    const endDate = new Date(options.year, options.month, 0, 23, 59, 59);
    query.dueDate = { $gte: startDate, $lte: endDate };
  }
  
  return this.find(query)
    .populate('investmentId', 'investmentId principalAmount')
    .populate('planId', 'planName planType interestRate')
    .populate('memberId', 'firstName lastName memberId email phoneNumber')
    .populate('paymentIds', 'paymentId amount status paymentDate')
    .sort({ dueDate: 1 });
};

// Static method to get all pending EMIs grouped by month
emiRecordSchema.statics.getPendingEMIsGroupedByMonth = function(options = {}) {
  const matchStage = { status: 'pending' };
  
  if (options.memberId) matchStage.memberId = options.memberId;
  if (options.investmentId) matchStage.investmentId = options.investmentId;
  
  return this.aggregate([
    { $match: matchStage },
    {
      $addFields: {
        dueMonth: { $month: '$dueDate' },
        dueYear: { $year: '$dueDate' }
      }
    },
    {
      $group: {
        _id: { month: '$dueMonth', year: '$dueYear' },
        emis: { $push: '$$ROOT' },
        totalAmount: { $sum: '$emiAmount' },
        totalPenalty: { $sum: '$penaltyAmount' },
        count: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'investments',
        localField: 'emis.investmentId',
        foreignField: '_id',
        as: 'investmentDetails'
      }
    },
    {
      $lookup: {
        from: 'investmentplans',
        localField: 'emis.planId',
        foreignField: '_id',
        as: 'planDetails'
      }
    },
    {
      $lookup: {
        from: 'societymembers',
        localField: 'emis.memberId',
        foreignField: '_id',
        as: 'memberDetails'
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 }
    }
  ]);
};

// Static method to get EMIs by investment
emiRecordSchema.statics.getEMIsByInvestment = function(investmentId) {
  return this.find({ investmentId: investmentId })
    .populate('memberId', 'firstName lastName memberId email')
    .populate('paymentIds', 'paymentId amount status paymentDate')
    .sort({ emiNumber: 1 });
};

// Static method to get overdue EMIs
emiRecordSchema.statics.getOverdueEMIs = function(options = {}) {
  const query = {
    status: 'pending',
    dueDate: { $lt: new Date() }
  };
  
  if (options.memberId) query.memberId = options.memberId;
  if (options.investmentId) query.investmentId = options.investmentId;
  if (options.gracePeriodOnly) {
    query.gracePeriodEndDate = { $gte: new Date() };
  }
  
  return this.find(query)
    .populate('investmentId', 'investmentId principalAmount')
    .populate('planId', 'planName planType interestRate')
    .populate('memberId', 'firstName lastName memberId email phoneNumber')
    .sort({ dueDate: 1 });
};

// Static method to get EMI statistics
emiRecordSchema.statics.getEMIStatistics = function(filters = {}) {
  const matchStage = {};
  
  if (filters.memberId) matchStage.memberId = filters.memberId;
  if (filters.investmentId) matchStage.investmentId = filters.investmentId;
  if (filters.startDate && filters.endDate) {
    matchStage.dueDate = {
      $gte: new Date(filters.startDate),
      $lte: new Date(filters.endDate)
    };
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalEMIs: { $sum: 1 },
        totalEMIAmount: { $sum: '$emiAmount' },
        paidEMIs: {
          $sum: { $cond: [{ $eq: ['$status', 'paid'] }, 1, 0] }
        },
        paidAmount: {
          $sum: { $cond: [{ $eq: ['$status', 'paid'] }, '$paidAmount', 0] }
        },
        pendingEMIs: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        pendingAmount: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, '$emiAmount', 0] }
        },
        overdueEMIs: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$status', 'pending'] },
                  { $lt: ['$dueDate', new Date()] }
                ]
              },
              1,
              0
            ]
          }
        },
        overdueAmount: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$status', 'pending'] },
                  { $lt: ['$dueDate', new Date()] }
                ]
              },
              '$emiAmount',
              0
            ]
          }
        },
        totalPenaltyAmount: { $sum: '$penaltyAmount' }
      }
    }
  ]);
};

module.exports = mongoose.model('EMIRecord', emiRecordSchema);
