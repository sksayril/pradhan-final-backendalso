const EMIRecord = require('../models/emiRecord.model');
const Payment = require('../models/payment.model');
const Investment = require('../models/investment.model');
const SocietyMember = require('../models/societyMember.model');
const { validationResult } = require('express-validator');

// Generate EMI schedule for investment
const generateEMISchedule = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { investmentId } = req.params;
    const adminId = req.user.id;

    // Get investment details
    const investment = await Investment.findById(investmentId)
      .populate('planId')
      .populate('memberId');

    if (!investment) {
      return res.status(404).json({
        success: false,
        message: 'Investment not found'
      });
    }

    // Check if EMI schedule already exists
    const existingEMIs = await EMIRecord.find({ investmentId });
    if (existingEMIs.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'EMI schedule already exists for this investment'
      });
    }

    // Generate EMI schedule based on plan type
    const emiSchedule = await generateEMIScheduleForInvestment(investment, adminId);

    res.status(201).json({
      success: true,
      message: 'EMI schedule generated successfully',
      data: {
        investmentId: investment.investmentId,
        memberDetails: {
          memberId: investment.memberId.memberId,
          name: `${investment.memberId.firstName} ${investment.memberId.lastName}`
        },
        planDetails: {
          planName: investment.planId.planName,
          planType: investment.planId.planType,
          interestRate: investment.planId.interestRate,
          tenureMonths: investment.planId.tenureMonths
        },
        emiSchedule: emiSchedule.map(emi => emi.getEMISummary())
      }
    });

  } catch (error) {
    console.error('Error generating EMI schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get EMI schedule for investment
const getEMISchedule = async (req, res) => {
  try {
    const { investmentId } = req.params;
    const { status, overdue } = req.query;

    const investment = await Investment.findById(investmentId)
      .populate('planId')
      .populate('memberId');

    if (!investment) {
      return res.status(404).json({
        success: false,
        message: 'Investment not found'
      });
    }

    const query = { investmentId };
    if (status) query.status = status;
    if (overdue === 'true') {
      query.dueDate = { $lt: new Date() };
      query.status = 'pending';
    }

    const emiRecords = await EMIRecord.find(query)
      .populate('paymentIds', 'paymentId amount status paymentDate')
      .sort({ emiNumber: 1 });

    // Calculate summary
    const totalEMIs = emiRecords.length;
    const paidEMIs = emiRecords.filter(emi => emi.status === 'paid').length;
    const pendingEMIs = emiRecords.filter(emi => emi.status === 'pending').length;
    const overdueEMIs = emiRecords.filter(emi => emi.isOverdue()).length;

    const totalEMIAmount = emiRecords.reduce((sum, emi) => sum + emi.emiAmount, 0);
    const totalPaidAmount = emiRecords.reduce((sum, emi) => sum + emi.totalPaidAmount, 0);
    const totalPendingAmount = emiRecords
      .filter(emi => emi.status === 'pending')
      .reduce((sum, emi) => sum + emi.emiAmount, 0);
    const totalPenaltyAmount = emiRecords.reduce((sum, emi) => sum + emi.penaltyAmount, 0);

    res.status(200).json({
      success: true,
      message: 'EMI schedule retrieved successfully',
      data: {
        investmentDetails: {
          investmentId: investment.investmentId,
          planName: investment.planId.planName,
          planType: investment.planId.planType,
          principalAmount: investment.principalAmount,
          expectedMaturityAmount: investment.expectedMaturityAmount
        },
        memberDetails: {
          memberId: investment.memberId.memberId,
          name: `${investment.memberId.firstName} ${investment.memberId.lastName}`,
          email: investment.memberId.email
        },
        emiSummary: {
          totalEMIs: totalEMIs,
          paidEMIs: paidEMIs,
          pendingEMIs: pendingEMIs,
          overdueEMIs: overdueEMIs,
          totalEMIAmount: totalEMIAmount,
          totalPaidAmount: totalPaidAmount,
          totalPendingAmount: totalPendingAmount,
          totalPenaltyAmount: totalPenaltyAmount,
          completionPercentage: totalEMIs > 0 ? Math.round((paidEMIs / totalEMIs) * 100) : 0
        },
        emiRecords: emiRecords.map(emi => emi.getEMISummary())
      }
    });

  } catch (error) {
    console.error('Error getting EMI schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get overdue EMIs
const getOverdueEMIs = async (req, res) => {
  try {
    const { 
      memberId, 
      investmentId, 
      gracePeriodOnly = false,
      page = 1, 
      limit = 10 
    } = req.query;

    const options = {};
    if (memberId) options.memberId = memberId;
    if (investmentId) options.investmentId = investmentId;
    if (gracePeriodOnly) options.gracePeriodOnly = true;

    const overdueEMIs = await EMIRecord.getOverdueEMIs(options)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalOverdueEMIs = await EMIRecord.countDocuments({
      status: 'pending',
      dueDate: { $lt: new Date() }
    });

    // Calculate total overdue amount
    const totalOverdueAmount = overdueEMIs.reduce((sum, emi) => sum + emi.emiAmount, 0);
    const totalPenaltyAmount = overdueEMIs.reduce((sum, emi) => sum + emi.penaltyAmount, 0);

    res.status(200).json({
      success: true,
      message: 'Overdue EMIs retrieved successfully',
      data: {
        overdueEMIs: overdueEMIs.map(emi => ({
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
          totalOverdueEMIs: totalOverdueEMIs,
          totalOverdueAmount: totalOverdueAmount,
          totalPenaltyAmount: totalPenaltyAmount,
          gracePeriodEMIs: overdueEMIs.filter(emi => emi.isInGracePeriod()).length
        },
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalOverdueEMIs / limit),
          totalOverdueEMIs: totalOverdueEMIs,
          hasNext: page < Math.ceil(totalOverdueEMIs / limit),
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error getting overdue EMIs:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Apply penalty to overdue EMI
const applyPenalty = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { emiId } = req.params;
    const { penaltyAmount, penaltyRate, reason } = req.body;
    const adminId = req.user.id;

    const emiRecord = await EMIRecord.findById(emiId)
      .populate('investmentId')
      .populate('memberId');

    if (!emiRecord) {
      return res.status(404).json({
        success: false,
        message: 'EMI record not found'
      });
    }

    if (emiRecord.status === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Cannot apply penalty to paid EMI'
      });
    }

    if (!emiRecord.isOverdue()) {
      return res.status(400).json({
        success: false,
        message: 'Penalty can only be applied to overdue EMIs'
      });
    }

    // Apply penalty
    emiRecord.applyPenalty(penaltyAmount, penaltyRate, reason, adminId);
    await emiRecord.save();

    // Add note to investment
    const investment = await Investment.findById(emiRecord.investmentId._id);
    if (investment) {
      investment.addNote(
        `Penalty of ₹${penaltyAmount} applied to EMI #${emiRecord.emiNumber}. Reason: ${reason}`,
        adminId
      );
      await investment.save();
    }

    res.status(200).json({
      success: true,
      message: 'Penalty applied successfully',
      data: {
        emiDetails: emiRecord.getEMISummary(),
        penaltyDetails: {
          penaltyAmount: penaltyAmount,
          penaltyRate: penaltyRate,
          reason: reason,
          appliedBy: adminId,
          appliedDate: new Date()
        },
        memberDetails: {
          memberId: emiRecord.memberId.memberId,
          name: `${emiRecord.memberId.firstName} ${emiRecord.memberId.lastName}`
        }
      }
    });

  } catch (error) {
    console.error('Error applying penalty:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Waive penalty for EMI
const waivePenalty = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { emiId } = req.params;
    const { reason } = req.body;
    const adminId = req.user.id;

    const emiRecord = await EMIRecord.findById(emiId)
      .populate('investmentId')
      .populate('memberId');

    if (!emiRecord) {
      return res.status(404).json({
        success: false,
        message: 'EMI record not found'
      });
    }

    if (!emiRecord.penaltyDetails.isPenaltyApplied) {
      return res.status(400).json({
        success: false,
        message: 'No penalty has been applied to this EMI'
      });
    }

    if (emiRecord.penaltyDetails.penaltyWaived) {
      return res.status(400).json({
        success: false,
        message: 'Penalty has already been waived for this EMI'
      });
    }

    // Waive penalty
    emiRecord.waivePenalty(adminId, reason);
    await emiRecord.save();

    // Add note to investment
    const investment = await Investment.findById(emiRecord.investmentId._id);
    if (investment) {
      investment.addNote(
        `Penalty of ₹${emiRecord.penaltyAmount} waived for EMI #${emiRecord.emiNumber}. Reason: ${reason}`,
        adminId
      );
      await investment.save();
    }

    res.status(200).json({
      success: true,
      message: 'Penalty waived successfully',
      data: {
        emiDetails: emiRecord.getEMISummary(),
        penaltyWaivedDetails: {
          originalPenaltyAmount: emiRecord.penaltyDetails.penaltyAmount,
          waivedBy: adminId,
          waivedDate: new Date(),
          reason: reason
        },
        memberDetails: {
          memberId: emiRecord.memberId.memberId,
          name: `${emiRecord.memberId.firstName} ${emiRecord.memberId.lastName}`
        }
      }
    });

  } catch (error) {
    console.error('Error waiving penalty:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get EMI statistics
const getEMIStatistics = async (req, res) => {
  try {
    const { 
      memberId, 
      investmentId, 
      startDate, 
      endDate 
    } = req.query;

    const filters = {};
    if (memberId) filters.memberId = memberId;
    if (investmentId) filters.investmentId = investmentId;
    if (startDate && endDate) {
      filters.startDate = startDate;
      filters.endDate = endDate;
    }

    const statistics = await EMIRecord.getEMIStatistics(filters);

    // Get additional insights
    const totalEMIs = await EMIRecord.countDocuments();
    const overdueEMIs = await EMIRecord.countDocuments({
      status: 'pending',
      dueDate: { $lt: new Date() }
    });
    const gracePeriodEMIs = await EMIRecord.countDocuments({
      status: 'pending',
      dueDate: { $lt: new Date() },
      gracePeriodEndDate: { $gte: new Date() }
    });

    res.status(200).json({
      success: true,
      message: 'EMI statistics retrieved successfully',
      data: {
        statistics: statistics[0] || {
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
          totalEMIs: totalEMIs,
          overdueEMIs: overdueEMIs,
          gracePeriodEMIs: gracePeriodEMIs,
          overduePercentage: totalEMIs > 0 ? Math.round((overdueEMIs / totalEMIs) * 100) : 0,
          gracePeriodPercentage: overdueEMIs > 0 ? Math.round((gracePeriodEMIs / overdueEMIs) * 100) : 0
        },
        period: {
          startDate: startDate || 'All time',
          endDate: endDate || 'All time'
        }
      }
    });

  } catch (error) {
    console.error('Error getting EMI statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Send EMI reminder
const sendEMIReminder = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { emiId } = req.params;
    const { reminderType, reminderMethod, message } = req.body;

    const emiRecord = await EMIRecord.findById(emiId)
      .populate('memberId')
      .populate('investmentId');

    if (!emiRecord) {
      return res.status(404).json({
        success: false,
        message: 'EMI record not found'
      });
    }

    if (emiRecord.status === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Cannot send reminder for paid EMI'
      });
    }

    // Add reminder record
    emiRecord.addReminder({
      reminderType: reminderType,
      sentTo: emiRecord.memberId.email,
      reminderMethod: reminderMethod,
      status: 'sent'
    });

    await emiRecord.save();

    // In real implementation, send actual email/SMS/WhatsApp
    // await sendReminderNotification(emiRecord, reminderType, reminderMethod, message);

    res.status(200).json({
      success: true,
      message: 'EMI reminder sent successfully',
      data: {
        emiDetails: emiRecord.getEMISummary(),
        reminderDetails: {
          reminderType: reminderType,
          reminderMethod: reminderMethod,
          sentTo: emiRecord.memberId.email,
          sentDate: new Date(),
          message: message
        },
        memberDetails: {
          memberId: emiRecord.memberId.memberId,
          name: `${emiRecord.memberId.firstName} ${emiRecord.memberId.lastName}`
        }
      }
    });

  } catch (error) {
    console.error('Error sending EMI reminder:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Helper function to generate EMI schedule for investment
const generateEMIScheduleForInvestment = async (investment, adminId) => {
  const { planId, principalAmount, investmentDate, memberId } = investment;
  const { planType, interestRate, tenureMonths } = planId;

  const emiRecords = [];
  const monthlyRate = interestRate / (12 * 100);

  if (planType === 'RD') {
    // For RD, monthly installments are fixed
    const monthlyInstallment = investment.monthlyInstallment || principalAmount / tenureMonths;
    
    for (let i = 1; i <= tenureMonths; i++) {
      const dueDate = new Date(investmentDate);
      dueDate.setMonth(dueDate.getMonth() + i);
      
      const gracePeriodEndDate = new Date(dueDate);
      gracePeriodEndDate.setDate(gracePeriodEndDate.getDate() + 5); // 5 days grace period

      // Calculate principal and interest components
      const principalComponent = monthlyInstallment;
      const interestComponent = 0; // For RD, interest is calculated at maturity
      const remainingPrincipal = principalAmount - (i * monthlyInstallment);
      const cumulativeInterest = 0; // Will be calculated at maturity

      const emiRecord = new EMIRecord({
        investmentId: investment._id,
        memberId: memberId,
        planId: planId._id,
        emiNumber: i,
        emiAmount: monthlyInstallment,
        dueDate: dueDate,
        gracePeriodEndDate: gracePeriodEndDate,
        calculationDetails: {
          principalComponent: principalComponent,
          interestComponent: interestComponent,
          remainingPrincipal: Math.max(0, remainingPrincipal),
          cumulativeInterest: cumulativeInterest
        },
        createdBy: adminId
      });

      await emiRecord.save();
      emiRecords.push(emiRecord);
    }
  } else if (planType === 'FD') {
    // For FD, typically one-time payment, but can have monthly interest payouts
    const monthlyInterest = (principalAmount * monthlyRate);
    
    for (let i = 1; i <= tenureMonths; i++) {
      const dueDate = new Date(investmentDate);
      dueDate.setMonth(dueDate.getMonth() + i);
      
      const gracePeriodEndDate = new Date(dueDate);
      gracePeriodEndDate.setDate(gracePeriodEndDate.getDate() + 5);

      const emiRecord = new EMIRecord({
        investmentId: investment._id,
        memberId: memberId,
        planId: planId._id,
        emiNumber: i,
        emiAmount: monthlyInterest,
        dueDate: dueDate,
        gracePeriodEndDate: gracePeriodEndDate,
        calculationDetails: {
          principalComponent: 0,
          interestComponent: monthlyInterest,
          remainingPrincipal: principalAmount,
          cumulativeInterest: monthlyInterest * i
        },
        createdBy: adminId
      });

      await emiRecord.save();
      emiRecords.push(emiRecord);
    }
  }

  return emiRecords;
};

module.exports = {
  generateEMISchedule,
  getEMISchedule,
  getOverdueEMIs,
  applyPenalty,
  waivePenalty,
  getEMIStatistics,
  sendEMIReminder
};
