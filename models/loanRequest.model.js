const mongoose = require('mongoose');

const loanRequestSchema = new mongoose.Schema({
  // Loan request identification
  requestId: {
    type: String,
    required: false, // Will be auto-generated in pre-save middleware
    unique: true,
    uppercase: true
  },
  
  // References
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SocietyMember',
    required: true
  },
  
  // Loan details
  loanAmount: {
    type: Number,
    required: [true, 'Loan amount is required'],
    min: [1000, 'Loan amount must be at least ₹1000'],
    max: [1000000, 'Loan amount cannot exceed ₹10,00,000']
  },
  
  loanPurpose: {
    type: String,
    required: [true, 'Loan purpose is required'],
    enum: ['Personal', 'Business', 'Education', 'Medical', 'Home', 'Vehicle', 'Other'],
    default: 'Personal'
  },
  
  loanDescription: {
    type: String,
    required: [true, 'Loan description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  
  // EMI configuration
  emiOptions: {
    tenureMonths: {
      type: Number,
      required: true,
      min: [3, 'Minimum tenure is 3 months'],
      max: [60, 'Maximum tenure is 60 months']
    },
    emiAmount: {
      type: Number,
      required: true,
      min: [100, 'Minimum EMI amount is ₹100']
    },
    interestRate: {
      type: Number,
      required: true,
      min: [0, 'Interest rate cannot be negative'],
      max: [30, 'Interest rate cannot exceed 30%']
    }
  },
  
  // Request status
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'disbursed', 'completed'],
    default: 'pending'
  },
  
  // Approval details
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  
  approvedAt: {
    type: Date
  },
  
  approvalNotes: {
    type: String,
    maxlength: [500, 'Approval notes cannot exceed 500 characters']
  },
  
  rejectionReason: {
    type: String,
    maxlength: [500, 'Rejection reason cannot exceed 500 characters']
  },
  
  // Disbursement details
  disbursedAmount: {
    type: Number
  },
  
  disbursedAt: {
    type: Date
  },
  
  disbursementMethod: {
    type: String,
    enum: ['bank_transfer', 'cash', 'cheque']
  },
  
  disbursementReference: {
    type: String
  },
  
  // Documents
  documents: [{
    documentType: {
      type: String,
      enum: ['identity_proof', 'address_proof', 'income_proof', 'bank_statement', 'other']
    },
    documentName: String,
    documentUrl: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // EMI records (will be populated after approval)
  emiRecords: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EMIRecord'
  }],
  
  // Payment records
  paymentRecords: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  }],
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  },
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SocietyMember',
    required: true
  }
}, {
  timestamps: true
});

// Indexes
loanRequestSchema.index({ memberId: 1, status: 1 });
loanRequestSchema.index({ status: 1, createdAt: -1 });
loanRequestSchema.index({ requestId: 1 });

// Pre-save middleware to generate request ID
loanRequestSchema.pre('save', async function(next) {
  if (!this.requestId) {
    try {
      const count = await this.constructor.countDocuments();
      const timestamp = new Date().getFullYear().toString().slice(-2);
      const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
      const sequence = (count + 1).toString().padStart(3, '0');
      this.requestId = `LOAN${timestamp}${month}${sequence}`;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Method to approve loan request
loanRequestSchema.methods.approve = function(adminId, notes = '') {
  this.status = 'approved';
  this.approvedBy = adminId;
  this.approvedAt = new Date();
  this.approvalNotes = notes;
  this.updatedAt = new Date();
};

// Method to reject loan request
loanRequestSchema.methods.reject = function(adminId, reason = '') {
  this.status = 'rejected';
  this.approvedBy = adminId;
  this.approvedAt = new Date();
  this.rejectionReason = reason;
  this.updatedAt = new Date();
};

// Method to disburse loan
loanRequestSchema.methods.disburse = function(amount, method, reference = '') {
  this.status = 'disbursed';
  this.disbursedAmount = amount;
  this.disbursedAt = new Date();
  this.disbursementMethod = method;
  this.disbursementReference = reference;
  this.updatedAt = new Date();
};

// Static method to get loan requests by member
loanRequestSchema.statics.getLoanRequestsByMember = function(memberId, options = {}) {
  const query = { memberId: memberId };
  
  if (options.status) query.status = options.status;
  if (options.startDate && options.endDate) {
    query.createdAt = {
      $gte: new Date(options.startDate),
      $lte: new Date(options.endDate)
    };
  }
  
  return this.find(query)
    .populate('approvedBy', 'firstName lastName email')
    .populate('memberId', 'firstName lastName memberId email phoneNumber')
    .sort({ createdAt: -1 });
};

// Static method to get all loan requests for admin
loanRequestSchema.statics.getAllLoanRequests = function(options = {}) {
  const query = {};
  
  if (options.status) query.status = options.status;
  if (options.memberId) query.memberId = options.memberId;
  if (options.startDate && options.endDate) {
    query.createdAt = {
      $gte: new Date(options.startDate),
      $lte: new Date(options.endDate)
    };
  }
  
  return this.find(query)
    .populate('approvedBy', 'firstName lastName email')
    .populate('memberId', 'firstName lastName memberId email phoneNumber')
    .sort({ createdAt: -1 });
};

// Static method to get loan statistics
loanRequestSchema.statics.getLoanStatistics = function(options = {}) {
  const matchStage = {};
  
  if (options.startDate && options.endDate) {
    matchStage.createdAt = {
      $gte: new Date(options.startDate),
      $lte: new Date(options.endDate)
    };
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$loanAmount' },
        averageAmount: { $avg: '$loanAmount' }
      }
    },
    {
      $group: {
        _id: null,
        statusBreakdown: {
          $push: {
            status: '$_id',
            count: '$count',
            totalAmount: '$totalAmount',
            averageAmount: '$averageAmount'
          }
        },
        totalRequests: { $sum: '$count' },
        totalLoanAmount: { $sum: '$totalAmount' }
      }
    }
  ]);
};

module.exports = mongoose.model('LoanRequest', loanRequestSchema);
