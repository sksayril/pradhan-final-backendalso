const mongoose = require('mongoose');

const cdInvestmentSchema = new mongoose.Schema({
  // User reference
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'userType'
  },
  userType: {
    type: String,
    required: true,
    enum: ['Student', 'SocietyMember']
  },
  userEmail: {
    type: String,
    required: true,
    lowercase: true
  },
  userStudentId: {
    type: String,
    required: function() {
      return this.userType === 'Student';
    }
  },
  userMemberId: {
    type: String,
    required: function() {
      return this.userType === 'SocietyMember';
    }
  },
  
  // CD Investment details
  cdId: {
    type: String,
    unique: true,
    uppercase: true
  },
  investmentAmount: {
    type: Number,
    required: [true, 'Investment amount is required'],
    min: [1000, 'Minimum investment amount is ₹1,000'],
    max: [1000000, 'Maximum investment amount is ₹10,00,000']
  },
  tenureMonths: {
    type: Number,
    required: [true, 'Tenure is required'],
    enum: [6, 12, 18, 24, 36, 48, 60], // CD tenure options in months
    default: 12
  },
  interestRate: {
    type: Number,
    required: true,
    min: [0, 'Interest rate cannot be negative'],
    max: [20, 'Interest rate cannot exceed 20%'],
    default: 7.5 // Default CD interest rate
  },
  
  // Maturity calculations
  maturityAmount: {
    type: Number,
    required: true
  },
  totalInterest: {
    type: Number,
    required: true
  },
  maturityDate: {
    type: Date
  },
  
  // Status and approval
  status: {
    type: String,
    enum: ['pending', 'approved', 'active', 'matured', 'cancelled', 'rejected'],
    default: 'pending'
  },
  requestDate: {
    type: Date,
    default: Date.now
  },
  approvalDate: {
    type: Date
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  rejectionReason: {
    type: String,
    maxlength: [500, 'Rejection reason cannot exceed 500 characters']
  },
  
  // Payment details
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentDate: {
    type: Date
  },
  paymentMethod: {
    type: String,
    enum: ['upi', 'net_banking', 'credit_card', 'debit_card', 'wallet', 'cash']
  },
  paymentReference: {
    type: String
  },
  
  // CD specific details
  cdType: {
    type: String,
    enum: ['fixed', 'flexible'],
    default: 'fixed'
  },
  isRenewable: {
    type: Boolean,
    default: true
  },
  autoRenewal: {
    type: Boolean,
    default: false
  },
  
  // Additional information
  purpose: {
    type: String,
    maxlength: [200, 'Purpose cannot exceed 200 characters']
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  
  // Admin notes
  adminNotes: {
    type: String,
    maxlength: [500, 'Admin notes cannot exceed 500 characters']
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
cdInvestmentSchema.index({ userId: 1, userType: 1 });
cdInvestmentSchema.index({ cdId: 1 });
cdInvestmentSchema.index({ status: 1 });
cdInvestmentSchema.index({ userEmail: 1 });
cdInvestmentSchema.index({ userStudentId: 1 });
cdInvestmentSchema.index({ userMemberId: 1 });
cdInvestmentSchema.index({ requestDate: 1 });
cdInvestmentSchema.index({ maturityDate: 1 });

// Auto-generate CD ID before saving
cdInvestmentSchema.pre('save', async function(next) {
  if (this.isNew && !this.cdId) {
    try {
      let cdId;
      let isUnique = false;
      
      while (!isUnique) {
        // Generate CD ID: CD + 8 random digits
        const randomDigits = Math.floor(10000000 + Math.random() * 90000000);
        cdId = `CD${randomDigits}`;
        
        // Check if this ID already exists
        const existingCD = await this.constructor.findOne({ cdId });
        if (!existingCD) {
          isUnique = true;
        }
      }
      
      this.cdId = cdId;
    } catch (error) {
      return next(error);
    }
  }
  
  // Calculate maturity amount and interest
  if (this.isModified('investmentAmount') || this.isModified('tenureMonths') || this.isModified('interestRate')) {
    this.calculateMaturity();
  }
  
  // Set maturity date for pending requests (will be updated when approved)
  if (this.isNew && !this.maturityDate) {
    // For pending requests, set a tentative maturity date
    this.maturityDate = new Date();
    this.maturityDate.setMonth(this.maturityDate.getMonth() + this.tenureMonths);
  }
  
  // Update maturity date when approved
  if (this.isModified('approvalDate') && this.approvalDate) {
    this.maturityDate = new Date(this.approvalDate);
    this.maturityDate.setMonth(this.maturityDate.getMonth() + this.tenureMonths);
  }
  
  next();
});

// Method to calculate maturity amount and interest
cdInvestmentSchema.methods.calculateMaturity = function() {
  const principal = this.investmentAmount;
  const rate = this.interestRate / 100; // Convert percentage to decimal
  const time = this.tenureMonths / 12; // Convert months to years
  
  // Simple interest calculation for CD
  this.totalInterest = Math.round(principal * rate * time);
  this.maturityAmount = principal + this.totalInterest;
};

// Method to check if CD is matured
cdInvestmentSchema.methods.isMatured = function() {
  return this.maturityDate && new Date() >= this.maturityDate;
};

// Method to get remaining tenure in days
cdInvestmentSchema.methods.getRemainingTenure = function() {
  if (!this.maturityDate) return null;
  const now = new Date();
  const diffTime = this.maturityDate - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Virtual for user display name
cdInvestmentSchema.virtual('userDisplayName').get(function() {
  if (this.userType === 'Student') {
    return `Student: ${this.userStudentId}`;
  } else {
    return `Member: ${this.userMemberId}`;
  }
});

// Ensure virtual fields are serialized
cdInvestmentSchema.set('toJSON', { virtuals: true });
cdInvestmentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('CDInvestment', cdInvestmentSchema);
