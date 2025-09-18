const SocietyMember = require('../models/societyMember.model');
const SocietyMemberKyc = require('../models/societyMemberKyc.model');
const LoanRequest = require('../models/loanRequest.model');
const Investment = require('../models/investment.model');
const EMIRecord = require('../models/emiRecord.model');
const Payment = require('../models/payment.model');
const mongoose = require('mongoose');

// Get society member profile
const getMemberProfile = async (req, res) => {
  try {
    const memberId = req.user.id;

    // Get member basic information
    const member = await SocietyMember.findById(memberId)
      .select('-password -originalPassword -__v')
      .populate('societyId', 'societyName societyCode address');

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    // Get KYC information
    const kycInfo = await SocietyMemberKyc.findOne({ memberId: new mongoose.Types.ObjectId(memberId) })
      .select('-__v');

    // Get account summary statistics
    const accountSummary = await getAccountSummary(memberId);

    // Get recent activity
    const recentActivity = await getRecentActivity(memberId);

    // Get profile completeness
    const profileCompleteness = calculateProfileCompleteness(member, kycInfo);

    // Get member status
    const memberStatus = getMemberStatus(member, kycInfo);

    res.status(200).json({
      success: true,
      message: 'Member profile retrieved successfully',
      data: {
        personalInfo: {
          firstName: member.firstName,
          lastName: member.lastName,
          memberId: member.memberId,
          email: member.email,
          phoneNumber: member.phoneNumber,
          dateOfBirth: member.dateOfBirth,
          gender: member.gender,
          address: member.address,
          city: member.city,
          state: member.state,
          pincode: member.pincode,
          emergencyContact: member.emergencyContact,
          emergencyPhone: member.emergencyPhone,
          profilePicture: member.profilePicture
        },
        societyInfo: {
          societyName: member.societyName,
          societyCode: member.societyCode,
          position: member.position,
          joiningDate: member.joiningDate,
          membershipType: member.membershipType,
          isActive: member.isActive,
          isVerified: member.isVerified
        },
        kycInfo: kycInfo ? {
          kycStatus: kycInfo.kycStatus,
          submittedAt: kycInfo.submittedAt,
          verifiedAt: kycInfo.verifiedAt,
          documents: kycInfo.documents,
          remarks: kycInfo.remarks
        } : null,
        accountSummary,
        recentActivity,
        profileCompleteness,
        memberStatus,
        lastLogin: member.lastLogin,
        createdAt: member.createdAt,
        updatedAt: member.updatedAt
      }
    });

  } catch (error) {
    console.error('Error getting member profile:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get account summary
const getAccountSummary = async (memberId) => {
  try {
    // Get loan summary
    const loanStats = await LoanRequest.aggregate([
      { $match: { memberId: new mongoose.Types.ObjectId(memberId) } },
      {
        $group: {
          _id: null,
          totalLoans: { $sum: 1 },
          totalLoanAmount: { $sum: '$loanAmount' },
          totalDisbursedAmount: { $sum: '$disbursedAmount' },
          pendingLoans: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          approvedLoans: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
          },
          disbursedLoans: {
            $sum: { $cond: [{ $eq: ['$status', 'disbursed'] }, 1, 0] }
          }
        }
      }
    ]);

    // Get investment summary
    const investmentStats = await Investment.aggregate([
      { $match: { memberId: new mongoose.Types.ObjectId(memberId) } },
      {
        $group: {
          _id: null,
          totalInvestments: { $sum: 1 },
          totalInvestmentAmount: { $sum: '$principalAmount' },
          totalMaturityAmount: { $sum: '$expectedMaturityAmount' },
          activeInvestments: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          completedInvestments: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          }
        }
      }
    ]);

    // Get EMI summary
    const emiStats = await EMIRecord.aggregate([
      { $match: { memberId: new mongoose.Types.ObjectId(memberId) } },
      {
        $group: {
          _id: null,
          totalEMIs: { $sum: 1 },
          paidEMIs: {
            $sum: { $cond: [{ $eq: ['$status', 'paid'] }, 1, 0] }
          },
          pendingEMIs: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          overdueEMIs: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$status', 'pending'] },
                    { $lt: ['$dueDate', new Date()] }
                  ]
                },
                1,
                0
              ]
            }
          },
          totalEMIAmount: { $sum: '$emiAmount' },
          totalPaidAmount: {
            $sum: {
              $cond: [{ $eq: ['$status', 'paid'] }, '$emiAmount', 0]
            }
          },
          totalPendingAmount: {
            $sum: {
              $cond: [{ $eq: ['$status', 'pending'] }, '$emiAmount', 0]
            }
          }
        }
      }
    ]);

    // Get payment summary
    const paymentStats = await Payment.aggregate([
      { $match: { memberId: new mongoose.Types.ObjectId(memberId) } },
      {
        $group: {
          _id: null,
          totalPayments: { $sum: 1 },
          successfulPayments: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          pendingPayments: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          totalPaidAmount: {
            $sum: {
              $cond: [{ $eq: ['$status', 'completed'] }, '$amount', 0]
            }
          }
        }
      }
    ]);

    return {
      loans: {
        totalLoans: loanStats[0]?.totalLoans || 0,
        totalLoanAmount: loanStats[0]?.totalLoanAmount || 0,
        totalDisbursedAmount: loanStats[0]?.totalDisbursedAmount || 0,
        pendingLoans: loanStats[0]?.pendingLoans || 0,
        approvedLoans: loanStats[0]?.approvedLoans || 0,
        disbursedLoans: loanStats[0]?.disbursedLoans || 0
      },
      investments: {
        totalInvestments: investmentStats[0]?.totalInvestments || 0,
        totalInvestmentAmount: investmentStats[0]?.totalInvestmentAmount || 0,
        totalMaturityAmount: investmentStats[0]?.totalMaturityAmount || 0,
        activeInvestments: investmentStats[0]?.activeInvestments || 0,
        completedInvestments: investmentStats[0]?.completedInvestments || 0
      },
      emis: {
        totalEMIs: emiStats[0]?.totalEMIs || 0,
        paidEMIs: emiStats[0]?.paidEMIs || 0,
        pendingEMIs: emiStats[0]?.pendingEMIs || 0,
        overdueEMIs: emiStats[0]?.overdueEMIs || 0,
        totalEMIAmount: emiStats[0]?.totalEMIAmount || 0,
        totalPaidAmount: emiStats[0]?.totalPaidAmount || 0,
        totalPendingAmount: emiStats[0]?.totalPendingAmount || 0,
        paymentRate: emiStats[0]?.totalEMIs > 0 
          ? Math.round((emiStats[0].paidEMIs / emiStats[0].totalEMIs) * 100) 
          : 0
      },
      payments: {
        totalPayments: paymentStats[0]?.totalPayments || 0,
        successfulPayments: paymentStats[0]?.successfulPayments || 0,
        pendingPayments: paymentStats[0]?.pendingPayments || 0,
        totalPaidAmount: paymentStats[0]?.totalPaidAmount || 0,
        successRate: paymentStats[0]?.totalPayments > 0 
          ? Math.round((paymentStats[0].successfulPayments / paymentStats[0].totalPayments) * 100) 
          : 0
      }
    };

  } catch (error) {
    console.error('Error getting account summary:', error);
    return {
      loans: { totalLoans: 0, totalLoanAmount: 0, totalDisbursedAmount: 0, pendingLoans: 0, approvedLoans: 0, disbursedLoans: 0 },
      investments: { totalInvestments: 0, totalInvestmentAmount: 0, totalMaturityAmount: 0, activeInvestments: 0, completedInvestments: 0 },
      emis: { totalEMIs: 0, paidEMIs: 0, pendingEMIs: 0, overdueEMIs: 0, totalEMIAmount: 0, totalPaidAmount: 0, totalPendingAmount: 0, paymentRate: 0 },
      payments: { totalPayments: 0, successfulPayments: 0, pendingPayments: 0, totalPaidAmount: 0, successRate: 0 }
    };
  }
};

