const InvestmentApplication = require('../models/investmentApplication.model');
const Investment = require('../models/investment.model');
const InvestmentPlan = require('../models/investmentPlan.model');
const SocietyMember = require('../models/societyMember.model');

// Get all investment applications for admin
const getAllInvestmentApplications = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      planId,
      memberId,
      search
    } = req.query;

    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (planId) filter.planId = planId;
    if (memberId) filter.memberId = memberId;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get applications with pagination
    const applications = await InvestmentApplication.find(filter)
      .populate('planId', 'planName planType interestRate tenureMonths')
      .populate('memberId', 'firstName lastName email memberId')
      .populate('approvedBy', 'firstName lastName email')
      .populate('rejectedBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalApplications = await InvestmentApplication.countDocuments(filter);

    // Get application summaries
    const applicationSummaries = applications.map(app => app.getApplicationSummary());

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
      message: 'Internal server error while fetching investment applications'
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

// Approve investment application
const approveApplication = async (req, res) => {
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

    // Approve application
    application.approveApplication(adminId);

    // Add note if provided
    if (notes) {
      application.notes.push({
        note: notes,
        addedBy: adminId
      });
    }

    // Save application
    await application.save();

    // Create investment record
    const investment = await Investment.create({
      planId: application.planId._id,
      memberId: application.memberId._id,
      principalAmount: application.investmentAmount,
      monthlyInstallment: application.monthlyEMI,
      investmentDate: new Date(),
      maturityDate: new Date(Date.now() + application.planId.tenureMonths * 30 * 24 * 60 * 60 * 1000),
      expectedMaturityAmount: application.planId.calculateFDAmount(application.investmentAmount),
      emiSchedule: application.emiSchedule,
      createdBy: adminId
    });

    res.json({
      success: true,
      message: 'Investment application approved successfully',
      data: {
        application: {
          applicationId: application.applicationId,
          status: application.status,
          approvalDate: application.approvalDate
        },
        investment: {
          investmentId: investment.investmentId,
          principalAmount: investment.principalAmount,
          expectedMaturityAmount: investment.expectedMaturityAmount
        }
      }
    });

  } catch (error) {
    console.error('Approve application error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while approving application'
    });
  }
};

// Reject investment application
const rejectApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { reason, notes } = req.body;
    const adminId = req.user._id;

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

    // Reject application
    application.rejectApplication(adminId, reason);

    // Add note if provided
    if (notes) {
      application.notes.push({
        note: notes,
        addedBy: adminId
      });
    }

    // Save application
    await application.save();

    res.json({
      success: true,
      message: 'Investment application rejected successfully',
      data: {
        application: {
          applicationId: application.applicationId,
          status: application.status,
          rejectionDate: application.rejectionDate,
          rejectionReason: application.rejectionReason
        }
      }
    });

  } catch (error) {
    console.error('Reject application error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while rejecting application'
    });
  }
};

// Record payment for investment application
const recordPayment = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const {
      amount,
      paymentMethod,
      emiNumber,
      transactionId,
      remarks
    } = req.body;
    const adminId = req.user._id;

    const application = await InvestmentApplication.findOne({
      applicationId: applicationId.toUpperCase()
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
        message: 'Application must be approved before recording payments'
      });
    }

    // Add payment
    application.addPayment(amount, paymentMethod, emiNumber, transactionId, remarks, adminId);

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
    console.error('Record payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while recording payment'
    });
  }
};

