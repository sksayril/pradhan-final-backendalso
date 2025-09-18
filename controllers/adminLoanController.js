const LoanRequest = require('../models/loanRequest.model');
const EMIRecord = require('../models/emiRecord.model');
const Payment = require('../models/payment.model');
const SocietyMember = require('../models/societyMember.model');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

// Get all loan requests for admin
const getAllLoanRequests = async (req, res) => {
  try {
    const { 
      status, 
      memberId, 
      startDate, 
      endDate, 
      page = 1, 
      limit = 10 
    } = req.query;

    const options = {};
    if (status) options.status = status;
    if (memberId) options.memberId = new mongoose.Types.ObjectId(memberId);
    if (startDate && endDate) {
      options.startDate = startDate;
      options.endDate = endDate;
    }

    const loanRequests = await LoanRequest.getAllLoanRequests(options)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalRequests = await LoanRequest.countDocuments(
      status ? { status } : {}
    );

    res.status(200).json({
      success: true,
      message: 'Loan requests retrieved successfully',
      data: {
        loanRequests,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalRequests / limit),
          totalRequests,
          hasNext: page * limit < totalRequests,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error getting loan requests:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get loan request details for admin
const getLoanRequestDetails = async (req, res) => {
  try {
    const { requestId } = req.params;

    const loanRequest = await LoanRequest.findOne({ requestId })
      .populate('approvedBy', 'firstName lastName email')
      .populate('memberId', 'firstName lastName memberId email phoneNumber address')
      .populate('emiRecords')
      .populate('paymentRecords');

    if (!loanRequest) {
      return res.status(404).json({
        success: false,
        message: 'Loan request not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Loan request details retrieved successfully',
      data: loanRequest
    });

  } catch (error) {
    console.error('Error getting loan request details:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Approve loan request
const approveLoanRequest = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { requestId } = req.params;
    const { approvalNotes } = req.body;
    const adminId = req.user.id;

    const loanRequest = await LoanRequest.findOne({
      requestId,
      status: 'pending'
    });

    if (!loanRequest) {
      return res.status(404).json({
        success: false,
        message: 'Loan request not found or already processed'
      });
    }

    // Approve the loan request
    loanRequest.approve(adminId, approvalNotes);
    await loanRequest.save();

    res.status(200).json({
      success: true,
      message: 'Loan request approved successfully',
      data: {
        requestId: loanRequest.requestId,
        status: loanRequest.status,
        approvedAt: loanRequest.approvedAt,
        approvedBy: loanRequest.approvedBy
      }
    });

  } catch (error) {
    console.error('Error approving loan request:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Reject loan request
const rejectLoanRequest = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { requestId } = req.params;
    const { rejectionReason } = req.body;
    const adminId = req.user.id;

    const loanRequest = await LoanRequest.findOne({
      requestId,
      status: 'pending'
    });

    if (!loanRequest) {
      return res.status(404).json({
        success: false,
        message: 'Loan request not found or already processed'
      });
    }

    // Reject the loan request
    loanRequest.reject(adminId, rejectionReason);
    await loanRequest.save();

    res.status(200).json({
      success: true,
      message: 'Loan request rejected successfully',
      data: {
        requestId: loanRequest.requestId,
        status: loanRequest.status,
        rejectedAt: loanRequest.approvedAt,
        rejectedBy: loanRequest.approvedBy,
        rejectionReason: loanRequest.rejectionReason
      }
    });

  } catch (error) {
    console.error('Error rejecting loan request:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Disburse loan
const disburseLoan = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { requestId } = req.params;
    const { disbursedAmount, disbursementMethod, disbursementReference } = req.body;
    const adminId = req.user.id;

    const loanRequest = await LoanRequest.findOne({
      requestId,
      status: 'approved'
    });

    if (!loanRequest) {
      return res.status(404).json({
        success: false,
        message: 'Approved loan request not found'
      });
    }

    // Disburse the loan
    loanRequest.disburse(disbursedAmount, disbursementMethod, disbursementReference);
    await loanRequest.save();

    // Create EMI records for the loan
    await createEMIRecordsForLoan(loanRequest);

    res.status(200).json({
      success: true,
      message: 'Loan disbursed successfully and EMI records created',
      data: {
        requestId: loanRequest.requestId,
        status: loanRequest.status,
        disbursedAmount: loanRequest.disbursedAmount,
        disbursedAt: loanRequest.disbursedAt,
        disbursementMethod: loanRequest.disbursementMethod
      }
    });

  } catch (error) {
    console.error('Error disbursing loan:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Helper function to create EMI records for approved loan
const createEMIRecordsForLoan = async (loanRequest) => {
  try {
    const { tenureMonths, emiAmount, interestRate } = loanRequest.emiOptions;
    const emiRecords = [];

    for (let i = 1; i <= tenureMonths; i++) {
      const dueDate = new Date(loanRequest.disbursedAt);
      dueDate.setMonth(dueDate.getMonth() + i);
      
      const gracePeriodEndDate = new Date(dueDate);
      gracePeriodEndDate.setDate(gracePeriodEndDate.getDate() + 5);

      const emiRecord = new EMIRecord({
        emiId: 'EMI' + Date.now().toString().slice(-8) + i,
        investmentId: null, // This is a loan, not an investment
        memberId: loanRequest.memberId,
        planId: null, // This is a loan, not an investment plan
        emiNumber: i,
        emiAmount: emiAmount,
        dueDate: dueDate,
        gracePeriodEndDate: gracePeriodEndDate,
        status: 'pending',
        loanRequestId: loanRequest._id, // Reference to the loan request
        calculationDetails: {
          principalComponent: emiAmount * 0.8, // Assuming 80% principal, 20% interest
          interestComponent: emiAmount * 0.2,
          remainingPrincipal: loanRequest.loanAmount - (i * emiAmount * 0.8),
          cumulativeInterest: i * emiAmount * 0.2
        },
        createdBy: loanRequest.memberId
      });

      await emiRecord.save();
      emiRecords.push(emiRecord._id);
    }

    // Update loan request with EMI record references
    loanRequest.emiRecords = emiRecords;
    await loanRequest.save();

    console.log(`Created ${emiRecords.length} EMI records for loan ${loanRequest.requestId}`);

  } catch (error) {
    console.error('Error creating EMI records for loan:', error);
    throw error;
  }
};

// Get loan statistics
const getLoanStatistics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const options = {};
    if (startDate && endDate) {
      options.startDate = startDate;
      options.endDate = endDate;
    }

    const statistics = await LoanRequest.getLoanStatistics(options);

    // Get additional statistics
    const totalPendingRequests = await LoanRequest.countDocuments({ status: 'pending' });
    const totalApprovedRequests = await LoanRequest.countDocuments({ status: 'approved' });
    const totalDisbursedLoans = await LoanRequest.countDocuments({ status: 'disbursed' });

    res.status(200).json({
      success: true,
      message: 'Loan statistics retrieved successfully',
      data: {
        ...statistics[0],
        additionalStats: {
          totalPendingRequests,
          totalApprovedRequests,
          totalDisbursedLoans
        }
      }
    });

  } catch (error) {
    console.error('Error getting loan statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get member loan summary
const getMemberLoanSummary = async (req, res) => {
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

    // Get all loan requests for the member
    const loanRequests = await LoanRequest.find({ memberId: new mongoose.Types.ObjectId(memberId) })
      .populate('emiRecords')
      .populate('paymentRecords')
      .sort({ createdAt: -1 });

    // Calculate summary statistics
    const summary = {
      member: {
        name: `${member.firstName} ${member.lastName}`,
        memberId: member.memberId,
        email: member.email
      },
      totalLoans: loanRequests.length,
      totalLoanAmount: loanRequests.reduce((sum, loan) => sum + loan.loanAmount, 0),
      totalDisbursedAmount: loanRequests
        .filter(loan => loan.status === 'disbursed')
        .reduce((sum, loan) => sum + (loan.disbursedAmount || 0), 0),
      statusBreakdown: {
        pending: loanRequests.filter(loan => loan.status === 'pending').length,
        approved: loanRequests.filter(loan => loan.status === 'approved').length,
        disbursed: loanRequests.filter(loan => loan.status === 'disbursed').length,
        completed: loanRequests.filter(loan => loan.status === 'completed').length,
        rejected: loanRequests.filter(loan => loan.status === 'rejected').length
      },
      loanRequests: loanRequests.map(loan => ({
        requestId: loan.requestId,
        loanAmount: loan.loanAmount,
        disbursedAmount: loan.disbursedAmount,
        status: loan.status,
        createdAt: loan.createdAt,
        disbursedAt: loan.disbursedAt,
        emiCount: loan.emiRecords.length,
        paidEMIs: loan.emiRecords.filter(emi => emi.status === 'paid').length,
        pendingEMIs: loan.emiRecords.filter(emi => emi.status === 'pending').length
      }))
    };

    res.status(200).json({
      success: true,
      message: 'Member loan summary retrieved successfully',
      data: summary
    });

  } catch (error) {
    console.error('Error getting member loan summary:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  getAllLoanRequests,
  getLoanRequestDetails,
  approveLoanRequest,
  rejectLoanRequest,
  disburseLoan,
  getLoanStatistics,
  getMemberLoanSummary
};
