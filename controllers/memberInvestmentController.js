const InvestmentPlan = require('../models/investmentPlan.model');
const Investment = require('../models/investment.model');
const SocietyMember = require('../models/societyMember.model');

// Get available investment plans
const getAvailablePlans = async (req, res) => {
  try {
    const { planType, minAmount, maxAmount } = req.query;

    // Build filter for active and available plans
    const filter = {
      isActive: true,
      isAvailableForNewInvestments: true
    };

    if (planType) {
      filter.planType = planType.toUpperCase();
    }

    if (minAmount) {
      filter.minimumAmount = { $lte: parseInt(minAmount) };
    }

    if (maxAmount) {
      filter.maximumAmount = { $gte: parseInt(maxAmount) };
    }

    const plans = await InvestmentPlan.find(filter)
      .select('planName planType description minimumAmount maximumAmount interestRate tenureMonths compoundingFrequency monthlyInstallment penaltyConfig features')
      .sort({ interestRate: -1 });

    // Add calculated maturity amounts
    const plansWithMaturity = plans.map(plan => ({
      ...plan.toObject(),
      sampleMaturityAmount: plan.maturityAmount,
      sampleMonthlyReturn: plan.planType === 'RD' ? 
        (plan.monthlyInstallment * plan.tenureMonths) : 
        plan.minimumAmount
    }));

    res.json({
      success: true,
      message: 'Available investment plans retrieved successfully',
      data: {
        plans: plansWithMaturity
      }
    });

  } catch (error) {
    console.error('Get available plans error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching investment plans'
    });
  }
};

// Get plan details
const getPlanDetails = async (req, res) => {
  try {
    const { planId } = req.params;

    const plan = await InvestmentPlan.findById(planId)
      .select('planName planType description minimumAmount maximumAmount interestRate tenureMonths compoundingFrequency monthlyInstallment penaltyConfig features termsAndConditions');

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

    // Get EMI cost structure and sample calculations
    const planEMICostStructure = plan.getEMICostStructure();
    const sampleEMICosts = plan.getSampleEMICosts();

    res.json({
      success: true,
      message: 'Plan details retrieved successfully',
      data: {
        plan: {
          ...plan.toObject(),
          emiCostStructure: planEMICostStructure,
          sampleEMICosts
        }
      }
    });

  } catch (error) {
    console.error('Get plan details error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching plan details'
    });
  }
};

// Get member's investments
const getMemberInvestments = async (req, res) => {
  try {
    const memberId = req.user._id;
    const { status, planType } = req.query;

    // Build filter
    const filter = { memberId };
    if (status) filter.status = status;

    const investments = await Investment.find(filter)
      .populate('planId', 'planName planType interestRate tenureMonths')
      .sort({ createdAt: -1 });

    // Filter by plan type if specified
    let filteredInvestments = investments;
    if (planType) {
      filteredInvestments = investments.filter(inv => 
        inv.planId && inv.planId.planType === planType.toUpperCase()
      );
    }

    // Get investment summaries
    const investmentSummaries = filteredInvestments.map(inv => inv.getInvestmentSummary());

    res.json({
      success: true,
      message: 'Member investments retrieved successfully',
      data: {
        investments: investmentSummaries
      }
    });

  } catch (error) {
    console.error('Get member investments error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching member investments'
    });
  }
};