// Get recent activity
const getRecentActivity = async (memberId) => {
  try {
    const recentActivities = [];

    // Get recent loan applications
    const recentLoans = await LoanRequest.find({ memberId: new mongoose.Types.ObjectId(memberId) })
      .sort({ createdAt: -1 })
      .limit(3)
      .select('requestId loanAmount loanPurpose status createdAt');

    recentLoans.forEach(loan => {
      recentActivities.push({
        type: 'loan_application',
        title: 'Loan Application',
        description: `Applied for ₹${loan.loanAmount} loan for ${loan.loanPurpose}`,
        status: loan.status,
        date: loan.createdAt,
        referenceId: loan.requestId
      });
    });

    // Get recent payments
    const recentPayments = await Payment.find({ memberId: new mongoose.Types.ObjectId(memberId) })
      .sort({ paymentDate: -1 })
      .limit(3)
      .select('paymentId amount paymentType status paymentDate');

    recentPayments.forEach(payment => {
      recentActivities.push({
        type: 'payment',
        title: 'Payment Made',
        description: `Payment of ₹${payment.amount} via ${payment.paymentType}`,
        status: payment.status,
        date: payment.paymentDate,
        referenceId: payment.paymentId
      });
    });

    // Get recent investments
    const recentInvestments = await Investment.find({ memberId: new mongoose.Types.ObjectId(memberId) })
      .sort({ investmentDate: -1 })
      .limit(3)
      .select('investmentId principalAmount status investmentDate')
      .populate('planId', 'planName');

    recentInvestments.forEach(investment => {
      recentActivities.push({
        type: 'investment',
        title: 'Investment Made',
        description: `Invested ₹${investment.principalAmount} in ${investment.planId?.planName || 'Plan'}`,
        status: investment.status,
        date: investment.investmentDate,
        referenceId: investment.investmentId
      });
    });

    // Sort by date and return top 10
    return recentActivities
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);

  } catch (error) {
    console.error('Error getting recent activity:', error);
    return [];
  }
};