// Get application statistics
const getApplicationStatistics = async (req, res) => {
  try {
    const totalApplications = await InvestmentApplication.countDocuments();
    const pendingApplications = await InvestmentApplication.countDocuments({ status: 'pending' });
    const approvedApplications = await InvestmentApplication.countDocuments({ status: 'approved' });
    const rejectedApplications = await InvestmentApplication.countDocuments({ status: 'rejected' });
    const completedApplications = await InvestmentApplication.countDocuments({ status: 'completed' });

    // Calculate total investment amounts
    const applications = await InvestmentApplication.find({ status: 'approved' });
    const totalInvestmentAmount = applications.reduce((sum, app) => sum + app.investmentAmount, 0);
    const totalAmountPaid = applications.reduce((sum, app) => sum + app.totalAmountPaid, 0);

    // Get EMI statistics
    let totalEMIs = 0;
    let paidEMIs = 0;
    let overdueEMIs = 0;

    applications.forEach(app => {
      totalEMIs += app.emiSchedule.length;
      paidEMIs += app.emiSchedule.filter(emi => emi.status === 'paid').length;
      overdueEMIs += app.emiSchedule.filter(emi => 
        emi.status === 'pending' && emi.dueDate < new Date()
      ).length;
    });

    res.json({
      success: true,
      message: 'Application statistics retrieved successfully',
      data: {
        statistics: {
          totalApplications,
          pendingApplications,
          approvedApplications,
          rejectedApplications,
          completedApplications,
          totalInvestmentAmount,
          totalAmountPaid,
          emiStatistics: {
            totalEMIs,
            paidEMIs,
            pendingEMIs: totalEMIs - paidEMIs,
            overdueEMIs
          }
        }
      }
    });

  } catch (error) {
    console.error('Get application statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching application statistics'
    });
  }
};

// Add note to application
const addNoteToApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { note } = req.body;
    const adminId = req.user._id;

    const application = await InvestmentApplication.findOne({
      applicationId: applicationId.toUpperCase()
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Investment application not found'
      });
    }

    // Add note
    application.notes.push({
      note: note,
      addedBy: adminId
    });

    await application.save();

    res.json({
      success: true,
      message: 'Note added successfully',
      data: {
        applicationId: application.applicationId,
        note: {
          date: new Date(),
          note: note,
          addedBy: adminId
        }
      }
    });

  } catch (error) {
    console.error('Add note error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while adding note'
    });
  }
};

// Get all society member investments (created investments)
const getAllSocietyMemberInvestments = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      planId,
      memberId,
      search
    } = req.query;

    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (planId) filter.planId = planId;
    if (memberId) filter.memberId = memberId;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get investments with pagination
    const investments = await Investment.find(filter)
      .populate('planId', 'planName planType interestRate tenureMonths')
      .populate('memberId', 'firstName lastName email memberId')
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalInvestments = await Investment.countDocuments(filter);

    // Get investment summaries
    const investmentSummaries = investments.map(inv => ({
      investmentId: inv.investmentId,
      planName: inv.planId.planName,
      planType: inv.planId.planType,
      memberName: `${inv.memberId.firstName} ${inv.memberId.lastName}`,
      memberId: inv.memberId.memberId,
      principalAmount: inv.principalAmount,
      expectedMaturityAmount: inv.expectedMaturityAmount,
      status: inv.status,
      investmentDate: inv.investmentDate,
      maturityDate: inv.maturityDate,
      totalInterestEarned: inv.totalInterestEarned,
      totalPenaltyPaid: inv.totalPenaltyPaid,
      emiProgress: {
        total: inv.emiSchedule.length,
        paid: inv.emiSchedule.filter(emi => emi.status === 'paid').length,
        pending: inv.emiSchedule.filter(emi => emi.status === 'pending').length,
        overdue: inv.emiSchedule.filter(emi => 
          emi.status === 'pending' && emi.dueDate < new Date()
        ).length
      }
    }));

    res.json({
      success: true,
      message: 'Society member investments retrieved successfully',
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
    console.error('Get all society member investments error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching society member investments'
    });
  }
};

