const mongoose = require('mongoose');
const Enrollment = require('../models/enrollment.model');
const Student = require('../models/student.model');
const Course = require('../models/course.model');
const Batch = require('../models/batch.model');

// Check student batch enrollment status
const checkStudentEnrollmentStatus = async (req, res) => {
  try {
    const { studentId, courseId, batchId } = req.query;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: 'Student ID is required'
      });
    }

    // Build filter query
    const filter = { studentId };
    if (courseId) filter.courseId = courseId;
    if (batchId) filter.batchId = batchId;

    // Get enrollment records
    const enrollments = await Enrollment.find(filter)
      .populate('studentId', 'firstName lastName studentId email')
      .populate('courseId', 'title category type price currency')
      .populate('batchId', 'name startDate endDate maxStudents')
      .populate('approvedBy', 'firstName lastName email')
      .sort({ enrollmentDate: -1 });

    // Get student details
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Group enrollments by status
    const statusGroups = {
      pending: [],
      approved: [],
      rejected: [],
      enrolled: [],
      active: [],
      completed: [],
      dropped: [],
      suspended: []
    };

    enrollments.forEach(enrollment => {
      statusGroups[enrollment.status].push(enrollment);
    });

    // Calculate statistics
    const stats = {
      total: enrollments.length,
      pending: statusGroups.pending.length,
      approved: statusGroups.approved.length,
      rejected: statusGroups.rejected.length,
      enrolled: statusGroups.enrolled.length,
      active: statusGroups.active.length,
      completed: statusGroups.completed.length,
      dropped: statusGroups.dropped.length,
      suspended: statusGroups.suspended.length
    };

    res.json({
      success: true,
      message: 'Student enrollment status retrieved successfully',
      data: {
        student: {
          id: student._id,
          name: `${student.firstName} ${student.lastName}`,
          studentId: student.studentId,
          email: student.email
        },
        statistics: stats,
        enrollments: statusGroups,
        allEnrollments: enrollments
      }
    });

  } catch (error) {
    console.error('Error checking student enrollment status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check student enrollment status',
      error: error.message
    });
  }
};

// Get all enrollments with filtering and pagination
const getAllEnrollments = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      studentId,
      courseId,
      batchId,
      status,
      approvalStatus,
      paymentStatus,
      startDate,
      endDate,
      sortBy = 'enrollmentDate',
      sortOrder = 'desc'
    } = req.query;

    // Build filter query
    const filter = {};

    if (studentId) filter.studentId = studentId;
    if (courseId) filter.courseId = courseId;
    if (batchId) filter.batchId = batchId;
    if (status) filter.status = status;
    if (approvalStatus) filter.approvalStatus = approvalStatus;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    if (startDate || endDate) {
      filter.enrollmentDate = {};
      if (startDate) filter.enrollmentDate.$gte = new Date(startDate);
      if (endDate) filter.enrollmentDate.$lte = new Date(endDate);
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Get enrollments
    const enrollments = await Enrollment.find(filter)
      .populate('studentId', 'firstName lastName studentId email phoneNumber')
      .populate('courseId', 'title category type price currency duration')
      .populate('batchId', 'name startDate endDate maxStudents enrolledStudents')
      .populate('approvedBy', 'firstName lastName email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const totalEnrollments = await Enrollment.countDocuments(filter);

    // Calculate pagination info
    const totalPages = Math.ceil(totalEnrollments / parseInt(limit));

    // Get statistics
    const stats = await Enrollment.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalEnrollments: { $sum: 1 },
          pendingEnrollments: {
            $sum: { $cond: [{ $eq: ['$approvalStatus', 'pending'] }, 1, 0] }
          },
          approvedEnrollments: {
            $sum: { $cond: [{ $eq: ['$approvalStatus', 'approved'] }, 1, 0] }
          },
          rejectedEnrollments: {
            $sum: { $cond: [{ $eq: ['$approvalStatus', 'rejected'] }, 1, 0] }
          },
          totalRevenue: { $sum: '$paymentAmount' }
        }
      }
    ]);

    const enrollmentStats = stats[0] || { 
      totalEnrollments: 0, 
      pendingEnrollments: 0, 
      approvedEnrollments: 0, 
      rejectedEnrollments: 0, 
      totalRevenue: 0 
    };

    res.json({
      success: true,
      message: 'Enrollments retrieved successfully',
      data: {
        enrollments,
        statistics: enrollmentStats,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalEnrollments,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Error getting enrollments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve enrollments',
      error: error.message
    });
  }
};