// Get investment details
const getInvestmentDetails = async (req, res) => {
  try {
    const { investmentId } = req.params;
    const memberId = req.user._id;

    const investment = await Investment.findOne({ 
      investmentId: investmentId.toUpperCase(),
      memberId 
    })
      .populate('planId', 'planName planType interestRate tenureMonths compoundingFrequency')
      .populate('memberId', 'firstName lastName email memberId');

    if (!investment) {
      return res.status(404).json({
        success: false,
        message: 'Investment not found'
      });
    }

    // Get EMI schedule for RD plans
    let emiSchedule = null;
    if (investment.planId.planType === 'RD') {
      emiSchedule = investment.emiSchedule.map(emi => ({
        emiNumber: emi.emiNumber,
        dueDate: emi.dueDate,
        amount: emi.amount,
        status: emi.status,
        paidDate: emi.paidDate,
        penaltyAmount: emi.penaltyAmount,
        remarks: emi.remarks
      }));
    }

    // Get payment history
    const paymentHistory = investment.paymentHistory.map(payment => ({
      date: payment.date,
      amount: payment.amount,
      paymentType: payment.paymentType,
      emiNumber: payment.emiNumber,
      transactionId: payment.transactionId,
      remarks: payment.remarks
    }));

    // Get penalty history
    const penaltyHistory = investment.penaltyHistory.map(penalty => ({
      date: penalty.date,
      amount: penalty.amount,
      reason: penalty.reason,
      emiNumber: penalty.emiNumber
    }));

    res.json({
      success: true,
      message: 'Investment details retrieved successfully',
      data: {
        investment: {
          investmentId: investment.investmentId,
          plan: investment.planId,
          member: investment.memberId,
          principalAmount: investment.principalAmount,
          expectedMaturityAmount: investment.expectedMaturityAmount,
          actualMaturityAmount: investment.actualMaturityAmount,
          totalInterestEarned: investment.totalInterestEarned,
          totalPenaltyPaid: investment.totalPenaltyPaid,
          status: investment.status,
          investmentDate: investment.investmentDate,
          maturityDate: investment.maturityDate,
          emiSchedule,
          paymentHistory,
          penaltyHistory,
          documents: investment.documents
        }
      }
    });

  } catch (error) {
    console.error('Get investment details error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching investment details'
    });
  }
};

// Get EMI schedule
const getEMISchedule = async (req, res) => {
  try {
    const { investmentId } = req.params;
    const memberId = req.user._id;

    const investment = await Investment.findOne({ 
      investmentId: investmentId.toUpperCase(),
      memberId 
    })
      .populate('planId', 'planName planType');

    if (!investment) {
      return res.status(404).json({
        success: false,
        message: 'Investment not found'
      });
    }

    if (investment.planId.planType !== 'RD') {
      return res.status(400).json({
        success: false,
        message: 'EMI schedule is only available for RD (Recurring Deposit) plans'
      });
    }

    const emiSchedule = investment.emiSchedule.map(emi => ({
      emiNumber: emi.emiNumber,
      dueDate: emi.dueDate,
      amount: emi.amount,
      status: emi.status,
      paidDate: emi.paidDate,
      penaltyAmount: emi.penaltyAmount,
      remarks: emi.remarks,
      isOverdue: emi.status === 'pending' && emi.dueDate < new Date()
    }));

    // Calculate summary
    const totalEMIs = emiSchedule.length;
    const paidEMIs = emiSchedule.filter(emi => emi.status === 'paid').length;
    const pendingEMIs = emiSchedule.filter(emi => emi.status === 'pending').length;
    const overdueEMIs = emiSchedule.filter(emi => emi.isOverdue).length;

    res.json({
      success: true,
      message: 'EMI schedule retrieved successfully',
      data: {
        investmentId: investment.investmentId,
        planName: investment.planId.planName,
        summary: {
          totalEMIs,
          paidEMIs,
          pendingEMIs,
          overdueEMIs
        },
        emiSchedule
      }
    });

  } catch (error) {
    console.error('Get EMI schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching EMI schedule'
    });
  }
};

