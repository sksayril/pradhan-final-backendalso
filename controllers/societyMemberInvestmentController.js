const InvestmentPlan = require('../models/investmentPlan.model');
const InvestmentApplication = require('../models/investmentApplication.model');
const SocietyMember = require('../models/societyMember.model');

// Get all investment applications for society member
const getMyInvestmentApplications = async (req, res) => {
  try {
    const memberId = req.user._id;
    const { status, page = 1, limit = 10 } = req.query;

    // Build filter
    const filter = { memberId };
    if (status) filter.status = status;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get applications with pagination
    const applications = await InvestmentApplication.find(filter)
      .populate('planId', 'planName planType interestRate tenureMonths')
      .populate('approvedBy', 'firstName lastName email')
      .populate('rejectedBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalApplications = await InvestmentApplication.countDocuments(filter);

    // Get application summaries
    const applicationSummaries = applications.map(app => app.getApplicationSummary());

    // Get available investment plans for new applications
    const availablePlans = await InvestmentPlan.find({ 
      isActive: true, 
      isAvailableForNewInvestments: true 
    })
      .select('planId planName planType description minimumAmount maximumAmount interestRate tenureMonths compoundingFrequency emiCostStructure')
      .sort({ createdAt: -1 });

    // Get plan summaries with EMI cost structure
    const planSummaries = availablePlans.map(plan => {
      const emiCostStructure = plan.getEMICostStructure();
      const sampleEMICosts = plan.getSampleEMICosts();
      
      return {
        _id: plan._id,
        planId: plan.planId,
        planName: plan.planName,
        planType: plan.planType,
        description: plan.description,
        minimumAmount: plan.minimumAmount,
        maximumAmount: plan.maximumAmount,
        interestRate: plan.interestRate,
        tenureMonths: plan.tenureMonths,
        compoundingFrequency: plan.compoundingFrequency,
        emiCostStructure,
        sampleEMICosts
      };
    });

    res.json({
      success: true,
      message: 'Investment applications retrieved successfully',
      data: {
        applications: applicationSummaries,
        availablePlans: planSummaries,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalApplications / parseInt(limit)),
          totalApplications,
          hasNextPage: skip + applications.length < totalApplications,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Get investment applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching investment applications'
    });
  }
};

// Get investment application details
const getInvestmentApplicationDetails = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const memberId = req.user._id;

    const application = await InvestmentApplication.findOne({ 
      applicationId: applicationId.toUpperCase(),
      memberId 
    })
      .populate('planId', 'planName planType interestRate tenureMonths compoundingFrequency')
      .populate('memberId', 'firstName lastName email memberId')
      .populate('approvedBy', 'firstName lastName email')
      .populate('rejectedBy', 'firstName lastName email');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Investment application not found'
      });
    }

    // Get EMI schedule
    const emiSchedule = application.emiSchedule.map(emi => ({
      emiNumber: emi.emiNumber,
      dueDate: emi.dueDate,
      amount: emi.amount,
      status: emi.status,
      paidDate: emi.paidDate,
      paymentMethod: emi.paymentMethod,
      transactionId: emi.transactionId,
      penaltyAmount: emi.penaltyAmount,
      remarks: emi.remarks,
      isOverdue: emi.status === 'pending' && emi.dueDate < new Date()
    }));

    // Get payment history
    const paymentHistory = application.paymentHistory.map(payment => ({
      date: payment.date,
      amount: payment.amount,
      paymentMethod: payment.paymentMethod,
      transactionId: payment.transactionId,
      emiNumber: payment.emiNumber,
      status: payment.status,
      remarks: payment.remarks
    }));

    res.json({
      success: true,
      message: 'Investment application details retrieved successfully',
      data: {
        application: {
          applicationId: application.applicationId,
          plan: application.planId,
          member: application.memberId,
          investmentAmount: application.investmentAmount,
          monthlyEMI: application.monthlyEMI,
          paymentMethod: application.paymentMethod,
          status: application.status,
          paymentStatus: application.paymentStatus,
          totalAmountPaid: application.totalAmountPaid,
          remainingAmount: application.remainingAmount,
          applicationDate: application.applicationDate,
          approvalDate: application.approvalDate,
          rejectionDate: application.rejectionDate,
          rejectionReason: application.rejectionReason,
          emiSchedule,
          paymentHistory,
          documents: application.documents,
          notes: application.notes,
          termsAccepted: application.termsAccepted,
          termsAcceptedDate: application.termsAcceptedDate
        }
      }
    });

  } catch (error) {
    console.error('Get investment application details error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching application details'
    });
  }
};