// Get society member investment details
const getSocietyMemberInvestmentDetails = async (req, res) => {
  try {
    const { investmentId } = req.params;

    const investment = await Investment.findOne({ 
      investmentId: investmentId.toUpperCase()
    })
      .populate('planId', 'planName planType interestRate tenureMonths compoundingFrequency')
      .populate('memberId', 'firstName lastName email memberId phoneNumber address')
      .populate('createdBy', 'firstName lastName email');

    if (!investment) {
      return res.status(404).json({
        success: false,
        message: 'Society member investment not found'
      });
    }

    // Get EMI schedule
    const emiSchedule = investment.emiSchedule.map(emi => ({
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

    res.json({
      success: true,
      message: 'Society member investment details retrieved successfully',
      data: {
        investment: {
          investmentId: investment.investmentId,
          plan: investment.planId,
          member: investment.memberId,
          principalAmount: investment.principalAmount,
          monthlyInstallment: investment.monthlyInstallment,
          investmentDate: investment.investmentDate,
          maturityDate: investment.maturityDate,
          expectedMaturityAmount: investment.expectedMaturityAmount,
          actualMaturityAmount: investment.actualMaturityAmount,
          status: investment.status,
          totalInterestEarned: investment.totalInterestEarned,
          totalPenaltyPaid: investment.totalPenaltyPaid,
          certificateNumber: investment.certificateNumber,
          emiSchedule,
          createdBy: investment.createdBy,
          createdAt: investment.createdAt,
          updatedAt: investment.updatedAt
        }
      }
    });

  } catch (error) {
    console.error('Get society member investment details error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching investment details'
    });
  }
};

// Get all society members with pending investment applications
const getAllSocietyMembersWithPendingApplications = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      planType,
      search
    } = req.query;

    // Build filter for pending applications
    const filter = { status: 'pending' };
    if (planType) {
      filter.planId = { $in: await InvestmentPlan.find({ planType }).select('_id') };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get pending applications with member and plan details
    const applications = await InvestmentApplication.find(filter)
      .populate('memberId', 'firstName lastName email memberId phoneNumber address')
      .populate('planId', 'planId planName planType interestRate tenureMonths minimumAmount maximumAmount')
      .sort({ applicationDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalApplications = await InvestmentApplication.countDocuments(filter);

    // Get unique society members with their pending applications
    const memberMap = new Map();
    
    applications.forEach(app => {
      const memberId = app.memberId._id.toString();
      if (!memberMap.has(memberId)) {
        memberMap.set(memberId, {
          member: app.memberId,
          pendingApplications: [],
          totalPendingAmount: 0,
          totalPendingEMI: 0
        });
      }
      
      const memberData = memberMap.get(memberId);
      memberData.pendingApplications.push({
        applicationId: app.applicationId,
        plan: app.planId,
        investmentAmount: app.investmentAmount,
        monthlyEMI: app.monthlyEMI,
        paymentMethod: app.paymentMethod,
        applicationDate: app.applicationDate,
        termsAccepted: app.termsAccepted
      });
      
      memberData.totalPendingAmount += app.investmentAmount || 0;
      memberData.totalPendingEMI += app.monthlyEMI || 0;
    });

    const societyMembers = Array.from(memberMap.values());

    res.json({
      success: true,
      message: 'Society members with pending applications retrieved successfully',
      data: {
        societyMembers,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalApplications / parseInt(limit)),
          totalApplications,
          totalUniqueMembers: societyMembers.length,
          hasNextPage: skip + applications.length < totalApplications,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Get society members with pending applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching society members with pending applications'
    });
  }
};

// Get all pending investment plan acceptance requests (for new plans)
const getAllPendingInvestmentPlanRequests = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      planType,
      search
    } = req.query;

    // Build filter for pending applications
    const filter = { status: 'pending' };
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get pending applications with detailed information
    const applications = await InvestmentApplication.find(filter)
      .populate('memberId', 'firstName lastName email memberId phoneNumber address')
      .populate('planId', 'planId planName planType interestRate tenureMonths minimumAmount maximumAmount description features')
      .sort({ applicationDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalApplications = await InvestmentApplication.countDocuments(filter);

    // Format the response with detailed information
    const pendingRequests = applications.map(app => ({
      applicationId: app.applicationId,
      member: {
        memberId: app.memberId.memberId,
        name: `${app.memberId.firstName} ${app.memberId.lastName}`,
        email: app.memberId.email,
        phoneNumber: app.memberId.phoneNumber,
        address: app.memberId.address
      },
      plan: {
        planId: app.planId.planId,
        planName: app.planId.planName,
        planType: app.planId.planType,
        interestRate: app.planId.interestRate,
        tenureMonths: app.planId.tenureMonths,
        minimumAmount: app.planId.minimumAmount,
        maximumAmount: app.planId.maximumAmount,
        description: app.planId.description,
        features: app.planId.features
      },
      applicationDetails: {
        investmentAmount: app.investmentAmount,
        monthlyEMI: app.monthlyEMI,
        paymentMethod: app.paymentMethod,
        applicationDate: app.applicationDate,
        termsAccepted: app.termsAccepted,
        termsAcceptedDate: app.termsAcceptedDate,
        notes: app.notes
      },
      emiSchedule: app.emiSchedule,
      paymentHistory: app.paymentHistory,
      documents: app.documents
    }));

    res.json({
      success: true,
      message: 'Pending investment plan acceptance requests retrieved successfully',
      data: {
        pendingRequests,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalApplications / parseInt(limit)),
          totalApplications,
          hasNextPage: skip + applications.length < totalApplications,
          hasPrevPage: parseInt(page) > 1
        },
        summary: {
          totalPendingAmount: applications.reduce((sum, app) => sum + (app.investmentAmount || 0), 0),
          totalPendingEMI: applications.reduce((sum, app) => sum + (app.monthlyEMI || 0), 0),
          planTypeBreakdown: applications.reduce((acc, app) => {
            const type = app.planId.planType;
            acc[type] = (acc[type] || 0) + 1;
            return acc;
          }, {})
        }
      }
    });

  } catch (error) {
    console.error('Get pending investment plan requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching pending investment plan requests'
    });
  }
};