// Calculate profile completeness
const calculateProfileCompleteness = (member, kycInfo) => {
  const fields = [
    { field: 'firstName', value: member.firstName, weight: 10 },
    { field: 'lastName', value: member.lastName, weight: 10 },
    { field: 'email', value: member.email, weight: 15 },
    { field: 'phoneNumber', value: member.phoneNumber, weight: 15 },
    { field: 'dateOfBirth', value: member.dateOfBirth, weight: 10 },
    { field: 'address', value: member.address, weight: 10 },
    { field: 'city', value: member.city, weight: 5 },
    { field: 'state', value: member.state, weight: 5 },
    { field: 'pincode', value: member.pincode, weight: 5 },
    { field: 'emergencyContact', value: member.emergencyContact, weight: 10 },
    { field: 'emergencyPhone', value: member.emergencyPhone, weight: 5 }
  ];

  let totalWeight = 0;
  let completedWeight = 0;

  fields.forEach(field => {
    totalWeight += field.weight;
    if (field.value && field.value.toString().trim() !== '') {
      completedWeight += field.weight;
    }
  });

  const completeness = Math.round((completedWeight / totalWeight) * 100);

  return {
    percentage: completeness,
    completedFields: fields.filter(f => f.value && f.value.toString().trim() !== '').length,
    totalFields: fields.length,
    missingFields: fields.filter(f => !f.value || f.value.toString().trim() === '').map(f => f.field)
  };
};

// Get member status
const getMemberStatus = (member, kycInfo) => {
  const status = {
    isActive: member.isActive,
    isVerified: member.isVerified,
    kycStatus: kycInfo?.kycStatus || 'not_submitted',
    hasProfilePicture: !!member.profilePicture,
    hasCompleteProfile: calculateProfileCompleteness(member, kycInfo).percentage >= 80,
    canApplyForLoan: member.isActive && member.isVerified && kycInfo?.kycStatus === 'approved',
    canMakeInvestments: member.isActive && member.isVerified && kycInfo?.kycStatus === 'approved',
    canMakePayments: member.isActive && member.isVerified
  };

  // Determine overall status
  if (!member.isActive) {
    status.overallStatus = 'inactive';
    status.statusMessage = 'Account is inactive';
  } else if (!member.isVerified) {
    status.overallStatus = 'unverified';
    status.statusMessage = 'Account is not verified';
  } else if (kycInfo?.kycStatus === 'pending') {
    status.overallStatus = 'kyc_pending';
    status.statusMessage = 'KYC verification is pending';
  } else if (kycInfo?.kycStatus === 'rejected') {
    status.overallStatus = 'kyc_rejected';
    status.statusMessage = 'KYC verification was rejected';
  } else if (kycInfo?.kycStatus === 'approved') {
    status.overallStatus = 'active';
    status.statusMessage = 'Account is fully active';
  } else {
    status.overallStatus = 'kyc_required';
    status.statusMessage = 'KYC verification is required';
  }

  return status;
};

module.exports = {
  getMemberProfile,
  getAccountSummary,
  getRecentActivity,
  calculateProfileCompleteness,
  getMemberStatus
};