// Apply for investment
const applyForInvestment = async (req, res) => {
  try {
    const {
      planId,
      investmentAmount,
      monthlyEMI,
      paymentMethod,
      termsAccepted
    } = req.body;

    const memberId = req.user._id;

    // Basic validation
    if (!planId) {
      return res.status(400).json({
        success: false,
        message: 'Plan ID is required'
      });
    }

    if (investmentAmount < 0) {
      return res.status(400).json({
        success: false,
        message: 'Investment amount cannot be negative'
      });
    }

    if (!termsAccepted) {
      return res.status(400).json({
        success: false,
        message: 'You must accept the terms and conditions to apply'
      });
    }

    // Validate plan exists
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
        message: 'Investment plan is not available for new applications'
      });
    }

    // Check if member already has a pending application for this plan
    const existingApplication = await InvestmentApplication.findOne({
      planId,
      memberId,
      status: 'pending'
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending application for this plan'
      });
    }

    // Create EMI schedule for RD plans
    let emiSchedule = [];
    if (plan.planType === 'RD' && monthlyEMI) {
      for (let i = 1; i <= plan.tenureMonths; i++) {
        const dueDate = new Date();
        dueDate.setMonth(dueDate.getMonth() + i);
        
        emiSchedule.push({
          emiNumber: i,
          dueDate: dueDate,
          amount: monthlyEMI,
          status: 'pending'
        });
      }
    }

    // Create investment application
    const application = new InvestmentApplication({
      planId,
      memberId,
      investmentAmount,
      monthlyEMI,
      paymentMethod,
      emiSchedule,
      termsAccepted,
      termsAcceptedDate: termsAccepted ? new Date() : null
    });

    // Ensure applicationId is generated before saving
    await application.generateApplicationId();
    await application.save();

    res.status(201).json({
      success: true,
      message: 'Investment application submitted successfully',
      data: {
        application: {
          applicationId: application.applicationId,
          planName: plan.planName,
          planType: plan.planType,
          investmentAmount: application.investmentAmount,
          monthlyEMI: application.monthlyEMI,
          paymentMethod: application.paymentMethod,
          status: application.status,
          applicationDate: application.applicationDate
        }
      }
    });

  } catch (error) {
    console.error('Apply for investment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while submitting investment application'
    });
  }
};

// Make payment for investment
const makePayment = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const {
      amount,
      paymentMethod,
      emiNumber,
      transactionId,
      remarks
    } = req.body;

    const memberId = req.user._id;

    // Find application
    const application = await InvestmentApplication.findOne({
      applicationId: applicationId.toUpperCase(),
      memberId
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Investment application not found'
      });
    }

    if (application.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Application must be approved before making payments'
      });
    }

    // Add payment
    application.addPayment(amount, paymentMethod, emiNumber, transactionId, remarks);

    // Update EMI status if EMI number provided
    if (emiNumber) {
      application.updateEMIStatus(emiNumber, 'paid', new Date(), paymentMethod, transactionId, 0, remarks);
    }

    // Save application
    await application.save();

    res.json({
      success: true,
      message: 'Payment recorded successfully',
      data: {
        applicationId: application.applicationId,
        amount: amount,
        paymentMethod: paymentMethod,
        totalAmountPaid: application.totalAmountPaid,
        remainingAmount: application.remainingAmount,
        paymentStatus: application.paymentStatus
      }
    });

  } catch (error) {
    console.error('Make payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while processing payment'
    });
  }
};