// Get all pending enrollment requests
const getPendingEnrollments = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      courseId,
      batchId,
      sortBy = 'enrollmentDate',
      sortOrder = 'desc'
    } = req.query;

    // Build filter query
    const filter = { 
      status: 'pending',
      approvalStatus: 'pending'
    };

    if (courseId) filter.courseId = courseId;
    if (batchId) filter.batchId = batchId;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Get pending enrollments
    const enrollments = await Enrollment.find(filter)
      .populate('studentId', 'firstName lastName studentId email phoneNumber')
      .populate('courseId', 'title category type price currency duration')
      .populate('batchId', 'name startDate endDate maxStudents enrolledStudents')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const totalEnrollments = await Enrollment.countDocuments(filter);

    // Calculate pagination info
    const totalPages = Math.ceil(totalEnrollments / parseInt(limit));

    // Get statistics
    const stats = await Enrollment.aggregate([
      { $match: { status: 'pending', approvalStatus: 'pending' } },
      {
        $group: {
          _id: null,
          totalPending: { $sum: 1 },
          totalAmount: { $sum: '$paymentAmount' }
        }
      }
    ]);

    const enrollmentStats = stats[0] || { totalPending: 0, totalAmount: 0 };

    res.json({
      success: true,
      message: 'Pending enrollments retrieved successfully',
      data: {
        enrollments,
        statistics: enrollmentStats,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalEnrollments,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Error getting pending enrollments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve pending enrollments',
      error: error.message
    });
  }
};

// Approve student enrollment
const approveEnrollment = async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const { adminNotes } = req.body;
    const adminId = req.user.id;

    if (!enrollmentId) {
      return res.status(400).json({
        success: false,
        message: 'Enrollment ID is required'
      });
    }

    // Get enrollment
    const enrollment = await Enrollment.findById(enrollmentId)
      .populate('studentId', 'firstName lastName studentId email')
      .populate('courseId', 'title category type')
      .populate('batchId', 'name startDate endDate maxStudents enrolledStudents');

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    // Check if already processed
    if (enrollment.approvalStatus !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Enrollment is already ${enrollment.approvalStatus}`
      });
    }

    // Check batch capacity
    const batch = enrollment.batchId;
    if (batch.enrolledStudents.length >= batch.maxStudents) {
      return res.status(400).json({
        success: false,
        message: 'Batch is full. Cannot approve enrollment.'
      });
    }

    // Update enrollment
    enrollment.approvalStatus = 'approved';
    enrollment.status = 'enrolled';
    enrollment.approvedBy = adminId;
    enrollment.approvedAt = new Date();
    if (adminNotes) enrollment.adminNotes = adminNotes;

    await enrollment.save();

    // Add student to batch
    if (!batch.enrolledStudents.includes(enrollment.studentId._id)) {
      batch.enrolledStudents.push(enrollment.studentId._id);
      await batch.save();
    }

    // Populate the response
    await enrollment.populate('approvedBy', 'firstName lastName email');

    res.json({
      success: true,
      message: 'Enrollment approved successfully',
      data: {
        enrollment: {
          id: enrollment._id,
          student: enrollment.studentId,
          course: enrollment.courseId,
          batch: enrollment.batchId,
          status: enrollment.status,
          approvalStatus: enrollment.approvalStatus,
          approvedBy: enrollment.approvedBy,
          approvedAt: enrollment.approvedAt,
          adminNotes: enrollment.adminNotes,
          enrollmentDate: enrollment.enrollmentDate,
          paymentAmount: enrollment.paymentAmount,
          currency: enrollment.currency
        }
      }
    });

  } catch (error) {
    console.error('Error approving enrollment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve enrollment',
      error: error.message
    });
  }
};

// Reject student enrollment
const rejectEnrollment = async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const { rejectionReason, rejectionNotes } = req.body;
    const adminId = req.user.id;

    if (!enrollmentId) {
      return res.status(400).json({
        success: false,
        message: 'Enrollment ID is required'
      });
    }

    if (!rejectionReason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    // Get enrollment
    const enrollment = await Enrollment.findById(enrollmentId)
      .populate('studentId', 'firstName lastName studentId email')
      .populate('courseId', 'title category type')
      .populate('batchId', 'name startDate endDate');

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    // Check if already processed
    if (enrollment.approvalStatus !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Enrollment is already ${enrollment.approvalStatus}`
      });
    }

    // Update enrollment
    enrollment.approvalStatus = 'rejected';
    enrollment.status = 'rejected';
    enrollment.approvedBy = adminId;
    enrollment.approvedAt = new Date();
    enrollment.rejectionReason = rejectionReason;
    if (rejectionNotes) enrollment.rejectionNotes = rejectionNotes;

    await enrollment.save();

    // Populate the response
    await enrollment.populate('approvedBy', 'firstName lastName email');

    res.json({
      success: true,
      message: 'Enrollment rejected successfully',
      data: {
        enrollment: {
          id: enrollment._id,
          student: enrollment.studentId,
          course: enrollment.courseId,
          batch: enrollment.batchId,
          status: enrollment.status,
          approvalStatus: enrollment.approvalStatus,
          approvedBy: enrollment.approvedBy,
          approvedAt: enrollment.approvedAt,
          rejectionReason: enrollment.rejectionReason,
          rejectionNotes: enrollment.rejectionNotes,
          enrollmentDate: enrollment.enrollmentDate,
          paymentAmount: enrollment.paymentAmount,
          currency: enrollment.currency
        }
      }
    });

  } catch (error) {
    console.error('Error rejecting enrollment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject enrollment',
      error: error.message
    });
  }
};

