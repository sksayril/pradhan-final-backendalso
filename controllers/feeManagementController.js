const FeeRequest = require('../models/feeRequest.model');
const FeePayment = require('../models/feePayment.model');
const Student = require('../models/student.model');
const Course = require('../models/course.model');
const Batch = require('../models/batch.model');
const Enrollment = require('../models/enrollment.model');

// Create fee request for a student
const createFeeRequest = async (req, res) => {
  try {
    const {
      studentId,
      courseId,
      batchId,
      totalAmount,
      currency = 'INR',
      paymentMethod,
      dueDate,
      notes
    } = req.body;

    const adminId = req.user.id;

    // Validate required fields
    if (!studentId || !courseId || !batchId || !totalAmount || !paymentMethod || !dueDate) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: studentId, courseId, batchId, totalAmount, paymentMethod, dueDate'
      });
    }

    // Validate payment method
    if (!['online', 'cash'].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: 'Payment method must be either "online" or "cash"'
      });
    }

    // Check if student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if batch exists
    const batch = await Batch.findById(batchId);
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }

    // Check if student is enrolled in this batch
    const enrollment = await Enrollment.findOne({
      studentId,
      courseId,
      batchId,
      status: 'enrolled'
    });

    if (!enrollment) {
      return res.status(400).json({
        success: false,
        message: 'Student is not enrolled in this batch'
      });
    }

    // Check if fee request already exists for this enrollment
    const existingFeeRequest = await FeeRequest.findOne({
      studentId,
      courseId,
      batchId,
      enrollmentId: enrollment._id,
      status: { $in: ['pending', 'partial', 'overdue'] }
    });

    if (existingFeeRequest) {
      return res.status(400).json({
        success: false,
        message: 'Fee request already exists for this student in this batch',
        data: {
          existingFeeRequest: {
            id: existingFeeRequest._id,
            totalAmount: existingFeeRequest.totalAmount,
            paidAmount: existingFeeRequest.paidAmount,
            remainingAmount: existingFeeRequest.remainingAmount,
            status: existingFeeRequest.status
          }
        }
      });
    }

    // Create fee request
    const feeRequest = new FeeRequest({
      studentId,
      courseId,
      batchId,
      enrollmentId: enrollment._id,
      totalAmount,
      currency,
      paymentMethod,
      dueDate: new Date(dueDate),
      notes,
      createdBy: adminId
    });

    await feeRequest.save();

    // Populate the response
    await feeRequest.populate([
      { path: 'studentId', select: 'firstName lastName email studentId' },
      { path: 'courseId', select: 'title category type' },
      { path: 'batchId', select: 'name startDate endDate' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Fee request created successfully',
      data: {
        feeRequest
      }
    });

  } catch (error) {
    console.error('Error creating fee request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create fee request'
    });
  }
};

// Record fee payment (for cash collection or manual entry)
const recordFeePayment = async (req, res) => {
  try {
    const {
      feeRequestId,
      amount,
      paymentMethod,
      transactionId,
      paymentReference,
      notes
    } = req.body;

    const adminId = req.user.id;

    // Validate required fields
    if (!feeRequestId || !amount || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: feeRequestId, amount, paymentMethod'
      });
    }

    // Find the fee request
    const feeRequest = await FeeRequest.findById(feeRequestId);
    if (!feeRequest) {
      return res.status(404).json({
        success: false,
        message: 'Fee request not found'
      });
    }

    // Check if payment amount exceeds remaining amount
    if (amount > feeRequest.remainingAmount) {
      return res.status(400).json({
        success: false,
        message: `Payment amount (${amount}) cannot exceed remaining amount (${feeRequest.remainingAmount})`
      });
    }

    // Create payment record
    const payment = new FeePayment({
      feeRequestId,
      studentId: feeRequest.studentId,
      courseId: feeRequest.courseId,
      batchId: feeRequest.batchId,
      amount,
      currency: feeRequest.currency,
      paymentMethod,
      transactionId,
      paymentReference,
      notes,
      collectedBy: adminId,
      paymentStatus: 'completed'
    });

    await payment.save();

    // Update fee request
    feeRequest.paidAmount += amount;
    feeRequest.lastUpdatedBy = adminId;
    await feeRequest.save();

    // Populate the response
    await payment.populate([
      { path: 'studentId', select: 'firstName lastName email studentId' },
      { path: 'courseId', select: 'title category type' },
      { path: 'batchId', select: 'name startDate endDate' },
      { path: 'collectedBy', select: 'firstName lastName email' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Payment recorded successfully',
      data: {
        payment,
        updatedFeeRequest: {
          id: feeRequest._id,
          totalAmount: feeRequest.totalAmount,
          paidAmount: feeRequest.paidAmount,
          remainingAmount: feeRequest.remainingAmount,
          status: feeRequest.status
        }
      }
    });

  } catch (error) {
    console.error('Error recording payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record payment'
    });
  }
};