// Get statistics for pending applications
const getPendingApplicationsStatistics = async (req, res) => {
  try {
    // Get basic counts
    const totalPending = await InvestmentApplication.countDocuments({ status: 'pending' });
    const totalApproved = await InvestmentApplication.countDocuments({ status: 'approved' });
    const totalRejected = await InvestmentApplication.countDocuments({ status: 'rejected' });
    const totalCancelled = await InvestmentApplication.countDocuments({ status: 'cancelled' });

    // Get pending applications by plan type
    const pendingByPlanType = await InvestmentApplication.aggregate([
      { $match: { status: 'pending' } },
      {
        $lookup: {
          from: 'investmentplans',
          localField: 'planId',
          foreignField: '_id',
          as: 'plan'
        }
      },
      { $unwind: '$plan' },
      {
        $group: {
          _id: '$plan.planType',
          count: { $sum: 1 },
          totalAmount: { $sum: '$investmentAmount' },
          totalEMI: { $sum: '$monthlyEMI' }
        }
      }
    ]);

    // Get pending applications by payment method
    const pendingByPaymentMethod = await InvestmentApplication.aggregate([
      { $match: { status: 'pending' } },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          totalAmount: { $sum: '$investmentAmount' }
        }
      }
    ]);

    // Get recent applications (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentApplications = await InvestmentApplication.countDocuments({
      status: 'pending',
      applicationDate: { $gte: sevenDaysAgo }
    });

    // Get total pending amount and EMI
    const totalPendingAmount = await InvestmentApplication.aggregate([
      { $match: { status: 'pending' } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$investmentAmount' },
          totalEMI: { $sum: '$monthlyEMI' }
        }
      }
    ]);

    res.json({
      success: true,
      message: 'Pending applications statistics retrieved successfully',
      data: {
        overview: {
          totalPending,
          totalApproved,
          totalRejected,
          totalCancelled,
          recentApplications
        },
        pendingByPlanType,
        pendingByPaymentMethod,
        totals: totalPendingAmount[0] || { totalAmount: 0, totalEMI: 0 }
      }
    });

  } catch (error) {
    console.error('Get pending applications statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching pending applications statistics'
    });
  }
};