// Get enrollment statistics
const getEnrollmentStatistics = async (req, res) => {
  try {
    const { startDate, endDate, courseId, batchId } = req.query;

    // Build match query
    let matchQuery = {};
    if (startDate && endDate) {
      matchQuery.enrollmentDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    if (courseId) matchQuery.courseId = new mongoose.Types.ObjectId(courseId);
    if (batchId) matchQuery.batchId = new mongoose.Types.ObjectId(batchId);

    // Get overall statistics
    const overallStats = await Enrollment.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalEnrollments: { $sum: 1 },
          pendingEnrollments: {
            $sum: { $cond: [{ $eq: ['$approvalStatus', 'pending'] }, 1, 0] }
          },
          approvedEnrollments: {
            $sum: { $cond: [{ $eq: ['$approvalStatus', 'approved'] }, 1, 0] }
          },
          rejectedEnrollments: {
            $sum: { $cond: [{ $eq: ['$approvalStatus', 'rejected'] }, 1, 0] }
          },
          activeEnrollments: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          completedEnrollments: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          totalRevenue: { $sum: '$paymentAmount' },
          averageRating: { $avg: '$rating' }
        }
      }
    ]);

    // Get statistics by course
    const courseStats = await Enrollment.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$courseId',
          totalEnrollments: { $sum: 1 },
          pendingEnrollments: {
            $sum: { $cond: [{ $eq: ['$approvalStatus', 'pending'] }, 1, 0] }
          },
          approvedEnrollments: {
            $sum: { $cond: [{ $eq: ['$approvalStatus', 'approved'] }, 1, 0] }
          },
          rejectedEnrollments: {
            $sum: { $cond: [{ $eq: ['$approvalStatus', 'rejected'] }, 1, 0] }
          },
          totalRevenue: { $sum: '$paymentAmount' }
        }
      },
      {
        $lookup: {
          from: 'courses',
          localField: '_id',
          foreignField: '_id',
          as: 'course'
        }
      },
      {
        $unwind: '$course'
      },
      {
        $project: {
          courseName: '$course.title',
          courseType: '$course.type',
          totalEnrollments: 1,
          pendingEnrollments: 1,
          approvedEnrollments: 1,
          rejectedEnrollments: 1,
          totalRevenue: 1
        }
      }
    ]);

    // Get statistics by batch
    const batchStats = await Enrollment.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$batchId',
          totalEnrollments: { $sum: 1 },
          pendingEnrollments: {
            $sum: { $cond: [{ $eq: ['$approvalStatus', 'pending'] }, 1, 0] }
          },
          approvedEnrollments: {
            $sum: { $cond: [{ $eq: ['$approvalStatus', 'approved'] }, 1, 0] }
          },
          rejectedEnrollments: {
            $sum: { $cond: [{ $eq: ['$approvalStatus', 'rejected'] }, 1, 0] }
          },
          totalRevenue: { $sum: '$paymentAmount' }
        }
      },
      {
        $lookup: {
          from: 'batches',
          localField: '_id',
          foreignField: '_id',
          as: 'batch'
        }
      },
      {
        $unwind: '$batch'
      },
      {
        $lookup: {
          from: 'courses',
          localField: 'batch.courseId',
          foreignField: '_id',
          as: 'course'
        }
      },
      {
        $unwind: '$course'
      },
      {
        $project: {
          batchName: '$batch.name',
          courseName: '$course.title',
          totalEnrollments: 1,
          pendingEnrollments: 1,
          approvedEnrollments: 1,
          rejectedEnrollments: 1,
          totalRevenue: 1
        }
      }
    ]);

    // Get recent enrollments
    const recentEnrollments = await Enrollment.find(matchQuery)
      .populate('studentId', 'firstName lastName studentId email')
      .populate('courseId', 'title category type')
      .populate('batchId', 'name startDate endDate')
      .populate('approvedBy', 'firstName lastName email')
      .sort({ enrollmentDate: -1 })
      .limit(10);

    res.json({
      success: true,
      message: 'Enrollment statistics retrieved successfully',
      data: {
        overall: overallStats[0] || {
          totalEnrollments: 0,
          pendingEnrollments: 0,
          approvedEnrollments: 0,
          rejectedEnrollments: 0,
          activeEnrollments: 0,
          completedEnrollments: 0,
          totalRevenue: 0,
          averageRating: 0
        },
        byCourse: courseStats,
        byBatch: batchStats,
        recentEnrollments
      }
    });

  } catch (error) {
    console.error('Error getting enrollment statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve enrollment statistics',
      error: error.message
    });
  }
};

