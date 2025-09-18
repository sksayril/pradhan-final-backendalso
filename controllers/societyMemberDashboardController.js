const SocietyMember = require('../models/societyMember.model');
const LoanRequest = require('../models/loanRequest.model');
const Investment = require('../models/investment.model');
const EMIRecord = require('../models/emiRecord.model');
const Payment = require('../models/payment.model');
const mongoose = require('mongoose');

// Get comprehensive dashboard data for society member
const getDashboardData = async (req, res) => {
  try {
    const memberId = req.user.id;
    const currentDate = new Date();
    
    // Get member basic info
    const member = await SocietyMember.findById(memberId)
      .select('firstName lastName memberId email phoneNumber societyName position isActive isVerified kycStatus lastLogin');

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    // Get upcoming EMIs (next 3 months)
    const upcomingEMIs = await getUpcomingEMIs(memberId, 3);
    
    // Get my loans summary
    const myLoans = await getMyLoansSummary(memberId);
    
    // Get my investments summary
    const myInvestments = await getMyInvestmentsSummary(memberId);
    
    // Get payment history (last 5 payments)
    const recentPayments = await getRecentPayments(memberId, 5);
    
    // Get dashboard statistics
    const dashboardStats = await getDashboardStatistics(memberId);
    
    // Get notifications/alerts
    const notifications = await getNotifications(memberId);
    
    // Get quick actions available
    const quickActions = getQuickActions(member);

    res.status(200).json({
      success: true,
      message: 'Dashboard data retrieved successfully',
      data: {
        member: {
          name: `${member.firstName} ${member.lastName}`,
          memberId: member.memberId,
          email: member.email,
          phoneNumber: member.phoneNumber,
          societyName: member.societyName,
          position: member.position,
          isActive: member.isActive,
          isVerified: member.isVerified,
          kycStatus: member.kycStatus,
          lastLogin: member.lastLogin
        },
        upcomingEMIs,
        myLoans,
        myInvestments,
        recentPayments,
        dashboardStats,
        notifications,
        quickActions
      }
    });

  } catch (error) {
    console.error('Error getting dashboard data:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get upcoming EMIs
const getUpcomingEMIs = async (memberId, months = 3) => {
  try {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + months);

    const upcomingEMIs = await EMIRecord.find({
      memberId: new mongoose.Types.ObjectId(memberId),
      status: 'pending',
      dueDate: {
        $gte: startDate,
        $lte: endDate
      }
    })
    .populate('investmentId', 'investmentId principalAmount')
    .populate('loanRequestId', 'requestId loanAmount loanPurpose')
    .populate('planId', 'planName planType interestRate')
    .sort({ dueDate: 1 })
    .limit(10);

    return upcomingEMIs.map(emi => ({
      emiId: emi.emiId,
      emiNumber: emi.emiNumber,
      emiAmount: emi.emiAmount,
      dueDate: emi.dueDate,
      gracePeriodEndDate: emi.gracePeriodEndDate,
      penaltyAmount: emi.penaltyAmount,
      status: emi.status,
      isOverdue: emi.dueDate < new Date(),
      daysUntilDue: Math.ceil((emi.dueDate - new Date()) / (1000 * 60 * 60 * 24)),
      type: emi.investmentId ? 'investment' : 'loan',
      investmentId: emi.investmentId?.investmentId,
      loanRequestId: emi.loanRequestId?.requestId,
      planName: emi.planId?.planName,
      loanPurpose: emi.loanRequestId?.loanPurpose
    }));

  } catch (error) {
    console.error('Error getting upcoming EMIs:', error);
    return [];
  }
};

// Get my loans summary
const getMyLoansSummary = async (memberId) => {
  try {
    const loans = await LoanRequest.find({
      memberId: new mongoose.Types.ObjectId(memberId)
    })
    .populate('emiRecords')
    .sort({ createdAt: -1 });

    const summary = {
      totalLoans: loans.length,
      totalLoanAmount: loans.reduce((sum, loan) => sum + loan.loanAmount, 0),
      totalDisbursedAmount: loans
        .filter(loan => loan.status === 'disbursed')
        .reduce((sum, loan) => sum + (loan.disbursedAmount || 0), 0),
      statusBreakdown: {
        pending: loans.filter(loan => loan.status === 'pending').length,
        approved: loans.filter(loan => loan.status === 'approved').length,
        disbursed: loans.filter(loan => loan.status === 'disbursed').length,
        completed: loans.filter(loan => loan.status === 'completed').length,
        rejected: loans.filter(loan => loan.status === 'rejected').length
      },
      recentLoans: loans.slice(0, 5).map(loan => ({
        requestId: loan.requestId,
        loanAmount: loan.loanAmount,
        disbursedAmount: loan.disbursedAmount,
        loanPurpose: loan.loanPurpose,
        status: loan.status,
        createdAt: loan.createdAt,
        disbursedAt: loan.disbursedAt,
        emiCount: loan.emiRecords.length,
        paidEMIs: loan.emiRecords.filter(emi => emi.status === 'paid').length,
        pendingEMIs: loan.emiRecords.filter(emi => emi.status === 'pending').length,
        overdueEMIs: loan.emiRecords.filter(emi => 
          emi.status === 'pending' && emi.dueDate < new Date()
        ).length
      }))
    };

    return summary;

  } catch (error) {
    console.error('Error getting loans summary:', error);
    return {
      totalLoans: 0,
      totalLoanAmount: 0,
      totalDisbursedAmount: 0,
      statusBreakdown: { pending: 0, approved: 0, disbursed: 0, completed: 0, rejected: 0 },
      recentLoans: []
    };
  }
};

// Get my investments summary
const getMyInvestmentsSummary = async (memberId) => {
  try {
    const investments = await Investment.find({
      memberId: new mongoose.Types.ObjectId(memberId)
    })
    .populate('planId', 'planName planType interestRate tenureMonths')
    .sort({ createdAt: -1 });

    const summary = {
      totalInvestments: investments.length,
      totalInvestmentAmount: investments.reduce((sum, inv) => sum + inv.principalAmount, 0),
      totalMaturityAmount: investments.reduce((sum, inv) => sum + inv.expectedMaturityAmount, 0),
      statusBreakdown: {
        active: investments.filter(inv => inv.status === 'active').length,
        completed: investments.filter(inv => inv.status === 'completed').length,
        paused: investments.filter(inv => inv.status === 'paused').length
      },
      recentInvestments: investments.slice(0, 5).map(investment => ({
        investmentId: investment.investmentId,
        principalAmount: investment.principalAmount,
        monthlyInstallment: investment.monthlyInstallment,
        expectedMaturityAmount: investment.expectedMaturityAmount,
        investmentDate: investment.investmentDate,
        maturityDate: investment.maturityDate,
        status: investment.status,
        planName: investment.planId?.planName,
        planType: investment.planId?.planType,
        interestRate: investment.planId?.interestRate
      }))
    };

    return summary;

  } catch (error) {
    console.error('Error getting investments summary:', error);
    return {
      totalInvestments: 0,
      totalInvestmentAmount: 0,
      totalMaturityAmount: 0,
      statusBreakdown: { active: 0, completed: 0, paused: 0 },
      recentInvestments: []
    };
  }
};

// Get recent payments
const getRecentPayments = async (memberId, limit = 5) => {
  try {
    const payments = await Payment.find({
      memberId: new mongoose.Types.ObjectId(memberId)
    })
    .populate('investmentId', 'investmentId')
    .populate('planId', 'planName')
    .sort({ paymentDate: -1 })
    .limit(limit);

    return payments.map(payment => ({
      paymentId: payment.paymentId,
      amount: payment.amount,
      paymentType: payment.paymentType,
      paymentMethod: payment.paymentMethod,
      status: payment.status,
      verificationStatus: payment.verificationStatus,
      paymentDate: payment.paymentDate,
      processedDate: payment.processedDate,
      emiNumber: payment.emiNumber,
      investmentId: payment.investmentId?.investmentId,
      planName: payment.planId?.planName,
      remarks: payment.remarks
    }));

  } catch (error) {
    console.error('Error getting recent payments:', error);
    return [];
  }
};

// Get dashboard statistics
const getDashboardStatistics = async (memberId) => {
  try {
    const currentMonth = new Date();
    currentMonth.setDate(1);
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    // Get EMI statistics
    const totalEMIs = await EMIRecord.countDocuments({
      memberId: new mongoose.Types.ObjectId(memberId)
    });

    const paidEMIs = await EMIRecord.countDocuments({
      memberId: new mongoose.Types.ObjectId(memberId),
      status: 'paid'
    });

    const pendingEMIs = await EMIRecord.countDocuments({
      memberId: new mongoose.Types.ObjectId(memberId),
      status: 'pending'
    });

    const overdueEMIs = await EMIRecord.countDocuments({
      memberId: new mongoose.Types.ObjectId(memberId),
      status: 'pending',
      dueDate: { $lt: new Date() }
    });

    // Get payment statistics
    const totalPayments = await Payment.countDocuments({
      memberId: new mongoose.Types.ObjectId(memberId)
    });

    const successfulPayments = await Payment.countDocuments({
      memberId: new mongoose.Types.ObjectId(memberId),
      status: 'completed'
    });

    const pendingPayments = await Payment.countDocuments({
      memberId: new mongoose.Types.ObjectId(memberId),
      status: 'pending'
    });

    // Calculate total amounts
    const totalPaidAmount = await Payment.aggregate([
      { $match: { memberId: new mongoose.Types.ObjectId(memberId), status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const totalPendingAmount = await EMIRecord.aggregate([
      { $match: { memberId: new mongoose.Types.ObjectId(memberId), status: 'pending' } },
      { $group: { _id: null, total: { $sum: '$emiAmount' } } }
    ]);

    return {
      emiStats: {
        total: totalEMIs,
        paid: paidEMIs,
        pending: pendingEMIs,
        overdue: overdueEMIs,
        paymentRate: totalEMIs > 0 ? Math.round((paidEMIs / totalEMIs) * 100) : 0
      },
      paymentStats: {
        total: totalPayments,
        successful: successfulPayments,
        pending: pendingPayments,
        successRate: totalPayments > 0 ? Math.round((successfulPayments / totalPayments) * 100) : 0
      },
      amountStats: {
        totalPaid: totalPaidAmount[0]?.total || 0,
        totalPending: totalPendingAmount[0]?.total || 0
      }
    };

  } catch (error) {
    console.error('Error getting dashboard statistics:', error);
    return {
      emiStats: { total: 0, paid: 0, pending: 0, overdue: 0, paymentRate: 0 },
      paymentStats: { total: 0, successful: 0, pending: 0, successRate: 0 },
      amountStats: { totalPaid: 0, totalPending: 0 }
    };
  }
};

// Get notifications/alerts
const getNotifications = async (memberId) => {
  try {
    const notifications = [];
    const currentDate = new Date();

    // Check for overdue EMIs
    const overdueEMIs = await EMIRecord.find({
      memberId: new mongoose.Types.ObjectId(memberId),
      status: 'pending',
      dueDate: { $lt: currentDate }
    }).limit(5);

    overdueEMIs.forEach(emi => {
      const daysOverdue = Math.ceil((currentDate - emi.dueDate) / (1000 * 60 * 60 * 24));
      notifications.push({
        type: 'overdue_emi',
        title: 'Overdue EMI Payment',
        message: `EMI #${emi.emiNumber} of ₹${emi.emiAmount} is overdue by ${daysOverdue} days`,
        priority: 'high',
        actionRequired: true,
        emiId: emi.emiId,
        amount: emi.emiAmount
      });
    });

    // Check for upcoming EMIs (due in next 3 days)
    const upcomingEMIs = await EMIRecord.find({
      memberId: new mongoose.Types.ObjectId(memberId),
      status: 'pending',
      dueDate: {
        $gte: currentDate,
        $lte: new Date(currentDate.getTime() + 3 * 24 * 60 * 60 * 1000)
      }
    }).limit(3);

    upcomingEMIs.forEach(emi => {
      const daysUntilDue = Math.ceil((emi.dueDate - currentDate) / (1000 * 60 * 60 * 24));
      notifications.push({
        type: 'upcoming_emi',
        title: 'EMI Payment Due Soon',
        message: `EMI #${emi.emiNumber} of ₹${emi.emiAmount} is due in ${daysUntilDue} days`,
        priority: 'medium',
        actionRequired: true,
        emiId: emi.emiId,
        amount: emi.emiAmount
      });
    });

    // Check for pending loan approvals
    const pendingLoans = await LoanRequest.find({
      memberId: new mongoose.Types.ObjectId(memberId),
      status: 'pending'
    }).limit(2);

    pendingLoans.forEach(loan => {
      notifications.push({
        type: 'pending_loan',
        title: 'Loan Application Pending',
        message: `Your loan application for ₹${loan.loanAmount} is under review`,
        priority: 'low',
        actionRequired: false,
        requestId: loan.requestId
      });
    });

    // Check for pending payment verifications
    const pendingPayments = await Payment.find({
      memberId: new mongoose.Types.ObjectId(memberId),
      status: 'pending',
      verificationStatus: 'pending'
    }).limit(3);

    pendingPayments.forEach(payment => {
      notifications.push({
        type: 'pending_payment',
        title: 'Payment Under Review',
        message: `Your payment of ₹${payment.amount} is being verified`,
        priority: 'medium',
        actionRequired: false,
        paymentId: payment.paymentId
      });
    });

    return notifications.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

  } catch (error) {
    console.error('Error getting notifications:', error);
    return [];
  }
};

// Get quick actions available for member
const getQuickActions = (member) => {
  const actions = [];

  // Always available actions
  actions.push({
    id: 'view_emis',
    title: 'View EMIs',
    description: 'Check your upcoming and pending EMIs',
    icon: 'calendar',
    route: '/api/society-member-payments/pending-emis',
    available: true
  });

  actions.push({
    id: 'make_payment',
    title: 'Make Payment',
    description: 'Pay your pending EMIs online or cash',
    icon: 'payment',
    route: '/api/society-member-payments/generate-order',
    available: true
  });

  actions.push({
    id: 'payment_history',
    title: 'Payment History',
    description: 'View your payment history',
    icon: 'history',
    route: '/api/society-member-payments/history',
    available: true
  });

  // Conditional actions based on member status
  if (member.isActive && member.isVerified) {
    actions.push({
      id: 'apply_loan',
      title: 'Apply for Loan',
      description: 'Submit a new loan application',
      icon: 'loan',
      route: '/api/loan-requests',
      available: true
    });

    actions.push({
      id: 'view_loans',
      title: 'My Loans',
      description: 'View your loan applications and status',
      icon: 'account_balance',
      route: '/api/loan-requests',
      available: true
    });
  }

  if (member.kycStatus === 'approved') {
    actions.push({
      id: 'investments',
      title: 'My Investments',
      description: 'View your investment portfolio',
      icon: 'trending_up',
      route: '/api/society-member/investments',
      available: true
    });
  }

  return actions;
};

module.exports = {
  getDashboardData,
  getUpcomingEMIs,
  getMyLoansSummary,
  getMyInvestmentsSummary,
  getRecentPayments,
  getDashboardStatistics,
  getNotifications,
  getQuickActions
};