// Bulk approve multiple applications
const bulkApproveApplications = async (req, res) => {
  try {
    const { applicationIds, notes } = req.body;
    const adminId = req.user._id;

    if (!applicationIds || !Array.isArray(applicationIds) || applicationIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Application IDs array is required'
      });
    }

    const results = {
      approved: [],
      failed: [],
      totalProcessed: 0
    };

    for (const applicationId of applicationIds) {
      try {
        results.totalProcessed++;

        const application = await InvestmentApplication.findOne({
          applicationId: applicationId.toUpperCase()
        })
          .populate('planId')
          .populate('memberId');

        if (!application) {
          results.failed.push({
            applicationId,
            error: 'Application not found'
          });
          continue;
        }

        if (application.status !== 'pending') {
          results.failed.push({
            applicationId,
            error: 'Only pending applications can be approved'
          });
          continue;
        }

        // Approve application
        application.approveApplication(adminId);

        // Add note if provided
        if (notes) {
          application.notes.push({
            note: notes,
            addedBy: adminId
          });
        }

        // Save application
        await application.save();

        // Create investment record
        const investment = await Investment.create({
          planId: application.planId._id,
          memberId: application.memberId._id,
          principalAmount: application.investmentAmount,
          monthlyInstallment: application.monthlyEMI,
          investmentDate: new Date(),
          maturityDate: new Date(Date.now() + application.planId.tenureMonths * 30 * 24 * 60 * 60 * 1000),
          expectedMaturityAmount: application.planId.calculateFDAmount(application.investmentAmount),
          emiSchedule: application.emiSchedule,
          createdBy: adminId
        });

        results.approved.push({
          applicationId: application.applicationId,
          investmentId: investment.investmentId,
          principalAmount: investment.principalAmount,
          expectedMaturityAmount: investment.expectedMaturityAmount
        });

      } catch (error) {
        results.failed.push({
          applicationId,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: `Bulk approval completed. ${results.approved.length} approved, ${results.failed.length} failed`,
      data: results
    });

  } catch (error) {
    console.error('Bulk approve applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while bulk approving applications'
    });
  }
};

// Bulk reject multiple applications
const bulkRejectApplications = async (req, res) => {
  try {
    const { applicationIds, reason, notes } = req.body;
    const adminId = req.user._id;

    if (!applicationIds || !Array.isArray(applicationIds) || applicationIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Application IDs array is required'
      });
    }

    const results = {
      rejected: [],
      failed: [],
      totalProcessed: 0
    };

    for (const applicationId of applicationIds) {
      try {
        results.totalProcessed++;

        const application = await InvestmentApplication.findOne({
          applicationId: applicationId.toUpperCase()
        });

        if (!application) {
          results.failed.push({
            applicationId,
            error: 'Application not found'
          });
          continue;
        }

        if (application.status !== 'pending') {
          results.failed.push({
            applicationId,
            error: 'Only pending applications can be rejected'
          });
          continue;
        }

        // Reject application
        application.rejectApplication(adminId, reason);

        // Add note if provided
        if (notes) {
          application.notes.push({
            note: notes,
            addedBy: adminId
          });
        }

        // Save application
        await application.save();

        results.rejected.push({
          applicationId: application.applicationId,
          status: application.status,
          rejectionDate: application.rejectionDate,
          rejectionReason: application.rejectionReason
        });

      } catch (error) {
        results.failed.push({
          applicationId,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: `Bulk rejection completed. ${results.rejected.length} rejected, ${results.failed.length} failed`,
      data: results
    });

  } catch (error) {
    console.error('Bulk reject applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while bulk rejecting applications'
    });
  }
};

module.exports = {
  getAllInvestmentApplications,
  getInvestmentApplicationDetails,
  approveApplication,
  rejectApplication,
  recordPayment,
  getApplicationStatistics,
  addNoteToApplication,
  getAllSocietyMemberInvestments,
  getSocietyMemberInvestmentDetails,
  getAllSocietyMembersWithPendingApplications,
  getAllPendingInvestmentPlanRequests,
  getPendingApplicationsStatistics,
  bulkApproveApplications,
  bulkRejectApplications
};
