const Payment = require('../models/payment.model');
const EMIRecord = require('../models/emiRecord.model');
const Investment = require('../models/investment.model');
const SocietyMember = require('../models/societyMember.model');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

// Get all pending cash payments
const getPendingCashPayments = async (req, res) => {
  try {
    const { 
      memberId, 
      investmentId, 
      startDate, 
      endDate, 
      page = 1, 
      limit = 10 
    } = req.query;

    const query = {
      paymentType: 'cash',
      status: 'pending',
      verificationStatus: 'pending'
    };

    if (memberId) query.memberId = new mongoose.Types.ObjectId(memberId);
    if (investmentId) query.investmentId = new mongoose.Types.ObjectId(investmentId);
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const pendingPayments = await Payment.find(query)
      .populate('investmentId', 'investmentId principalAmount')
      .populate('planId', 'planName planType interestRate')
      .populate('memberId', 'firstName lastName memberId email phoneNumber')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalPendingPayments = await Payment.countDocuments(query);

    res.status(200).json({
      success: true,
      message: 'Pending cash payments retrieved successfully',
      data: {
        pendingPayments: pendingPayments.map(payment => ({
          ...payment.getPaymentSummary(),
          memberDetails: {
            name: `${payment.memberId.firstName} ${payment.memberId.lastName}`,
            memberId: payment.memberId.memberId,
            email: payment.memberId.email,
            phoneNumber: payment.memberId.phoneNumber
          },
          investmentDetails: {
            investmentId: payment.investmentId.investmentId,
            planName: payment.planId.planName,
            planType: payment.planId.planType
          }
        })),
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalPendingPayments / limit),
          totalPendingPayments: totalPendingPayments,
          hasNext: page < Math.ceil(totalPendingPayments / limit),
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error getting pending cash payments:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Verify and approve cash payment
const verifyCashPayment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { paymentId } = req.params;
    const { 
      verificationStatus, 
      remarks, 
      receiptNumber, 
      receivedAmount 
    } = req.body;
    const adminId = req.user.id;

    const payment = await Payment.findOne({
      paymentId: paymentId,
      paymentType: 'cash',
      status: 'pending'
    })
    .populate('investmentId')
    .populate('memberId')
    .populate('planId');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Cash payment not found or already processed'
      });
    }

    // Update payment verification
    payment.verifyPayment(adminId, verificationStatus, remarks);
    
    if (verificationStatus === 'verified') {
      payment.status = 'completed';
      payment.processedDate = new Date();
      payment.cashPaymentDetails = {
        receivedBy: adminId,
        receivedDate: new Date(),
        receiptNumber: receiptNumber,
        remarks: remarks
      };

      // Update EMI record if applicable
      if (payment.emiNumber) {
        await updateEMIRecord(payment);
      }

      // Update investment payment history
      await updateInvestmentPaymentHistory(payment);
    } else if (verificationStatus === 'rejected') {
      payment.status = 'failed';
    }

    await payment.save();

    res.status(200).json({
      success: true,
      message: `Cash payment ${verificationStatus} successfully`,
      data: {
        paymentDetails: payment.getPaymentSummary(),
        verificationDetails: {
          verificationStatus: verificationStatus,
          verifiedBy: adminId,
          verifiedDate: new Date(),
          remarks: remarks,
          receiptNumber: receiptNumber
        },
        memberDetails: {
          name: `${payment.memberId.firstName} ${payment.memberId.lastName}`,
          memberId: payment.memberId.memberId,
          email: payment.memberId.email
        },
        investmentDetails: {
          investmentId: payment.investmentId.investmentId,
          planName: payment.planId.planName,
          planType: payment.planId.planType
        }
      }
    });

  } catch (error) {
    console.error('Error verifying cash payment:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get all pending EMIs for admin
const getAllPendingEMIs = async (req, res) => {
  try {
    const { 
      memberId, 
      investmentId, 
      month, 
      year, 
      overdue, 
      page = 1, 
      limit = 10 
    } = req.query;

    const query = { status: 'pending' };
    
    if (memberId) query.memberId = new mongoose.Types.ObjectId(memberId);
    if (investmentId) query.investmentId = investmentId;
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      query.dueDate = { $gte: startDate, $lte: endDate };
    }
    if (overdue === 'true') {
      query.dueDate = { $lt: new Date() };
    }

    const pendingEMIs = await EMIRecord.find(query)
      .populate('investmentId', 'investmentId principalAmount')
      .populate('planId', 'planName planType interestRate')
      .populate('memberId', 'firstName lastName memberId email phoneNumber')
      .sort({ dueDate: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalPendingEMIs = await EMIRecord.countDocuments(query);

    // Calculate summary
    const totalPendingAmount = pendingEMIs.reduce((sum, emi) => sum + emi.emiAmount, 0);
    const totalPenaltyAmount = pendingEMIs.reduce((sum, emi) => sum + emi.penaltyAmount, 0);
    const overdueEMIs = pendingEMIs.filter(emi => emi.isOverdue()).length;

    res.status(200).json({
      success: true,
      message: 'All pending EMIs retrieved successfully',
      data: {
        pendingEMIs: pendingEMIs.map(emi => ({
          ...emi.getEMISummary(),
          memberDetails: {
            name: `${emi.memberId.firstName} ${emi.memberId.lastName}`,
            memberId: emi.memberId.memberId,
            email: emi.memberId.email,
            phoneNumber: emi.memberId.phoneNumber
          },
          investmentDetails: {
            investmentId: emi.investmentId.investmentId,
            planName: emi.planId.planName,
            planType: emi.planId.planType
          }
        })),
        summary: {
          totalPendingEMIs: totalPendingEMIs,
          totalPendingAmount: totalPendingAmount,
          totalPenaltyAmount: totalPenaltyAmount,
          overdueEMIs: overdueEMIs,
          gracePeriodEMIs: pendingEMIs.filter(emi => emi.isInGracePeriod()).length
        },
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalPendingEMIs / limit),
          totalPendingEMIs: totalPendingEMIs,
          hasNext: page < Math.ceil(totalPendingEMIs / limit),
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error getting all pending EMIs:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get pending EMIs grouped by month for admin
const getPendingEMIsGroupedByMonth = async (req, res) => {
  try {
    const { memberId, investmentId } = req.query;

    const options = {};
    if (memberId) options.memberId = new mongoose.Types.ObjectId(memberId);
    if (investmentId) options.investmentId = investmentId;

    const pendingEMIsByMonth = await EMIRecord.getPendingEMIsGroupedByMonth(options);

    // Calculate overall summary
    const totalPendingEMIs = pendingEMIsByMonth.reduce((sum, month) => sum + month.count, 0);
    const totalPendingAmount = pendingEMIsByMonth.reduce((sum, month) => sum + month.totalAmount, 0);
    const totalPenaltyAmount = pendingEMIsByMonth.reduce((sum, month) => sum + month.totalPenalty, 0);

    res.status(200).json({
      success: true,
      message: 'Pending EMIs grouped by month retrieved successfully',
      data: {
        pendingEMIsByMonth: pendingEMIsByMonth.map(month => ({
          month: month._id.month,
          year: month._id.year,
          monthName: new Date(month._id.year, month._id.month - 1).toLocaleString('default', { month: 'long' }),
          emiCount: month.count,
          totalAmount: month.totalAmount,
          totalPenalty: month.totalPenalty,
          emis: month.emis.map(emi => ({
            ...emi.getEMISummary(),
            memberDetails: {
              name: `${emi.memberId.firstName} ${emi.memberId.lastName}`,
              memberId: emi.memberId.memberId,
              email: emi.memberId.email,
              phoneNumber: emi.memberId.phoneNumber
            },
            investmentDetails: {
              investmentId: emi.investmentId.investmentId,
              planName: emi.planId.planName,
              planType: emi.planId.planType
            }
          }))
        })),
        overallSummary: {
          totalPendingEMIs: totalPendingEMIs,
          totalPendingAmount: totalPendingAmount,
          totalPenaltyAmount: totalPenaltyAmount,
          monthsWithPendingEMIs: pendingEMIsByMonth.length
        }
      }
    });

  } catch (error) {
    console.error('Error getting pending EMIs grouped by month:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get payment statistics for admin
const getPaymentStatistics = async (req, res) => {
  try {
    const { 
      startDate, 
      endDate, 
      memberId, 
      investmentId 
    } = req.query;

    const filters = {};
    if (startDate && endDate) {
      filters.startDate = startDate;
      filters.endDate = endDate;
    }
    if (memberId) filters.memberId = new mongoose.Types.ObjectId(memberId);
    if (investmentId) filters.investmentId = investmentId;

    // Get payment statistics
    const paymentStats = await Payment.getPaymentStatistics(filters);
    
    // Get EMI statistics
    const emiStats = await EMIRecord.getEMIStatistics(filters);

    // Get additional insights
    const totalCashPayments = await Payment.countDocuments({ paymentType: 'cash' });
    const totalOnlinePayments = await Payment.countDocuments({ paymentType: 'online' });
    const pendingCashPayments = await Payment.countDocuments({ 
      paymentType: 'cash', 
      status: 'pending' 
    });
    const pendingVerifications = await Payment.countDocuments({ 
      verificationStatus: 'pending' 
    });

    res.status(200).json({
      success: true,
      message: 'Payment statistics retrieved successfully',
      data: {
        paymentStatistics: paymentStats[0] || {
          totalPayments: 0,
          totalAmount: 0,
          completedPayments: 0,
          completedAmount: 0,
          pendingPayments: 0,
          pendingAmount: 0,
          failedPayments: 0,
          failedAmount: 0
        },
        emiStatistics: emiStats[0] || {
          totalEMIs: 0,
          totalEMIAmount: 0,
          paidEMIs: 0,
          paidAmount: 0,
          pendingEMIs: 0,
          pendingAmount: 0,
          overdueEMIs: 0,
          overdueAmount: 0,
          totalPenaltyAmount: 0
        },
        insights: {
          totalCashPayments: totalCashPayments,
          totalOnlinePayments: totalOnlinePayments,
          pendingCashPayments: pendingCashPayments,
          pendingVerifications: pendingVerifications,
          cashVsOnlineRatio: totalCashPayments > 0 ? 
            Math.round((totalOnlinePayments / totalCashPayments) * 100) : 0
        },
        period: {
          startDate: startDate || 'All time',
          endDate: endDate || 'All time'
        }
      }
    });

  } catch (error) {
    console.error('Error getting payment statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get member payment summary for admin
const getMemberPaymentSummary = async (req, res) => {
  try {
    const { memberId } = req.params;

    // Verify member exists
    const member = await SocietyMember.findById(memberId);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    // Get all investments for the member
    const investments = await Investment.find({ memberId: new mongoose.Types.ObjectId(memberId) })
      .populate('planId', 'planName planType interestRate tenureMonths');

    const investmentSummaries = [];

    for (const investment of investments) {
      const emiRecords = await EMIRecord.getEMIsByInvestment(investment._id);
      const payments = await Payment.getPaymentsByInvestment(investment._id);
      
      const totalEMIs = emiRecords.length;
      const paidEMIs = emiRecords.filter(emi => emi.status === 'paid').length;
      const pendingEMIs = emiRecords.filter(emi => emi.status === 'pending').length;
      const overdueEMIs = emiRecords.filter(emi => emi.isOverdue()).length;
      
      const totalPaidAmount = payments
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + p.amount, 0);
      
      const totalPendingAmount = emiRecords
        .filter(emi => emi.status === 'pending')
        .reduce((sum, emi) => sum + emi.emiAmount, 0);

      investmentSummaries.push({
        investmentId: investment.investmentId,
        planName: investment.planId.planName,
        planType: investment.planId.planType,
        principalAmount: investment.principalAmount,
        expectedMaturityAmount: investment.expectedMaturityAmount,
        emiProgress: {
          total: totalEMIs,
          paid: paidEMIs,
          pending: pendingEMIs,
          overdue: overdueEMIs
        },
        paymentSummary: {
          totalPaid: totalPaidAmount,
          totalPending: totalPendingAmount,
          completionPercentage: totalEMIs > 0 ? Math.round((paidEMIs / totalEMIs) * 100) : 0
        },
        nextDueDate: emiRecords
          .filter(emi => emi.status === 'pending')
          .sort((a, b) => a.dueDate - b.dueDate)[0]?.dueDate || null,
        status: investment.status
      });
    }

    // Get overall payment statistics
    const allPayments = await Payment.getPaymentsByMember(memberId);
    const cashPayments = allPayments.filter(p => p.paymentType === 'cash');
    const onlinePayments = allPayments.filter(p => p.paymentType === 'online');

    res.status(200).json({
      success: true,
      message: 'Member payment summary retrieved successfully',
      data: {
        memberDetails: {
          memberId: member.memberId,
          name: `${member.firstName} ${member.lastName}`,
          email: member.email,
          phoneNumber: member.phoneNumber
        },
        investmentSummary: {
          totalInvestments: investments.length,
          investments: investmentSummaries
        },
        paymentSummary: {
          totalPayments: allPayments.length,
          cashPayments: cashPayments.length,
          onlinePayments: onlinePayments.length,
          totalPaidAmount: allPayments
            .filter(p => p.status === 'completed')
            .reduce((sum, p) => sum + p.amount, 0),
          pendingPayments: allPayments.filter(p => p.status === 'pending').length
        }
      }
    });

  } catch (error) {
    console.error('Error getting member payment summary:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Helper function to update EMI record
const updateEMIRecord = async (payment) => {
  if (payment.emiNumber) {
    const emiRecord = await EMIRecord.findOne({
      investmentId: payment.investmentId,
      emiNumber: payment.emiNumber
    });

    if (emiRecord) {
      emiRecord.markAsPaid(payment.amount, payment._id, payment.processedDate);
      await emiRecord.save();
    }
  }
};

// Helper function to update investment payment history
const updateInvestmentPaymentHistory = async (payment) => {
  const investment = await Investment.findById(payment.investmentId);
  if (investment) {
    investment.recordPayment(
      payment.amount,
      payment.paymentFor,
      payment.emiNumber,
      payment.transactionId,
      `Cash payment - Receipt: ${payment.cashPaymentDetails?.receiptNumber || 'N/A'}`
    );
    await investment.save();
  }
};

module.exports = {
  getPendingCashPayments,
  verifyCashPayment,
  getAllPendingEMIs,
  getPendingEMIsGroupedByMonth,
  getPaymentStatistics,
  getMemberPaymentSummary
};