// Get all fee requests with filtering and pagination
const getAllFeeRequests = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    const sort = { [sortBy]: sortOrder };

    // Apply filters
    if (req.query.studentId) filter.studentId = req.query.studentId;
    if (req.query.courseId) filter.courseId = req.query.courseId;
    if (req.query.batchId) filter.batchId = req.query.batchId;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.paymentMethod) filter.paymentMethod = req.query.paymentMethod;

    const feeRequests = await FeeRequest.find(filter)
      .populate({
        path: 'studentId',
        select: 'firstName lastName email studentId'
      })
      .populate({
        path: 'courseId',
        select: 'title category type'
      })
      .populate({
        path: 'batchId',
        select: 'name startDate endDate'
      })
      .populate({
        path: 'createdBy',
        select: 'firstName lastName email'
      })
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const totalFeeRequests = await FeeRequest.countDocuments(filter);
    const totalPages = Math.ceil(totalFeeRequests / limit);

    res.json({
      success: true,
      message: 'Fee requests retrieved successfully',
      data: {
        feeRequests,
        pagination: {
          currentPage: page,
          totalPages,
          totalFeeRequests,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error getting fee requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve fee requests'
    });
  }
};

// Get fee requests for a specific student
const getStudentFeeRequests = async (req, res) => {
  try {
    const { studentId } = req.params;

    const feeRequests = await FeeRequest.find({ studentId })
      .populate({
        path: 'courseId',
        select: 'title category type'
      })
      .populate({
        path: 'batchId',
        select: 'name startDate endDate'
      })
      .populate({
        path: 'createdBy',
        select: 'firstName lastName email'
      })
      .sort({ createdAt: -1 });

    if (!feeRequests || feeRequests.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No fee requests found for this student'
      });
    }

    // Calculate summary
    const summary = {
      totalRequests: feeRequests.length,
      totalAmount: feeRequests.reduce((sum, req) => sum + req.totalAmount, 0),
      totalPaid: feeRequests.reduce((sum, req) => sum + req.paidAmount, 0),
      totalRemaining: feeRequests.reduce((sum, req) => sum + req.remainingAmount, 0),
      pendingRequests: feeRequests.filter(req => req.status === 'pending').length,
      overdueRequests: feeRequests.filter(req => req.status === 'overdue').length,
      paidRequests: feeRequests.filter(req => req.status === 'paid').length
    };

    res.json({
      success: true,
      message: `Fee requests retrieved successfully for student ${studentId}`,
      data: {
        summary,
        feeRequests
      }
    });

  } catch (error) {
    console.error('Error getting student fee requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve student fee requests'
    });
  }
};

// Get fee payment history
const getFeePaymentHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    const sortBy = req.query.sortBy || 'paymentDate';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    const sort = { [sortBy]: sortOrder };

    // Apply filters
    if (req.query.studentId) filter.studentId = req.query.studentId;
    if (req.query.courseId) filter.courseId = req.query.courseId;
    if (req.query.batchId) filter.batchId = req.query.batchId;
    if (req.query.paymentMethod) filter.paymentMethod = req.query.paymentMethod;
    if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus;

    const payments = await FeePayment.find(filter)
      .populate({
        path: 'studentId',
        select: 'firstName lastName email studentId'
      })
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
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const totalPayments = await FeePayment.countDocuments(filter);
    const totalPages = Math.ceil(totalPayments / limit);

    res.json({
      success: true,
      message: 'Payment history retrieved successfully',
      data: {
        payments,
        pagination: {
          currentPage: page,
          totalPages,
          totalPayments,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error getting payment history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve payment history'
    });
  }
};

// Get fee statistics
const getFeeStatistics = async (req, res) => {
  try {
    const totalFeeRequests = await FeeRequest.countDocuments();
    const totalAmount = await FeeRequest.aggregate([
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalPaid = await FeeRequest.aggregate([
      { $group: { _id: null, total: { $sum: '$paidAmount' } } }
    ]);
    const totalRemaining = await FeeRequest.aggregate([
      { $group: { _id: null, total: { $sum: '$remainingAmount' } } }
    ]);

    const statusCounts = await FeeRequest.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const paymentMethodCounts = await FeeRequest.aggregate([
      { $group: { _id: '$paymentMethod', count: { $sum: 1 } } }
    ]);

    const overdueCount = await FeeRequest.countDocuments({ status: 'overdue' });

    res.json({
      success: true,
      message: 'Fee statistics retrieved successfully',
      data: {
        summary: {
          totalFeeRequests,
          totalAmount: totalAmount[0]?.total || 0,
          totalPaid: totalPaid[0]?.total || 0,
          totalRemaining: totalRemaining[0]?.total || 0,
          overdueCount
        },
        statusBreakdown: statusCounts,
        paymentMethodBreakdown: paymentMethodCounts
      }
    });

  } catch (error) {
    console.error('Error getting fee statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve fee statistics'
    });
  }
};

module.exports = {
  createFeeRequest,
  recordFeePayment,
  getAllFeeRequests,
  getStudentFeeRequests,
  getFeePaymentHistory,
  getFeeStatistics
};