// Get EMI schedule for application
const getEMISchedule = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const memberId = req.user._id;

    const application = await InvestmentApplication.findOne({
      applicationId: applicationId.toUpperCase(),
      memberId
    }).populate('planId', 'planName planType');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Investment application not found'
      });
    }

    const emiSchedule = application.emiSchedule.map(emi => ({
      emiNumber: emi.emiNumber,
      dueDate: emi.dueDate,
      amount: emi.amount,
      status: emi.status,
      paidDate: emi.paidDate,
      paymentMethod: emi.paymentMethod,
      transactionId: emi.transactionId,
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
        applicationId: application.applicationId,
        planName: application.planId.planName,
        planType: application.planId.planType,
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

// Get payment history for application
const getPaymentHistory = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const memberId = req.user._id;

    const application = await InvestmentApplication.findOne({
      applicationId: applicationId.toUpperCase(),
      memberId
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Investment application not found'
      });
    }

    const paymentHistory = application.paymentHistory.map(payment => ({
      date: payment.date,
      amount: payment.amount,
      paymentMethod: payment.paymentMethod,
      transactionId: payment.transactionId,
      emiNumber: payment.emiNumber,
      status: payment.status,
      remarks: payment.remarks
    }));

    res.json({
      success: true,
      message: 'Payment history retrieved successfully',
      data: {
        applicationId: application.applicationId,
        totalAmountPaid: application.totalAmountPaid,
        remainingAmount: application.remainingAmount,
        paymentStatus: application.paymentStatus,
        paymentHistory
      }
    });

  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching payment history'
    });
  }
};

// Cancel investment application
const cancelApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const memberId = req.user._id;

    const application = await InvestmentApplication.findOne({
      applicationId: applicationId.toUpperCase(),
      memberId
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Investment application not found'
      });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending applications can be cancelled'
      });
    }

    application.status = 'cancelled';
    await application.save();

    res.json({
      success: true,
      message: 'Investment application cancelled successfully'
    });

  } catch (error) {
    console.error('Cancel application error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while cancelling application'
    });
  }
};

// Get available investment plans for society members
const getAvailableInvestmentPlans = async (req, res) => {
  try {
    const { planType, minAmount, maxAmount } = req.query;

    // Build filter
    const filter = { 
      isActive: true, 
      isAvailableForNewInvestments: true 
    };
    
    if (planType) filter.planType = planType.toUpperCase();
    if (minAmount) filter.minimumAmount = { $gte: parseInt(minAmount) };
    if (maxAmount) filter.maximumAmount = { $lte: parseInt(maxAmount) };

    // Get available plans
    const plans = await InvestmentPlan.find(filter)
      .select('planId planName planType description minimumAmount maximumAmount interestRate tenureMonths compoundingFrequency emiCostStructure')
      .sort({ createdAt: -1 });

    // Get plan summaries with EMI cost structure
    const planSummaries = plans.map(plan => {
      const emiCostStructure = plan.getEMICostStructure();
      const sampleEMICosts = plan.getSampleEMICosts();
      
      return {
        _id: plan._id,
        planId: plan.planId,
        planName: plan.planName,
        planType: plan.planType,
        description: plan.description,
        minimumAmount: plan.minimumAmount,
        maximumAmount: plan.maximumAmount,
        interestRate: plan.interestRate,
        tenureMonths: plan.tenureMonths,
        compoundingFrequency: plan.compoundingFrequency,
        emiCostStructure,
        sampleEMICosts
      };
    });

    res.json({
      success: true,
      message: 'Available investment plans retrieved successfully',
      data: {
        plans: planSummaries
      }
    });

  } catch (error) {
    console.error('Get available investment plans error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching available investment plans'
    });
  }
};

module.exports = {
  getMyInvestmentApplications,
  getInvestmentApplicationDetails,
  applyForInvestment,
  makePayment,
  getEMISchedule,
  getPaymentHistory,
  cancelApplication,
  getAvailableInvestmentPlans
};
