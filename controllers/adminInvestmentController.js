const InvestmentPlan = require('../models/investmentPlan.model');
const Investment = require('../models/investment.model');
const SocietyMember = require('../models/societyMember.model');

// Create new investment plan
const createInvestmentPlan = async (req, res) => {
  try {
    const {
      planName,
      planType,
      description,
      minimumAmount,
      maximumAmount,
      interestRate,
      tenureMonths,
      compoundingFrequency,
      monthlyInstallment,
      penaltyConfig,
      features,
      termsAndConditions,
      emiCostStructure
    } = req.body;

    const adminId = req.user._id;

    // No validation - accept any data as requested

    // Set default EMI cost structure if not provided
    if (!emiCostStructure) {
      if (planType === 'FD') {
        emiCostStructure = {
          fd: {
            minimumInvestment: minimumAmount,
            maximumInvestment: maximumAmount,
            investmentIncrements: 100
          }
        };
      } else if (planType === 'RD') {
        emiCostStructure = {
          rd: {
            minimumMonthlyInstallment: 50,
            maximumMonthlyInstallment: 50000,
            installmentIncrements: 50,
            gracePeriodDays: 5
          }
        };
      } else if (planType === 'CD') {
        emiCostStructure = {
          cd: {
            minimumCertificateValue: minimumAmount,
            maximumCertificateValue: maximumAmount,
            certificateIncrements: 100,
            certificateNumberPrefix: 'CD'
          }
        };
      }
    }

    // Create investment plan
    const investmentPlan = new InvestmentPlan({
      planName,
      planType,
      description,
      minimumAmount,
      maximumAmount,
      interestRate,
      tenureMonths,
      compoundingFrequency,
      monthlyInstallment,
      penaltyConfig,
      features,
      termsAndConditions,
      emiCostStructure,
      createdBy: adminId
    });

    // Ensure planId is generated before saving
    await investmentPlan.generatePlanId();
    await investmentPlan.save();

    // Get EMI cost structure and sample calculations
    const planEMICostStructure = investmentPlan.getEMICostStructure();
    const sampleEMICosts = investmentPlan.getSampleEMICosts();

    res.status(201).json({
      success: true,
      message: 'Investment plan created successfully',
      data: {
        plan: {
          ...investmentPlan.toObject(),
          emiCostStructure: planEMICostStructure,
          sampleEMICosts
        }
      }
    });

  } catch (error) {
    console.error('Create investment plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while creating investment plan',
      error: error.message
    });
  }
};

// Get all investment plans
const getAllInvestmentPlans = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      planType,
      isActive,
      search
    } = req.query;

    // Build filter
    const filter = {};
    if (planType) filter.planType = planType.toUpperCase();
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (search) {
      filter.$or = [
        { planName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get plans with pagination
    const plans = await InvestmentPlan.find(filter)
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalPlans = await InvestmentPlan.countDocuments(filter);

    res.json({
      success: true,
      message: 'Investment plans retrieved successfully',
      data: {
        plans,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalPlans / parseInt(limit)),
          totalPlans,
          hasNextPage: skip + plans.length < totalPlans,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Get all investment plans error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching investment plans'
    });
  }
};

// Get investment plan by ID
const getInvestmentPlanById = async (req, res) => {
  try {
    const { planId } = req.params;

    const plan = await InvestmentPlan.findById(planId)
      .populate('createdBy', 'firstName lastName email');

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Investment plan not found'
      });
    }

    res.json({
      success: true,
      message: 'Investment plan retrieved successfully',
      data: {
        plan
      }
    });

  } catch (error) {
    console.error('Get investment plan by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching investment plan'
    });
  }
};

// Update investment plan
const updateInvestmentPlan = async (req, res) => {
  try {
    const { planId } = req.params;
    const updateData = req.body;
    const adminId = req.user._id;

    // Remove fields that shouldn't be updated
    delete updateData.createdBy;
    delete updateData.statistics;

    const plan = await InvestmentPlan.findByIdAndUpdate(
      planId,
      { ...updateData, lastModifiedBy: adminId },
      { new: true, runValidators: true }
    ).populate('createdBy', 'firstName lastName email');

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Investment plan not found'
      });
    }

    res.json({
      success: true,
      message: 'Investment plan updated successfully',
      data: {
        plan
      }
    });

  } catch (error) {
    console.error('Update investment plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while updating investment plan'
    });
  }
};