// Get investment summary/dashboard
const getInvestmentSummary = async (req, res) => {
  try {
    const memberId = req.user._id;

    // Get all member investments
    const investments = await Investment.find({ memberId })
      .populate('planId', 'planName planType interestRate');

    // Calculate summary statistics
    const totalInvestments = investments.length;
    const activeInvestments = investments.filter(inv => inv.status === 'active').length;
    const completedInvestments = investments.filter(inv => inv.status === 'completed').length;

    const totalPrincipalAmount = investments.reduce((sum, inv) => sum + inv.principalAmount, 0);
    const totalExpectedMaturity = investments.reduce((sum, inv) => sum + inv.expectedMaturityAmount, 0);
    const totalInterestEarned = investments.reduce((sum, inv) => sum + inv.totalInterestEarned, 0);
    const totalPenaltyPaid = investments.reduce((sum, inv) => sum + inv.totalPenaltyPaid, 0);

    // Get plan type breakdown
    const planTypeBreakdown = {};
    investments.forEach(inv => {
      const planType = inv.planId.planType;
      if (!planTypeBreakdown[planType]) {
        planTypeBreakdown[planType] = {
          count: 0,
          totalAmount: 0
        };
      }
      planTypeBreakdown[planType].count++;
      planTypeBreakdown[planType].totalAmount += inv.principalAmount;
    });

    // Get recent investments
    const recentInvestments = investments
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map(inv => ({
        investmentId: inv.investmentId,
        planName: inv.planId.planName,
        planType: inv.planId.planType,
        principalAmount: inv.principalAmount,
        status: inv.status,
        investmentDate: inv.investmentDate
      }));

    // Get upcoming EMIs (next 3 months)
    const upcomingEMIs = [];
    investments.forEach(inv => {
      if (inv.planId.planType === 'RD') {
        const nextEMIs = inv.emiSchedule
          .filter(emi => emi.status === 'pending' && emi.dueDate <= new Date(Date.now() + 90 * 24 * 60 * 60 * 1000))
          .slice(0, 3)
          .map(emi => ({
            investmentId: inv.investmentId,
            planName: inv.planId.planName,
            emiNumber: emi.emiNumber,
            dueDate: emi.dueDate,
            amount: emi.amount,
            isOverdue: emi.dueDate < new Date()
          }));
        upcomingEMIs.push(...nextEMIs);
      }
    });

    upcomingEMIs.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    res.json({
      success: true,
      message: 'Investment summary retrieved successfully',
      data: {
        summary: {
          totalInvestments,
          activeInvestments,
          completedInvestments,
          totalPrincipalAmount,
          totalExpectedMaturity,
          totalInterestEarned,
          totalPenaltyPaid,
          netReturn: totalInterestEarned - totalPenaltyPaid
        },
        planTypeBreakdown,
        recentInvestments,
        upcomingEMIs: upcomingEMIs.slice(0, 10)
      }
    });

  } catch (error) {
    console.error('Get investment summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching investment summary'
    });
  }
};

// Calculate investment returns
const calculateReturns = async (req, res) => {
  try {
    const { planId, principalAmount, monthlyInstallment } = req.body;

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

    // Calculate EMI cost based on plan type
    let emiCost;
    if (plan.planType === 'FD' || plan.planType === 'CD') {
      emiCost = plan.calculateFDEMICost(principalAmount);
    } else if (plan.planType === 'RD') {
      if (!monthlyInstallment) {
        return res.status(400).json({
          success: false,
          message: 'Monthly installment amount is required for RD plans'
        });
      }
      emiCost = plan.calculateRDEMICost(monthlyInstallment);
    }

    // Calculate annualized return
    const annualizedReturn = (emiCost.totalInterest / emiCost.emiCost.oneTimeInvestment || emiCost.emiCost.totalInvestment) * (12 / plan.tenureMonths) * 100;

    res.json({
      success: true,
      message: 'Investment returns calculated successfully',
      data: {
        plan: {
          planName: plan.planName,
          planType: plan.planType,
          interestRate: plan.interestRate,
          tenureMonths: plan.tenureMonths
        },
        emiCost,
        calculation: {
          annualizedReturn: annualizedReturn.toFixed(2) + '%'
        }
      }
    });

  } catch (error) {
    console.error('Calculate returns error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while calculating returns'
    });
  }
};

module.exports = {
  getAvailablePlans,
  getPlanDetails,
  getMemberInvestments,
  getInvestmentDetails,
  getEMISchedule,
  getInvestmentSummary,
  calculateReturns
};
