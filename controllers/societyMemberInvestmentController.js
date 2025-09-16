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

// Get all investment data for society member (applications + investments)
const getAllInvestmentData = async (req, res) => {
  try {
    const memberId = req.user._id;
    const { page = 1, limit = 10 } = req.query;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get all applications
    const applications = await InvestmentApplication.find({ memberId })
      .populate('planId', 'planName planType interestRate tenureMonths')
      .populate('approvedBy', 'firstName lastName email')
      .populate('rejectedBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

    // Get all investments
    const investments = await Investment.find({ memberId })
      .populate('planId', 'planName planType interestRate tenureMonths')
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

    // Get application summaries
    const applicationSummaries = applications.map(app => ({
      type: 'application',
      ...app.getApplicationSummary(),
      plan: app.planId,
      approvedBy: app.approvedBy,
      rejectedBy: app.rejectedBy,
      applicationDate: app.applicationDate,
      approvalDate: app.approvalDate,
      rejectionDate: app.rejectionDate,
      rejectionReason: app.rejectionReason
    }));

    // Get investment summaries
    const investmentSummaries = investments.map(inv => {
      const summary = inv.getInvestmentSummary();
      const overdueEMIs = inv.getOverdueEMIs();
      const nextEMIDueDate = inv.getNextEMIDueDate();
      
      return {
        type: 'investment',
        ...summary,
        plan: inv.planId,
        createdBy: inv.createdBy,
        overdueEMIs: overdueEMIs.length,
        nextEMIDueDate,
        emiSchedule: inv.emiSchedule.map(emi => ({
          emiNumber: emi.emiNumber,
          dueDate: emi.dueDate,
          amount: emi.amount,
          status: emi.status,
          paidDate: emi.paidDate,
          penaltyAmount: emi.penaltyAmount,
          remarks: emi.remarks,
          isOverdue: emi.status === 'pending' && emi.dueDate < new Date()
        }))
      };
    });

    // Combine and sort by date
    const allData = [...applicationSummaries, ...investmentSummaries]
      .sort((a, b) => new Date(b.createdAt || b.applicationDate || b.investmentDate) - new Date(a.createdAt || a.applicationDate || a.investmentDate));

    // Apply pagination
    const paginatedData = allData.slice(skip, skip + parseInt(limit));

    // Calculate statistics
    const stats = {
      totalApplications: applications.length,
      pendingApplications: applications.filter(app => app.status === 'pending').length,
      approvedApplications: applications.filter(app => app.status === 'approved').length,
      rejectedApplications: applications.filter(app => app.status === 'rejected').length,
      totalInvestments: investments.length,
      activeInvestments: investments.filter(inv => inv.status === 'active').length,
      completedInvestments: investments.filter(inv => inv.status === 'completed').length,
      totalEMIs: investments.reduce((sum, inv) => sum + inv.emiSchedule.length, 0),
      paidEMIs: investments.reduce((sum, inv) => sum + inv.emiSchedule.filter(emi => emi.status === 'paid').length, 0),
      pendingEMIs: investments.reduce((sum, inv) => sum + inv.emiSchedule.filter(emi => emi.status === 'pending').length, 0),
      overdueEMIs: investments.reduce((sum, inv) => sum + inv.getOverdueEMIs().length, 0)
    };

    res.json({
      success: true,
      message: 'All investment data retrieved successfully',
      data: {
        investments: paginatedData,
        statistics: stats,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(allData.length / parseInt(limit)),
          totalItems: allData.length,
          hasNextPage: skip + paginatedData.length < allData.length,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Get all investment data error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching investment data'
    });
  }
};

// Get pending applications and payments status
const getPendingStatus = async (req, res) => {
  try {
    const memberId = req.user._id;

    // Get pending applications
    const pendingApplications = await InvestmentApplication.find({ 
      memberId, 
      status: 'pending' 
    })
      .populate('planId', 'planName planType interestRate tenureMonths')
      .sort({ applicationDate: -1 });

    // Get active investments with pending EMIs
    const activeInvestments = await Investment.find({ 
      memberId, 
      status: 'active' 
    })
      .populate('planId', 'planName planType interestRate tenureMonths')
      .sort({ createdAt: -1 });

    // Process pending applications
    const pendingApps = pendingApplications.map(app => ({
      applicationId: app.applicationId,
      plan: app.planId,
      investmentAmount: app.investmentAmount,
      monthlyEMI: app.monthlyEMI,
      applicationDate: app.applicationDate,
      daysPending: Math.ceil((new Date() - app.applicationDate) / (1000 * 60 * 60 * 24))
    }));

    // Process active investments with pending EMIs
    const pendingPayments = [];
    activeInvestments.forEach(investment => {
      const pendingEMIs = investment.emiSchedule.filter(emi => emi.status === 'pending');
      const overdueEMIs = pendingEMIs.filter(emi => emi.dueDate < new Date());
      
      if (pendingEMIs.length > 0) {
        pendingPayments.push({
          investmentId: investment.investmentId,
          plan: investment.planId,
          principalAmount: investment.principalAmount,
          monthlyInstallment: investment.monthlyInstallment,
          pendingEMIs: pendingEMIs.length,
          overdueEMIs: overdueEMIs.length,
          nextEMIDueDate: investment.getNextEMIDueDate(),
          totalPendingAmount: pendingEMIs.reduce((sum, emi) => sum + emi.amount, 0),
          overdueAmount: overdueEMIs.reduce((sum, emi) => sum + emi.amount, 0),
          emiDetails: pendingEMIs.map(emi => ({
            emiNumber: emi.emiNumber,
            dueDate: emi.dueDate,
            amount: emi.amount,
            isOverdue: emi.dueDate < new Date(),
            daysOverdue: emi.dueDate < new Date() 
              ? Math.ceil((new Date() - emi.dueDate) / (1000 * 60 * 60 * 24))
              : 0
          }))
        });
      }
    });

    // Calculate summary
    const summary = {
      pendingApplications: pendingApps.length,
      activeInvestments: activeInvestments.length,
      totalPendingEMIs: pendingPayments.reduce((sum, inv) => sum + inv.pendingEMIs, 0),
      totalOverdueEMIs: pendingPayments.reduce((sum, inv) => sum + inv.overdueEMIs, 0),
      totalPendingAmount: pendingPayments.reduce((sum, inv) => sum + inv.totalPendingAmount, 0),
      totalOverdueAmount: pendingPayments.reduce((sum, inv) => sum + inv.overdueAmount, 0)
    };

    res.json({
      success: true,
      message: 'Pending status retrieved successfully',
      data: {
        pendingApplications: pendingApps,
        pendingPayments,
        summary
      }
    });

  } catch (error) {
    console.error('Get pending status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching pending status'
    });
  }
};

// Get EMI list for all investments
const getEMIList = async (req, res) => {
  try {
    const memberId = req.user._id;
    const { status, investmentId, page = 1, limit = 20 } = req.query;

    // Build filter
    const filter = { memberId };
    if (investmentId) filter.investmentId = investmentId.toUpperCase();

    // Get investments
    const investments = await Investment.find(filter)
      .populate('planId', 'planName planType interestRate tenureMonths')
      .sort({ createdAt: -1 });

    // Collect all EMIs
    let allEMIs = [];
    investments.forEach(investment => {
      investment.emiSchedule.forEach(emi => {
        allEMIs.push({
          investmentId: investment.investmentId,
          plan: investment.planId,
          emiNumber: emi.emiNumber,
          dueDate: emi.dueDate,
          amount: emi.amount,
          status: emi.status,
          paidDate: emi.paidDate,
          penaltyAmount: emi.penaltyAmount,
          remarks: emi.remarks,
          isOverdue: emi.status === 'pending' && emi.dueDate < new Date(),
          daysOverdue: emi.status === 'pending' && emi.dueDate < new Date() 
            ? Math.ceil((new Date() - emi.dueDate) / (1000 * 60 * 60 * 24))
            : 0
        });
      });
    });

    // Filter by status if provided
    if (status) {
      allEMIs = allEMIs.filter(emi => emi.status === status);
    }

    // Sort by due date
    allEMIs.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    // Apply pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginatedEMIs = allEMIs.slice(skip, skip + parseInt(limit));

    // Calculate summary statistics
    const stats = {
      totalEMIs: allEMIs.length,
      paidEMIs: allEMIs.filter(emi => emi.status === 'paid').length,
      pendingEMIs: allEMIs.filter(emi => emi.status === 'pending').length,
      overdueEMIs: allEMIs.filter(emi => emi.isOverdue).length,
      totalAmount: allEMIs.reduce((sum, emi) => sum + emi.amount, 0),
      paidAmount: allEMIs.filter(emi => emi.status === 'paid').reduce((sum, emi) => sum + emi.amount, 0),
      pendingAmount: allEMIs.filter(emi => emi.status === 'pending').reduce((sum, emi) => sum + emi.amount, 0),
      overdueAmount: allEMIs.filter(emi => emi.isOverdue).reduce((sum, emi) => sum + emi.amount, 0),
      totalPenalty: allEMIs.reduce((sum, emi) => sum + emi.penaltyAmount, 0)
    };

    res.json({
      success: true,
      message: 'EMI list retrieved successfully',
      data: {
        emis: paginatedEMIs,
        statistics: stats,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(allEMIs.length / parseInt(limit)),
          totalEMIs: allEMIs.length,
          hasNextPage: skip + paginatedEMIs.length < allEMIs.length,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Get EMI list error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching EMI list'
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
  getAvailableInvestmentPlans,
  getAllInvestmentData,
  getPendingStatus,
  getEMIList
};
