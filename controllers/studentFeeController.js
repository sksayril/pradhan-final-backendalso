const FeeRequest = require('../models/feeRequest.model');
const FeePayment = require('../models/feePayment.model');
const Student = require('../models/student.model');
const Course = require('../models/course.model');
const Batch = require('../models/batch.model');

// Get student's own fee requests
const getMyFeeRequests = async (req, res) => {
  try {
    const studentId = req.user.id;

    // Get all fee requests for this student
    const feeRequests = await FeeRequest.find({ studentId })
      .populate({
        path: 'courseId',
        select: 'title category type price currency duration durationUnit instructor'
      })
      .populate({
        path: 'batchId',
        select: 'name startDate endDate maxStudents price currency timeSlots'
      })
      .populate({
        path: 'createdBy',
        select: 'firstName lastName email'
      })
      .sort({ createdAt: -1 });

    if (!feeRequests || feeRequests.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No fee requests found for you'
      });
    }

    // Calculate summary statistics
    const summary = {
      totalRequests: feeRequests.length,
      totalAmount: feeRequests.reduce((sum, req) => sum + req.totalAmount, 0),
      totalPaid: feeRequests.reduce((sum, req) => sum + req.paidAmount, 0),
      totalRemaining: feeRequests.reduce((sum, req) => sum + req.remainingAmount, 0),
      pendingRequests: feeRequests.filter(req => req.status === 'pending').length,
      overdueRequests: feeRequests.filter(req => req.status === 'overdue').length,
      paidRequests: feeRequests.filter(req => req.status === 'paid').length,
      partialRequests: feeRequests.filter(req => req.status === 'partial').length
    };

    res.json({
      success: true,
      message: 'Your fee requests retrieved successfully',
      data: {
        summary,
        feeRequests
      }
    });

  } catch (error) {
    console.error('Error getting student fee requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve your fee requests'
    });
  }
};

// Get student's payment history
const getMyPaymentHistory = async (req, res) => {
  try {
    const studentId = req.user.id;

    // Get all payments for this student
    const payments = await FeePayment.find({ studentId })
      .populate({
        path: 'courseId',
        select: 'title category type'
      })
      .populate({
        path: 'batchId',
        select: 'name startDate endDate'
      })
      .populate({
        path: 'collectedBy',
        select: 'firstName lastName email'
      })
      .sort({ paymentDate: -1 });

    if (!payments || payments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No payment history found for you'
      });
    }

    // Calculate summary statistics
    const summary = {
      totalPayments: payments.length,
      totalAmountPaid: payments.reduce((sum, payment) => sum + payment.amount, 0),
      cashPayments: payments.filter(p => p.paymentMethod === 'cash').length,
      onlinePayments: payments.filter(p => p.paymentMethod === 'online').length,
      bankTransferPayments: payments.filter(p => p.paymentMethod === 'bank_transfer').length,
      chequePayments: payments.filter(p => p.paymentMethod === 'cheque').length
    };

    res.json({
      success: true,
      message: 'Your payment history retrieved successfully',
      data: {
        summary,
        payments
      }
    });

  } catch (error) {
    console.error('Error getting student payment history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve your payment history'
    });
  }
};