// Delete investment plan
const deleteInvestmentPlan = async (req, res) => {
  try {
    const { planId } = req.params;

    // Check if plan has active investments
    const activeInvestments = await Investment.countDocuments({
      planId: planId,
      status: 'active'
    });

    if (activeInvestments > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete plan with active investments. Please deactivate instead.'
      });
    }

    const plan = await InvestmentPlan.findByIdAndDelete(planId);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Investment plan not found'
      });
    }

    res.json({
      success: true,
      message: 'Investment plan deleted successfully'
    });

  } catch (error) {
    console.error('Delete investment plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while deleting investment plan'
    });
  }
};

// Toggle plan status
const togglePlanStatus = async (req, res) => {
  try {
    const { planId } = req.params;
    const { isActive } = req.body;

    const plan = await InvestmentPlan.findByIdAndUpdate(
      planId,
      { isActive },
      { new: true }
    ).populate('createdBy', 'firstName lastName email');

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Investment plan not found'
      });
    }

    res.json({
      success: true,
      message: `Investment plan ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        plan
      }
    });

  } catch (error) {
    console.error('Toggle plan status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while updating plan status'
    });
  }
};

// Get plan statistics
const getPlanStatistics = async (req, res) => {
  try {
    const { planId } = req.params;

    const plan = await InvestmentPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Investment plan not found'
      });
    }

    // Get investment statistics
    const totalInvestments = await Investment.countDocuments({ planId });
    const activeInvestments = await Investment.countDocuments({ 
      planId, 
      status: 'active' 
    });
    const completedInvestments = await Investment.countDocuments({ 
      planId, 
      status: 'completed' 
    });

    // Calculate total amount invested
    const investments = await Investment.find({ planId });
    const totalAmountInvested = investments.reduce((sum, inv) => sum + inv.principalAmount, 0);

    // Calculate total interest earned
    const totalInterestEarned = investments.reduce((sum, inv) => sum + inv.totalInterestEarned, 0);

    // Get EMI statistics for RD plans
    let emiStatistics = null;
    if (plan.planType === 'RD') {
      const rdInvestments = await Investment.find({ planId, planType: 'RD' });
      let totalEMIs = 0;
      let paidEMIs = 0;
      let overdueEMIs = 0;

      rdInvestments.forEach(inv => {
        totalEMIs += inv.emiSchedule.length;
        paidEMIs += inv.emiSchedule.filter(emi => emi.status === 'paid').length;
        overdueEMIs += inv.emiSchedule.filter(emi => emi.status === 'overdue').length;
      });

      emiStatistics = {
        totalEMIs,
        paidEMIs,
        pendingEMIs: totalEMIs - paidEMIs,
        overdueEMIs
      };
    }

    res.json({
      success: true,
      message: 'Plan statistics retrieved successfully',
      data: {
        plan: {
          planName: plan.planName,
          planType: plan.planType,
          interestRate: plan.interestRate
        },
        statistics: {
          totalInvestments,
          activeInvestments,
          completedInvestments,
          totalAmountInvested,
          totalInterestEarned,
          emiStatistics
        }
      }
    });

  } catch (error) {
    console.error('Get plan statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching plan statistics'
    });
  }
};

// Create investment for society member
const createInvestment = async (req, res) => {
  try {
    const {
      planId,
      memberId,
      principalAmount,
      monthlyInstallment
    } = req.body;

    const adminId = req.user._id;

    // Validate plan exists and is active
    const plan = await InvestmentPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Investment plan not found'
      });
    }

    if (!plan.isActive || !plan.isAvailableForNewInvestments) {
      return res.status(400).json({
        success: false,
        message: 'Investment plan is not available for new investments'
      });
    }

    // Validate member exists
    const member = await SocietyMember.findById(memberId);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Society member not found'
      });
    }

    // Validate amount
    if (principalAmount < plan.minimumAmount || principalAmount > plan.maximumAmount) {
      return res.status(400).json({
        success: false,
        message: `Principal amount must be between ₹${plan.minimumAmount} and ₹${plan.maximumAmount}`
      });
    }

    // Calculate maturity date
    const investmentDate = new Date();
    const maturityDate = new Date(investmentDate);
    maturityDate.setMonth(maturityDate.getMonth() + plan.tenureMonths);

    // Calculate expected maturity amount
    let expectedMaturityAmount;
    if (plan.planType === 'FD' || plan.planType === 'CD') {
      expectedMaturityAmount = plan.calculateFDAmount(principalAmount);
    } else if (plan.planType === 'RD') {
      expectedMaturityAmount = plan.calculateRDAmount(monthlyInstallment);
    }

    // Create EMI schedule for RD
    let emiSchedule = [];
    if (plan.planType === 'RD' && monthlyInstallment) {
      for (let i = 1; i <= plan.tenureMonths; i++) {
        const dueDate = new Date(investmentDate);
        dueDate.setMonth(dueDate.getMonth() + i);
        
        emiSchedule.push({
          emiNumber: i,
          dueDate: dueDate,
          amount: monthlyInstallment,
          status: 'pending'
        });
      }
    }

    // Create investment
    const investment = await Investment.create({
      planId,
      memberId,
      principalAmount,
      monthlyInstallment,
      investmentDate,
      maturityDate,
      expectedMaturityAmount,
      emiSchedule,
      createdBy: adminId
    });

    // Update plan statistics
    await InvestmentPlan.findByIdAndUpdate(planId, {
      $inc: {
        'statistics.totalInvestments': 1,
        'statistics.totalAmountInvested': principalAmount,
        'statistics.activeInvestments': 1
      }
    });

    res.status(201).json({
      success: true,
      message: 'Investment created successfully',
      data: {
        investment: {
          investmentId: investment.investmentId,
          planName: plan.planName,
          planType: plan.planType,
          principalAmount: investment.principalAmount,
          expectedMaturityAmount: investment.expectedMaturityAmount,
          investmentDate: investment.investmentDate,
          maturityDate: investment.maturityDate,
          status: investment.status
        }
      }
    });

  } catch (error) {
    console.error('Create investment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while creating investment'
    });
  }
};

// Get all investments
const getAllInvestments = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      planId,
      memberId,
      status,
      planType,
      search
    } = req.query;

    // Build filter
    const filter = {};
    if (planId) filter.planId = planId;
    if (memberId) filter.memberId = memberId;
    if (status) filter.status = status;
    if (planType) {
      const plan = await InvestmentPlan.findOne({ planType: planType.toUpperCase() });
      if (plan) filter.planId = plan._id;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get investments with pagination
    const investments = await Investment.find(filter)
      .populate('planId', 'planName planType interestRate')
      .populate('memberId', 'firstName lastName email memberId')
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalInvestments = await Investment.countDocuments(filter);

    res.json({
      success: true,
      message: 'Investments retrieved successfully',
      data: {
        investments,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalInvestments / parseInt(limit)),
          totalInvestments,
          hasNextPage: skip + investments.length < totalInvestments,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Get all investments error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching investments'
    });
  }
};

// Calculate EMI cost for specific amount
const calculateEMICost = async (req, res) => {
  try {
    const { planId } = req.params;
    const { amount, planType } = req.body;

    const plan = await InvestmentPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Investment plan not found'
      });
    }

    if (!plan.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Investment plan is not active'
      });
    }

    // Calculate EMI cost based on plan type
    let emiCost;
    if (plan.planType === 'FD') {
      emiCost = plan.calculateFDEMICost(amount);
    } else if (plan.planType === 'RD') {
      emiCost = plan.calculateRDEMICost(amount);
    } else if (plan.planType === 'CD') {
      emiCost = plan.calculateCDEMICost(amount);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan type'
      });
    }

    // Get EMI cost structure
    const planEMICostStructure = plan.getEMICostStructure();

    res.json({
      success: true,
      message: 'EMI cost calculated successfully',
      data: {
        plan: {
          planName: plan.planName,
          planType: plan.planType,
          interestRate: plan.interestRate,
          tenureMonths: plan.tenureMonths
        },
        emiCost,
        emiCostStructure: planEMICostStructure
      }
    });

  } catch (error) {
    console.error('Calculate EMI cost error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while calculating EMI cost'
    });
  }
};

// Get sample EMI costs for a plan
const getSampleEMICosts = async (req, res) => {
  try {
    const { planId } = req.params;

    const plan = await InvestmentPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Investment plan not found'
      });
    }

    const sampleEMICosts = plan.getSampleEMICosts();
    const planEMICostStructure = plan.getEMICostStructure();

    res.json({
      success: true,
      message: 'Sample EMI costs retrieved successfully',
      data: {
        plan: {
          planName: plan.planName,
          planType: plan.planType,
          interestRate: plan.interestRate,
          tenureMonths: plan.tenureMonths
        },
        emiCostStructure: planEMICostStructure,
        sampleEMICosts
      }
    });

  } catch (error) {
    console.error('Get sample EMI costs error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching sample EMI costs'
    });
  }
};

module.exports = {
  createInvestmentPlan,
  getAllInvestmentPlans,
  getInvestmentPlanById,
  updateInvestmentPlan,
  deleteInvestmentPlan,
  togglePlanStatus,
  getPlanStatistics,
  createInvestment,
  getAllInvestments,
  calculateEMICost,
  getSampleEMICosts
};
