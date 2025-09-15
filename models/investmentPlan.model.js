const mongoose = require('mongoose');

const investmentPlanSchema = new mongoose.Schema({
  // Auto-generated plan ID
  planId: {
    type: String,
    unique: true,
    uppercase: true
  },
  planName: {
    type: String,
    trim: true
  },
  planType: {
    type: String,
    uppercase: true
  },
  description: {
    type: String,
    trim: true
  },
  minimumAmount: {
    type: Number
  },
  maximumAmount: {
    type: Number
  },
  interestRate: {
    type: Number
  },
  tenureMonths: {
    type: Number
  },
  compoundingFrequency: {
    type: String,
    default: 'quarterly'
  },
  // For RD (Recurring Deposit) specific fields
  monthlyInstallment: {
    type: Number
  },
  // EMI Cost Structure for different plan types
  emiCostStructure: {
    // For FD plans - one-time investment
    fd: {
      minimumInvestment: {
        type: Number
      },
      maximumInvestment: {
        type: Number
      },
      investmentIncrements: {
        type: Number,
        default: 100
      }
    },
    // For RD plans - monthly installments
    rd: {
      minimumMonthlyInstallment: {
        type: Number
      },
      maximumMonthlyInstallment: {
        type: Number
      },
      installmentIncrements: {
        type: Number,
        default: 50
      },
      gracePeriodDays: {
        type: Number,
        default: 5
      }
    },
    // For CD plans - certificate-based investment
    cd: {
      minimumCertificateValue: {
        type: Number
      },
      maximumCertificateValue: {
        type: Number
      },
      certificateIncrements: {
        type: Number,
        default: 100
      },
      certificateNumberPrefix: {
        type: String,
        default: 'CD',
        uppercase: true
      }
    }
  },
  // For CD (Certificate of Deposit) specific fields
  certificateNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  // Penalty configuration
  penaltyConfig: {
    latePaymentPenalty: {
      type: Number,
      default: 0
    },
    penaltyPercentage: {
      type: Number,
      default: 0
    },
    gracePeriodDays: {
      type: Number,
      default: 5
    }
  },
  // Plan status and availability
  isActive: {
    type: Boolean,
    default: true
  },
  isAvailableForNewInvestments: {
    type: Boolean,
    default: true
  },
  // Plan features
  features: [{
    feature: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    }
  }],
  // Terms and conditions
  termsAndConditions: [{
    term: {
      type: String,
      required: true,
      trim: true
    }
  }],
  // Created by admin
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  // Plan statistics
  statistics: {
    totalInvestments: {
      type: Number,
      default: 0
    },
    totalAmountInvested: {
      type: Number,
      default: 0
    },
    activeInvestments: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
investmentPlanSchema.index({ planId: 1 });
investmentPlanSchema.index({ planType: 1, isActive: 1 });
investmentPlanSchema.index({ minimumAmount: 1, maximumAmount: 1 });
investmentPlanSchema.index({ interestRate: 1 });
investmentPlanSchema.index({ tenureMonths: 1 });
investmentPlanSchema.index({ createdBy: 1 });

// Virtual for maturity amount calculation
investmentPlanSchema.virtual('maturityAmount').get(function() {
  if (this.planType === 'FD') {
    return this.calculateFDAmount();
  } else if (this.planType === 'RD') {
    return this.calculateRDAmount();
  } else if (this.planType === 'CD') {
    return this.calculateCDAmount();
  }
  return 0;
});

// Virtual to ensure planId is always available
investmentPlanSchema.virtual('displayPlanId').get(function() {
  return this.planId || 'PLAN_GENERATING';
});

// Method to calculate FD maturity amount
investmentPlanSchema.methods.calculateFDAmount = function(principal = this.minimumAmount) {
  const rate = this.interestRate / 100;
  const time = this.tenureMonths / 12;
  
  // Compound interest calculation based on frequency
  let compoundFrequency;
  switch (this.compoundingFrequency) {
    case 'monthly':
      compoundFrequency = 12;
      break;
    case 'quarterly':
      compoundFrequency = 4;
      break;
    case 'half-yearly':
      compoundFrequency = 2;
      break;
    case 'yearly':
      compoundFrequency = 1;
      break;
    default:
      compoundFrequency = 4;
  }
  
  const amount = principal * Math.pow((1 + rate / compoundFrequency), compoundFrequency * time);
  return Math.round(amount);
};

// Method to calculate RD maturity amount
investmentPlanSchema.methods.calculateRDAmount = function(monthlyInstallment = this.monthlyInstallment) {
  if (!monthlyInstallment) return 0;
  
  const rate = this.interestRate / 100;
  const months = this.tenureMonths;
  
  // RD formula: P * [((1 + r)^n - 1) / r] * (1 + r)
  const amount = monthlyInstallment * ((Math.pow(1 + rate/12, months) - 1) / (rate/12)) * (1 + rate/12);
  return Math.round(amount);
};

// Method to calculate CD maturity amount
investmentPlanSchema.methods.calculateCDAmount = function(principal = this.minimumAmount) {
  return this.calculateFDAmount(principal); // CD calculation same as FD
};

// Method to generate planId if not exists
investmentPlanSchema.methods.generatePlanId = async function() {
  if (!this.planId || this.planId.trim() === '') {
    const count = await this.constructor.countDocuments();
    const timestamp = new Date().getFullYear().toString().slice(-2);
    const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
    const sequence = (count + 1).toString().padStart(3, '0');
    this.planId = `PLAN${timestamp}${month}${sequence}`;
  }
  return this.planId;
};

// Method to get plan summary
investmentPlanSchema.methods.getPlanSummary = function() {
  return {
    planId: this.planId,
    planName: this.planName,
    planType: this.planType,
    interestRate: this.interestRate,
    tenureMonths: this.tenureMonths,
    minimumAmount: this.minimumAmount,
    maximumAmount: this.maximumAmount,
    maturityAmount: this.maturityAmount,
    isActive: this.isActive
  };
};

// Method to get EMI cost structure for the plan
investmentPlanSchema.methods.getEMICostStructure = function() {
  const planType = this.planType.toLowerCase();
  const costStructure = this.emiCostStructure[planType];
  
  if (!costStructure) {
    return null;
  }

  return {
    planType: this.planType,
    costStructure: costStructure,
    interestRate: this.interestRate,
    tenureMonths: this.tenureMonths,
    compoundingFrequency: this.compoundingFrequency
  };
};

// Method to calculate EMI cost for different amounts
investmentPlanSchema.methods.calculateEMICost = function(amount, planType = null) {
  const type = planType || this.planType;
  
  if (type === 'FD') {
    return this.calculateFDEMICost(amount);
  } else if (type === 'RD') {
    return this.calculateRDEMICost(amount);
  } else if (type === 'CD') {
    return this.calculateCDEMICost(amount);
  }
  
  return null;
};

// Method to calculate FD EMI cost (one-time investment)
investmentPlanSchema.methods.calculateFDEMICost = function(principalAmount) {
  const maturityAmount = this.calculateFDAmount(principalAmount);
  const totalInterest = maturityAmount - principalAmount;
  const monthlyInterest = totalInterest / this.tenureMonths;
  
  return {
    planType: 'FD',
    principalAmount: principalAmount,
    maturityAmount: maturityAmount,
    totalInterest: totalInterest,
    monthlyInterest: monthlyInterest,
    emiCost: {
      oneTimeInvestment: principalAmount,
      monthlyInterestEarned: monthlyInterest,
      totalReturn: totalInterest
    },
    costBreakdown: {
      investment: principalAmount,
      interest: totalInterest,
      maturity: maturityAmount
    }
  };
};

// Method to calculate RD EMI cost (monthly installments)
investmentPlanSchema.methods.calculateRDEMICost = function(monthlyInstallment) {
  const maturityAmount = this.calculateRDAmount(monthlyInstallment);
  const totalInvestment = monthlyInstallment * this.tenureMonths;
  const totalInterest = maturityAmount - totalInvestment;
  const monthlyInterest = totalInterest / this.tenureMonths;
  
  return {
    planType: 'RD',
    monthlyInstallment: monthlyInstallment,
    totalInvestment: totalInvestment,
    maturityAmount: maturityAmount,
    totalInterest: totalInterest,
    monthlyInterest: monthlyInterest,
    emiCost: {
      monthlyInstallment: monthlyInstallment,
      totalInstallments: this.tenureMonths,
      totalInvestment: totalInvestment,
      monthlyInterestEarned: monthlyInterest,
      totalReturn: totalInterest
    },
    costBreakdown: {
      monthlyEMI: monthlyInstallment,
      totalEMIs: this.tenureMonths,
      totalPaid: totalInvestment,
      interest: totalInterest,
      maturity: maturityAmount
    }
  };
};

// Method to calculate CD EMI cost (certificate-based)
investmentPlanSchema.methods.calculateCDEMICost = function(certificateValue) {
  const maturityAmount = this.calculateCDAmount(certificateValue);
  const totalInterest = maturityAmount - certificateValue;
  const monthlyInterest = totalInterest / this.tenureMonths;
  
  return {
    planType: 'CD',
    certificateValue: certificateValue,
    maturityAmount: maturityAmount,
    totalInterest: totalInterest,
    monthlyInterest: monthlyInterest,
    emiCost: {
      certificateValue: certificateValue,
      monthlyInterestEarned: monthlyInterest,
      totalReturn: totalInterest
    },
    costBreakdown: {
      certificate: certificateValue,
      interest: totalInterest,
      maturity: maturityAmount
    }
  };
};

// Method to get sample EMI costs for different amounts
investmentPlanSchema.methods.getSampleEMICosts = function() {
  const planType = this.planType;
  const samples = [];
  
  if (planType === 'FD') {
    const amounts = [
      this.emiCostStructure.fd.minimumInvestment,
      Math.floor((this.emiCostStructure.fd.minimumInvestment + this.emiCostStructure.fd.maximumInvestment) / 2),
      this.emiCostStructure.fd.maximumInvestment
    ];
    
    amounts.forEach(amount => {
      samples.push(this.calculateFDEMICost(amount));
    });
    
  } else if (planType === 'RD') {
    const installments = [
      this.emiCostStructure.rd.minimumMonthlyInstallment,
      Math.floor((this.emiCostStructure.rd.minimumMonthlyInstallment + this.emiCostStructure.rd.maximumMonthlyInstallment) / 2),
      this.emiCostStructure.rd.maximumMonthlyInstallment
    ];
    
    installments.forEach(installment => {
      samples.push(this.calculateRDEMICost(installment));
    });
    
  } else if (planType === 'CD') {
    const values = [
      this.emiCostStructure.cd.minimumCertificateValue,
      Math.floor((this.emiCostStructure.cd.minimumCertificateValue + this.emiCostStructure.cd.maximumCertificateValue) / 2),
      this.emiCostStructure.cd.maximumCertificateValue
    ];
    
    values.forEach(value => {
      samples.push(this.calculateCDEMICost(value));
    });
  }
  
  return samples;
};

// Pre-save middleware to generate planId and certificate number for CD
investmentPlanSchema.pre('save', async function(next) {
  try {
    // Always generate planId if not provided or empty
    if (!this.planId || this.planId.trim() === '') {
      // Get count of existing plans to generate sequential number
      const count = await this.constructor.countDocuments();
      const timestamp = new Date().getFullYear().toString().slice(-2);
      const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
      const sequence = (count + 1).toString().padStart(3, '0');
      this.planId = `PLAN${timestamp}${month}${sequence}`;
    }
    
    // Generate certificate number for CD plans
    if (this.planType === 'CD' && !this.certificateNumber) {
      const timestamp = Date.now().toString().slice(-6);
      const random = Math.random().toString(36).substring(2, 5).toUpperCase();
      this.certificateNumber = `CD${timestamp}${random}`;
    }
    
    next();
  } catch (error) {
    console.error('Error in pre-save middleware:', error);
    next(error);
  }
});

module.exports = mongoose.model('InvestmentPlan', investmentPlanSchema);