// Get student's pending fees
const getMyPendingFees = async (req, res) => {
  try {
    const studentId = req.user.id;

    // Get pending and overdue fee requests
    const pendingFees = await FeeRequest.find({ 
      studentId,
      status: { $in: ['pending', 'overdue', 'partial'] }
    })
      .populate({
        path: 'courseId',
        select: 'title category type price currency duration durationUnit instructor'
      })
      .populate({
        path: 'batchId',
        select: 'name startDate endDate maxStudents price currency timeSlots'
      })
      .populate({
        path: 'createdBy',
        select: 'firstName lastName email'
      })
      .sort({ dueDate: 1 }); // Sort by due date (earliest first)

    if (!pendingFees || pendingFees.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No pending fees found for you'
      });
    }

    // Calculate summary statistics
    const summary = {
      totalPendingRequests: pendingFees.length,
      totalAmountDue: pendingFees.reduce((sum, req) => sum + req.remainingAmount, 0),
      overdueCount: pendingFees.filter(req => req.status === 'overdue').length,
      pendingCount: pendingFees.filter(req => req.status === 'pending').length,
      partialCount: pendingFees.filter(req => req.status === 'partial').length,
      urgentCount: pendingFees.filter(req => {
        const today = new Date();
        const dueDate = new Date(req.dueDate);
        const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
        return daysUntilDue <= 7 && daysUntilDue >= 0;
      }).length
    };

    // Add urgency information to each fee request
    const feesWithUrgency = pendingFees.map(fee => {
      const today = new Date();
      const dueDate = new Date(fee.dueDate);
      const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
      
      let urgency = 'normal';
      if (fee.status === 'overdue') {
        urgency = 'overdue';
      } else if (daysUntilDue <= 3) {
        urgency = 'urgent';
      } else if (daysUntilDue <= 7) {
        urgency = 'soon';
      }

      return {
        ...fee.toObject(),
        urgency,
        daysUntilDue: fee.status === 'overdue' ? -Math.abs(daysUntilDue) : daysUntilDue
      };
    });

    res.json({
      success: true,
      message: 'Your pending fees retrieved successfully',
      data: {
        summary,
        pendingFees: feesWithUrgency
      }
    });

  } catch (error) {
    console.error('Error getting student pending fees:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve your pending fees'
    });
  }
};

// Get student's fee summary (overview of all fee-related data)
const getMyFeeSummary = async (req, res) => {
  try {
    const studentId = req.user.id;

    // Get all fee requests
    const allFeeRequests = await FeeRequest.find({ studentId });
    
    // Get all payments
    const allPayments = await FeePayment.find({ studentId });

    // Calculate comprehensive summary
    const summary = {
      feeRequests: {
        total: allFeeRequests.length,
        pending: allFeeRequests.filter(req => req.status === 'pending').length,
        overdue: allFeeRequests.filter(req => req.status === 'overdue').length,
        partial: allFeeRequests.filter(req => req.status === 'partial').length,
        paid: allFeeRequests.filter(req => req.status === 'paid').length
      },
      amounts: {
        totalRequested: allFeeRequests.reduce((sum, req) => sum + req.totalAmount, 0),
        totalPaid: allFeeRequests.reduce((sum, req) => sum + req.paidAmount, 0),
        totalRemaining: allFeeRequests.reduce((sum, req) => sum + req.remainingAmount, 0)
      },
      payments: {
        total: allPayments.length,
        totalAmount: allPayments.reduce((sum, payment) => sum + payment.amount, 0),
        byMethod: {
          cash: allPayments.filter(p => p.paymentMethod === 'cash').length,
          online: allPayments.filter(p => p.paymentMethod === 'online').length,
          bank_transfer: allPayments.filter(p => p.paymentMethod === 'bank_transfer').length,
          cheque: allPayments.filter(p => p.paymentMethod === 'cheque').length
        }
      },
      urgency: {
        overdue: allFeeRequests.filter(req => req.status === 'overdue').length,
        dueSoon: allFeeRequests.filter(req => {
          const today = new Date();
          const dueDate = new Date(req.dueDate);
          const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
          return daysUntilDue <= 7 && daysUntilDue >= 0 && req.status !== 'paid';
        }).length
      }
    };

    res.json({
      success: true,
      message: 'Your fee summary retrieved successfully',
      data: {
        summary
      }
    });

  } catch (error) {
    console.error('Error getting student fee summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve your fee summary'
    });
  }
};

module.exports = {
  getMyFeeRequests,
  getMyPaymentHistory,
  getMyPendingFees,
  getMyFeeSummary
};
