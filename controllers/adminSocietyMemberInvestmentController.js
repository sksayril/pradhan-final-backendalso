const InvestmentApplication = require('../models/investmentApplication.model');
const Investment = require('../models/investment.model');
const InvestmentPlan = require('../models/investmentPlan.model');
const SocietyMember = require('../models/societyMember.model');

// Get all pending investment applications
const getPendingInvestmentApplications = async (req, res) => {
  try {
    const { page = 1, limit = 10, planType, memberId, search } = req.query;

    // Build filter for pending applications
    const filter = { status: 'pending' };
    
    if (planType) {
      const plan = await InvestmentPlan.findOne({ planType: planType.toUpperCase() });
      if (plan) filter.planId = plan._id;
    }
    
    if (memberId) filter.memberId = memberId;
    
    if (search) {
      const members = await SocietyMember.find({
        $or: [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { memberId: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');
      
      filter.memberId = { $in: members.map(m => m._id) };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get applications with pagination
    const applications = await InvestmentApplication.find(filter)
      .populate('planId', 'planName planType interestRate tenureMonths')
      .populate('memberId', 'firstName lastName email memberId phoneNumber')
      .sort({ applicationDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalApplications = await InvestmentApplication.countDocuments(filter);

    // Get application summaries
    const applicationSummaries = applications.map(app => ({
      ...app.getApplicationSummary(),
      member: app.memberId,
      plan: app.planId,
      applicationDate: app.applicationDate,
      documents: app.documents,
      notes: app.notes
    }));

    res.json({
      success: true,
      message: 'Pending investment applications retrieved successfully',
      data: {
        applications: applicationSummaries,
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
    console.error('Get pending investment applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching pending applications'
    });
  }
};

// Get all approved investment applications
const getApprovedInvestmentApplications = async (req, res) => {
  try {
    const { page = 1, limit = 10, planType, memberId, search } = req.query;

    // Build filter for approved applications
    const filter = { status: 'approved' };
    
    if (planType) {
      const plan = await InvestmentPlan.findOne({ planType: planType.toUpperCase() });
      if (plan) filter.planId = plan._id;
    }
    
    if (memberId) filter.memberId = memberId;
    
    if (search) {
      const members = await SocietyMember.find({
        $or: [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { memberId: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');
      
      filter.memberId = { $in: members.map(m => m._id) };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get applications with pagination
    const applications = await InvestmentApplication.find(filter)
      .populate('planId', 'planName planType interestRate tenureMonths')
      .populate('memberId', 'firstName lastName email memberId phoneNumber')
      .populate('approvedBy', 'firstName lastName email')
      .sort({ approvalDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalApplications = await InvestmentApplication.countDocuments(filter);

    // Get application summaries
    const applicationSummaries = applications.map(app => ({
      ...app.getApplicationSummary(),
      member: app.memberId,
      plan: app.planId,
      approvedBy: app.approvedBy,
      applicationDate: app.applicationDate,
      approvalDate: app.approvalDate,
      documents: app.documents,
      notes: app.notes
    }));

    res.json({
      success: true,
      message: 'Approved investment applications retrieved successfully',
      data: {
        applications: applicationSummaries,
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
    console.error('Get approved investment applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching approved applications'
    });
  }
};

// Get all investment applications by status (generic endpoint)
const getAllInvestmentApplications = async (req, res) => {
  try {
    const { page = 1, limit = 10, planType, memberId, search, status } = req.query;

    // Build filter
    const filter = {};
    
    // Add status filter if provided
    if (status) {
      filter.status = status;
    }
    
    if (planType) {
      const plan = await InvestmentPlan.findOne({ planType: planType.toUpperCase() });
      if (plan) filter.planId = plan._id;
    }
    
    if (memberId) filter.memberId = memberId;
    
    if (search) {
      const members = await SocietyMember.find({
        $or: [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { memberId: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');
      
      filter.memberId = { $in: members.map(m => m._id) };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get applications with pagination
    const applications = await InvestmentApplication.find(filter)
      .populate('planId', 'planName planType interestRate tenureMonths')
      .populate('memberId', 'firstName lastName email memberId phoneNumber')
      .populate('approvedBy', 'firstName lastName email')
      .populate('rejectedBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalApplications = await InvestmentApplication.countDocuments(filter);

    // Get application summaries
    const applicationSummaries = applications.map(app => ({
      ...app.getApplicationSummary(),
      member: app.memberId,
      plan: app.planId,
      approvedBy: app.approvedBy,
      rejectedBy: app.rejectedBy,
      applicationDate: app.applicationDate,
      approvalDate: app.approvalDate,
      rejectionDate: app.rejectionDate,
      rejectionReason: app.rejectionReason,
      documents: app.documents,
      notes: app.notes
    }));

    res.json({
      success: true,
      message: 'Investment applications retrieved successfully',
      data: {
        applications: applicationSummaries,
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
    console.error('Get all investment applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching applications'
    });
  }
};

// Get investment application details for admin
const getInvestmentApplicationDetails = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await InvestmentApplication.findOne({ 
      applicationId: applicationId.toUpperCase()
    })
      .populate('planId', 'planName planType interestRate tenureMonths compoundingFrequency')
      .populate('memberId', 'firstName lastName email memberId phoneNumber address')
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
      remarks: payment.remarks,
      processedBy: payment.processedBy
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
          approvedBy: application.approvedBy,
          rejectedBy: application.rejectedBy,
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

// Approve investment application
const approveInvestmentApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { notes } = req.body;
    const adminId = req.user._id;

    const application = await InvestmentApplication.findOne({ 
      applicationId: applicationId.toUpperCase() 
    })
      .populate('planId')
      .populate('memberId');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Investment application not found'
      });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending applications can be approved'
      });
    }

    // Approve the application
    application.approveApplication(adminId);

    // Add admin notes if provided
    if (notes) {
      application.notes.push({
        note: notes,
        addedBy: adminId
      });
    }

    await application.save();

    // Create investment record for approved application
    const investment = await createInvestmentFromApplication(application, adminId);

    res.json({
      success: true,
      message: 'Investment application approved successfully',
      data: {
        application: {
          applicationId: application.applicationId,
          status: application.status,
          approvalDate: application.approvalDate,
          approvedBy: application.approvedBy
        },
        investment: {
          investmentId: investment.investmentId,
          status: investment.status,
          principalAmount: investment.principalAmount,
          expectedMaturityAmount: investment.expectedMaturityAmount
        }
      }
    });

  } catch (error) {
    console.error('Approve investment application error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while approving application'
    });
  }
};

// Reject investment application
const rejectInvestmentApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { rejectionReason, notes } = req.body;
    const adminId = req.user._id;

    if (!rejectionReason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    const application = await InvestmentApplication.findOne({ 
      applicationId: applicationId.toUpperCase() 
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
        message: 'Only pending applications can be rejected'
      });
    }

    // Reject the application
    application.rejectApplication(adminId, rejectionReason);

    // Add admin notes if provided
    if (notes) {
      application.notes.push({
        note: notes,
        addedBy: adminId
      });
    }

    await application.save();

    res.json({
      success: true,
      message: 'Investment application rejected successfully',
      data: {
        application: {
          applicationId: application.applicationId,
          status: application.status,
          rejectionDate: application.rejectionDate,
          rejectionReason: application.rejectionReason,
          rejectedBy: application.rejectedBy
        }
      }
    });

  } catch (error) {
    console.error('Reject investment application error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while rejecting application'
    });
  }
};

// Get all approved investments with EMI tracking
const getApprovedInvestments = async (req, res) => {
  try {
    const { page = 1, limit = 10, planType, memberId, status, search } = req.query;

    // Build filter
    const filter = {};
    
    if (planType) {
      const plan = await InvestmentPlan.findOne({ planType: planType.toUpperCase() });
      if (plan) filter.planId = plan._id;
    }
    
    if (memberId) filter.memberId = memberId;
    if (status) filter.status = status;
    
    if (search) {
      const members = await SocietyMember.find({
        $or: [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { memberId: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');
      
      filter.memberId = { $in: members.map(m => m._id) };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get investments with pagination
    const investments = await Investment.find(filter)
      .populate('planId', 'planName planType interestRate tenureMonths')
      .populate('memberId', 'firstName lastName email memberId phoneNumber')
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalInvestments = await Investment.countDocuments(filter);

    // Get investment summaries with EMI details
    const investmentSummaries = investments.map(inv => {
      const summary = inv.getInvestmentSummary();
      const overdueEMIs = inv.getOverdueEMIs();
      const nextEMIDueDate = inv.getNextEMIDueDate();
      
      return {
        ...summary,
        member: inv.memberId,
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

    res.json({
      success: true,
      message: 'Approved investments retrieved successfully',
      data: {
        investments: investmentSummaries,
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
    console.error('Get approved investments error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching approved investments'
    });
  }
};

// Get investment details with EMI tracking
const getInvestmentDetails = async (req, res) => {
  try {
    const { investmentId } = req.params;

    const investment = await Investment.findOne({ 
      investmentId: investmentId.toUpperCase() 
    })
      .populate('planId', 'planName planType interestRate tenureMonths compoundingFrequency')
      .populate('memberId', 'firstName lastName email memberId phoneNumber address')
      .populate('createdBy', 'firstName lastName email')
      .populate('lastModifiedBy', 'firstName lastName email');

    if (!investment) {
      return res.status(404).json({
        success: false,
        message: 'Investment not found'
      });
    }

    // Get EMI schedule with detailed status
    const emiSchedule = investment.emiSchedule.map(emi => ({
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
    }));

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

    // Calculate summary statistics
    const totalEMIs = emiSchedule.length;
    const paidEMIs = emiSchedule.filter(emi => emi.status === 'paid').length;
    const pendingEMIs = emiSchedule.filter(emi => emi.status === 'pending').length;
    const overdueEMIs = emiSchedule.filter(emi => emi.isOverdue).length;

    res.json({
      success: true,
      message: 'Investment details retrieved successfully',
      data: {
        investment: {
          investmentId: investment.investmentId,
          plan: investment.planId,
          member: investment.memberId,
          principalAmount: investment.principalAmount,
          monthlyInstallment: investment.monthlyInstallment,
          expectedMaturityAmount: investment.expectedMaturityAmount,
          actualMaturityAmount: investment.actualMaturityAmount,
          totalInterestEarned: investment.totalInterestEarned,
          totalPenaltyPaid: investment.totalPenaltyPaid,
          status: investment.status,
          investmentDate: investment.investmentDate,
          maturityDate: investment.maturityDate,
          createdBy: investment.createdBy,
          lastModifiedBy: investment.lastModifiedBy,
          emiSchedule,
          paymentHistory,
          penaltyHistory,
          documents: investment.documents,
          notes: investment.notes,
          summary: {
            totalEMIs,
            paidEMIs,
            pendingEMIs,
            overdueEMIs,
            completionPercentage: totalEMIs > 0 ? Math.round((paidEMIs / totalEMIs) * 100) : 0
          }
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

// Record EMI payment
const recordEMIPayment = async (req, res) => {
  try {
    const { investmentId } = req.params;
    const { emiNumber, amount, paymentMethod, transactionId, remarks } = req.body;
    const adminId = req.user._id;

    const investment = await Investment.findOne({ 
      investmentId: investmentId.toUpperCase() 
    });

    if (!investment) {
      return res.status(404).json({
        success: false,
        message: 'Investment not found'
      });
    }

    if (investment.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Only active investments can receive payments'
      });
    }

    // Find the EMI
    const emi = investment.emiSchedule.find(e => e.emiNumber === emiNumber);
    if (!emi) {
      return res.status(404).json({
        success: false,
        message: 'EMI not found'
      });
    }

    if (emi.status === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'EMI is already paid'
      });
    }

    // Update EMI status
    investment.updateEMIStatus(emiNumber, 'paid', new Date(), 0, remarks);

    // Record payment
    investment.recordPayment(amount, 'emi', emiNumber, transactionId, remarks);

    // Update last modified by
    investment.lastModifiedBy = adminId;

    await investment.save();

    res.json({
      success: true,
      message: 'EMI payment recorded successfully',
      data: {
        investmentId: investment.investmentId,
        emiNumber,
        amount,
        paymentMethod,
        transactionId,
        paidDate: new Date()
      }
    });

  } catch (error) {
    console.error('Record EMI payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while recording EMI payment'
    });
  }
};

// Apply penalty for overdue EMI
const applyPenalty = async (req, res) => {
  try {
    const { investmentId } = req.params;
    const { emiNumber, penaltyAmount, reason } = req.body;
    const adminId = req.user._id;

    if (!penaltyAmount || penaltyAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid penalty amount is required'
      });
    }

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Penalty reason is required'
      });
    }

    const investment = await Investment.findOne({ 
      investmentId: investmentId.toUpperCase() 
    });

    if (!investment) {
      return res.status(404).json({
        success: false,
        message: 'Investment not found'
      });
    }

    // Add penalty
    investment.addPenalty(penaltyAmount, reason, emiNumber);

    // Update EMI status to penalty applied if EMI number provided
    if (emiNumber) {
      investment.updateEMIStatus(emiNumber, 'penalty_applied', null, penaltyAmount, reason);
    }

    // Update last modified by
    investment.lastModifiedBy = adminId;

    await investment.save();

    res.json({
      success: true,
      message: 'Penalty applied successfully',
      data: {
        investmentId: investment.investmentId,
        emiNumber,
        penaltyAmount,
        reason,
        totalPenaltyPaid: investment.totalPenaltyPaid
      }
    });

  } catch (error) {
    console.error('Apply penalty error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while applying penalty'
    });
  }
};

// Get EMI statistics and reports
const getEMIStatistics = async (req, res) => {
  try {
    const { period = 'month', planType, memberId } = req.query;

    // Build date filter based on period
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // Build filter
    const filter = {
      createdAt: { $gte: startDate }
    };
    
    if (planType) {
      const plan = await InvestmentPlan.findOne({ planType: planType.toUpperCase() });
      if (plan) filter.planId = plan._id;
    }
    
    if (memberId) filter.memberId = memberId;

    // Get investments
    const investments = await Investment.find(filter)
      .populate('planId', 'planName planType')
      .populate('memberId', 'firstName lastName memberId');

    // Calculate statistics
    let totalEMIs = 0;
    let paidEMIs = 0;
    let pendingEMIs = 0;
    let overdueEMIs = 0;
    let totalPenaltyAmount = 0;
    let totalEMIAmount = 0;
    let totalPaidAmount = 0;

    const emiBreakdown = [];
    const overdueDetails = [];

    investments.forEach(investment => {
      investment.emiSchedule.forEach(emi => {
        totalEMIs++;
        totalEMIAmount += emi.amount;
        
        if (emi.status === 'paid') {
          paidEMIs++;
          totalPaidAmount += emi.amount;
        } else if (emi.status === 'pending') {
          pendingEMIs++;
          if (emi.dueDate < new Date()) {
            overdueEMIs++;
            overdueDetails.push({
              investmentId: investment.investmentId,
              member: investment.memberId,
              plan: investment.planId,
              emiNumber: emi.emiNumber,
              dueDate: emi.dueDate,
              amount: emi.amount,
              daysOverdue: Math.ceil((new Date() - emi.dueDate) / (1000 * 60 * 60 * 24))
            });
          }
        }
        
        if (emi.penaltyAmount > 0) {
          totalPenaltyAmount += emi.penaltyAmount;
        }
      });
    });

    // Calculate collection efficiency
    const collectionEfficiency = totalEMIs > 0 ? Math.round((paidEMIs / totalEMIs) * 100) : 0;

    res.json({
      success: true,
      message: 'EMI statistics retrieved successfully',
      data: {
        period,
        startDate,
        endDate: now,
        summary: {
          totalEMIs,
          paidEMIs,
          pendingEMIs,
          overdueEMIs,
          collectionEfficiency,
          totalEMIAmount,
          totalPaidAmount,
          totalPenaltyAmount,
          pendingAmount: totalEMIAmount - totalPaidAmount
        },
        overdueDetails,
        breakdown: {
          byPlan: investments.reduce((acc, inv) => {
            const planType = inv.planId.planType;
            if (!acc[planType]) {
              acc[planType] = { total: 0, paid: 0, pending: 0, overdue: 0 };
            }
            inv.emiSchedule.forEach(emi => {
              acc[planType].total++;
              if (emi.status === 'paid') acc[planType].paid++;
              else if (emi.status === 'pending') {
                acc[planType].pending++;
                if (emi.dueDate < new Date()) acc[planType].overdue++;
              }
            });
            return acc;
          }, {})
        }
      }
    });

  } catch (error) {
    console.error('Get EMI statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching EMI statistics'
    });
  }
};

// Helper function to create investment from approved application
const createInvestmentFromApplication = async (application, adminId) => {
  try {
    const plan = application.planId;
    const member = application.memberId;

    // Calculate maturity date
    const investmentDate = new Date();
    const maturityDate = new Date(investmentDate);
    maturityDate.setMonth(maturityDate.getMonth() + plan.tenureMonths);

    // Calculate expected maturity amount
    let expectedMaturityAmount;
    if (plan.planType === 'FD' || plan.planType === 'CD') {
      expectedMaturityAmount = plan.calculateFDAmount(application.investmentAmount);
    } else if (plan.planType === 'RD') {
      expectedMaturityAmount = plan.calculateRDAmount(application.monthlyEMI);
    }

    // Create EMI schedule from application
    const emiSchedule = application.emiSchedule.map(emi => ({
      emiNumber: emi.emiNumber,
      dueDate: emi.dueDate,
      amount: emi.amount,
      status: emi.status
    }));

    // Create investment
    const investment = new Investment({
      planId: application.planId._id,
      memberId: application.memberId._id,
      principalAmount: application.investmentAmount,
      monthlyInstallment: application.monthlyEMI,
      investmentDate,
      maturityDate,
      expectedMaturityAmount,
      emiSchedule,
      createdBy: adminId
    });

    await investment.save();

    // Update application status to completed
    application.status = 'completed';
    await application.save();

    return investment;

  } catch (error) {
    console.error('Create investment from application error:', error);
    throw error;
  }
};

module.exports = {
  getPendingInvestmentApplications,
  getApprovedInvestmentApplications,
  getAllInvestmentApplications,
  getInvestmentApplicationDetails,
  approveInvestmentApplication,
  rejectInvestmentApplication,
  getApprovedInvestments,
  getInvestmentDetails,
  recordEMIPayment,
  applyPenalty,
  getEMIStatistics
};