// Sync enrollment status with batch enrollment
const syncEnrollmentWithBatch = async (req, res) => {
  try {
    const { enrollmentId } = req.params;

    if (!enrollmentId) {
      return res.status(400).json({
        success: false,
        message: 'Enrollment ID is required'
      });
    }

    // Get enrollment
    const enrollment = await Enrollment.findById(enrollmentId)
      .populate('studentId', 'firstName lastName studentId email')
      .populate('courseId', 'title category type')
      .populate('batchId', 'name startDate endDate maxStudents enrolledStudents');

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    const batch = enrollment.batchId;
    const studentId = enrollment.studentId._id;

    // Check if student is in batch enrolledStudents array
    const isInBatch = batch.enrolledStudents.some(id => id.toString() === studentId.toString());

    let action = '';
    let updated = false;

    if (enrollment.approvalStatus === 'approved' && enrollment.status === 'enrolled') {
      // Student should be in batch but isn't
      if (!isInBatch) {
        batch.enrolledStudents.push(studentId);
        await batch.save();
        action = 'Added student to batch enrolledStudents array';
        updated = true;
      } else {
        action = 'Student already in batch enrolledStudents array';
      }
    } else if (enrollment.approvalStatus === 'rejected' || enrollment.status === 'rejected') {
      // Student should not be in batch but is
      if (isInBatch) {
        batch.enrolledStudents = batch.enrolledStudents.filter(id => id.toString() !== studentId.toString());
        await batch.save();
        action = 'Removed student from batch enrolledStudents array';
        updated = true;
      } else {
        action = 'Student already not in batch enrolledStudents array';
      }
    } else {
      action = 'No sync needed - enrollment is pending';
    }

    res.json({
      success: true,
      message: 'Enrollment sync completed',
      data: {
        enrollment: {
          id: enrollment._id,
          student: enrollment.studentId,
          course: enrollment.courseId,
          batch: {
            id: batch._id,
            name: batch.name,
            enrolledStudentsCount: batch.enrolledStudents.length
          },
          status: enrollment.status,
          approvalStatus: enrollment.approvalStatus,
          wasInBatch: isInBatch,
          action,
          updated
        }
      }
    });

  } catch (error) {
    console.error('Error syncing enrollment with batch:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync enrollment with batch',
      error: error.message
    });
  }
};

// Get specific enrollment details
const getEnrollmentDetails = async (req, res) => {
  try {
    const { enrollmentId } = req.params;

    if (!enrollmentId) {
      return res.status(400).json({
        success: false,
        message: 'Enrollment ID is required'
      });
    }

    // Get enrollment with all related data
    const enrollment = await Enrollment.findById(enrollmentId)
      .populate('studentId', 'firstName lastName studentId email phoneNumber dateOfBirth address')
      .populate('courseId', 'title category type price currency duration durationUnit instructor description')
      .populate('batchId', 'name startDate endDate maxStudents enrolledStudents timeSlots venue')
      .populate('approvedBy', 'firstName lastName email');

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    res.json({
      success: true,
      message: 'Enrollment details retrieved successfully',
      data: {
        enrollment
      }
    });

  } catch (error) {
    console.error('Error getting enrollment details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve enrollment details',
      error: error.message
    });
  }
};

module.exports = {
  checkStudentEnrollmentStatus,
  getAllEnrollments,
  getPendingEnrollments,
  approveEnrollment,
  rejectEnrollment,
  getEnrollmentStatistics,
  getEnrollmentDetails,
  syncEnrollmentWithBatch
};
