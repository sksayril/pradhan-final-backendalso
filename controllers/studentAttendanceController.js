const Attendance = require('../models/attendance.model');
const Student = require('../models/student.model');
const mongoose = require('mongoose');

// Get student's own attendance records
const getMyAttendance = async (req, res) => {
  try {
    const studentId = req.user.id;
    const {
      page = 1,
      limit = 10,
      courseId,
      batchId,
      status,
      startDate,
      endDate,
      sortBy = 'attendanceDate',
      sortOrder = 'desc'
    } = req.query;

    // Build filter query
    const filter = { 
      studentId: new mongoose.Types.ObjectId(studentId),
      isActive: true 
    };

    if (courseId) filter.courseId = new mongoose.Types.ObjectId(courseId);
    if (batchId) filter.batchId = new mongoose.Types.ObjectId(batchId);
    if (status) filter.status = status;

    if (startDate || endDate) {
      filter.attendanceDate = {};
      if (startDate) filter.attendanceDate.$gte = new Date(startDate);
      if (endDate) filter.attendanceDate.$lte = new Date(endDate);
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Get attendance records
    const attendanceRecords = await Attendance.find(filter)
      .populate('courseId', 'title category type price currency')
      .populate('batchId', 'name startDate endDate maxStudents')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const totalRecords = await Attendance.countDocuments(filter);

    // Calculate pagination info
    const totalPages = Math.ceil(totalRecords / parseInt(limit));

    res.json({
      success: true,
      message: 'Attendance records retrieved successfully',
      data: {
        attendanceRecords,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalRecords,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Error getting student attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve attendance records',
      error: error.message
    });
  }
};

// Get student's attendance statistics
const getMyAttendanceStats = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { courseId, batchId, startDate, endDate } = req.query;

    // Get overall statistics
    const overallStats = await Attendance.getAttendanceStats(
      studentId,
      courseId,
      batchId,
      startDate,
      endDate
    );

    // Get statistics by course
    const courseStats = await Attendance.aggregate([
      {
        $match: {
          studentId: new mongoose.Types.ObjectId(studentId),
          isActive: true,
          ...(courseId && { courseId: new mongoose.Types.ObjectId(courseId) }),
          ...(batchId && { batchId: new mongoose.Types.ObjectId(batchId) }),
          ...(startDate && endDate && {
            attendanceDate: {
              $gte: new Date(startDate),
              $lte: new Date(endDate)
            }
          })
        }
      },
      {
        $group: {
          _id: {
            courseId: '$courseId',
            status: '$status'
          },
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'courses',
          localField: '_id.courseId',
          foreignField: '_id',
          as: 'course'
        }
      },
      {
        $unwind: '$course'
      },
      {
        $group: {
          _id: '$_id.courseId',
          courseName: { $first: '$course.title' },
          courseType: { $first: '$course.type' },
          statusCounts: {
            $push: {
              status: '$_id.status',
              count: '$count'
            }
          }
        }
      },
      {
        $addFields: {
          totalClasses: { $sum: '$statusCounts.count' },
          presentClasses: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: '$statusCounts',
                    cond: { $in: ['$$this.status', ['present', 'late']] }
                  }
                },
                as: 'item',
                in: '$$item.count'
              }
            }
          }
        }
      },
      {
        $addFields: {
          attendancePercentage: {
            $cond: {
              if: { $gt: ['$totalClasses', 0] },
              then: {
                $round: [
                  {
                    $multiply: [
                      { $divide: ['$presentClasses', '$totalClasses'] },
                      100
                    ]
                  }
                ]
              },
              else: 0
            }
          }
        }
      }
    ]);

    // Get statistics by batch
    const batchStats = await Attendance.aggregate([
      {
        $match: {
          studentId: new mongoose.Types.ObjectId(studentId),
          isActive: true,
          ...(courseId && { courseId: new mongoose.Types.ObjectId(courseId) }),
          ...(batchId && { batchId: new mongoose.Types.ObjectId(batchId) }),
          ...(startDate && endDate && {
            attendanceDate: {
              $gte: new Date(startDate),
              $lte: new Date(endDate)
            }
          })
        }
      },
      {
        $group: {
          _id: {
            batchId: '$batchId',
            status: '$status'
          },
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'batches',
          localField: '_id.batchId',
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
        $group: {
          _id: '$_id.batchId',
          batchName: { $first: '$batch.name' },
          courseName: { $first: '$course.title' },
          statusCounts: {
            $push: {
              status: '$_id.status',
              count: '$count'
            }
          }
        }
      },
      {
        $addFields: {
          totalClasses: { $sum: '$statusCounts.count' },
          presentClasses: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: '$statusCounts',
                    cond: { $in: ['$$this.status', ['present', 'late']] }
                  }
                },
                as: 'item',
                in: '$$item.count'
              }
            }
          }
        }
      },
      {
        $addFields: {
          attendancePercentage: {
            $cond: {
              if: { $gt: ['$totalClasses', 0] },
              then: {
                $round: [
                  {
                    $multiply: [
                      { $divide: ['$presentClasses', '$totalClasses'] },
                      100
                    ]
                  }
                ]
              },
              else: 0
            }
          }
        }
      }
    ]);

    // Get recent attendance (last 10 records)
    const recentAttendance = await Attendance.find({
      studentId: new mongoose.Types.ObjectId(studentId),
      isActive: true
    })
      .populate('courseId', 'title category type')
      .populate('batchId', 'name startDate endDate')
      .sort({ attendanceDate: -1, markedAt: -1 })
      .limit(10);

    res.json({
      success: true,
      message: 'Attendance statistics retrieved successfully',
      data: {
        overall: overallStats,
        byCourse: courseStats,
        byBatch: batchStats,
        recentAttendance
      }
    });

  } catch (error) {
    console.error('Error getting student attendance statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve attendance statistics',
      error: error.message
    });
  }
};

// Get student's attendance for a specific course
const getMyCourseAttendance = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { courseId } = req.params;
    const {
      page = 1,
      limit = 10,
      batchId,
      status,
      startDate,
      endDate,
      sortBy = 'attendanceDate',
      sortOrder = 'desc'
    } = req.query;

    // Build filter query
    const filter = { 
      studentId: new mongoose.Types.ObjectId(studentId),
      courseId: new mongoose.Types.ObjectId(courseId),
      isActive: true 
    };

    if (batchId) filter.batchId = new mongoose.Types.ObjectId(batchId);
    if (status) filter.status = status;

    if (startDate || endDate) {
      filter.attendanceDate = {};
      if (startDate) filter.attendanceDate.$gte = new Date(startDate);
      if (endDate) filter.attendanceDate.$lte = new Date(endDate);
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Get attendance records
    const attendanceRecords = await Attendance.find(filter)
      .populate('courseId', 'title category type price currency duration durationUnit instructor')
      .populate('batchId', 'name startDate endDate maxStudents timeSlots')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const totalRecords = await Attendance.countDocuments(filter);

    // Get course statistics
    const courseStats = await Attendance.getAttendanceStats(
      studentId,
      courseId,
      batchId,
      startDate,
      endDate
    );

    // Calculate pagination info
    const totalPages = Math.ceil(totalRecords / parseInt(limit));

    res.json({
      success: true,
      message: 'Course attendance retrieved successfully',
      data: {
        attendanceRecords,
        courseStats,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalRecords,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Error getting course attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve course attendance',
      error: error.message
    });
  }
};

// Get student's attendance for a specific batch
const getMyBatchAttendance = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { batchId } = req.params;
    const {
      page = 1,
      limit = 10,
      status,
      startDate,
      endDate,
      sortBy = 'attendanceDate',
      sortOrder = 'desc'
    } = req.query;

    // Build filter query
    const filter = { 
      studentId: new mongoose.Types.ObjectId(studentId),
      batchId: new mongoose.Types.ObjectId(batchId),
      isActive: true 
    };

    if (status) filter.status = status;

    if (startDate || endDate) {
      filter.attendanceDate = {};
      if (startDate) filter.attendanceDate.$gte = new Date(startDate);
      if (endDate) filter.attendanceDate.$lte = new Date(endDate);
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Get attendance records
    const attendanceRecords = await Attendance.find(filter)
      .populate('courseId', 'title category type price currency duration durationUnit instructor')
      .populate('batchId', 'name startDate endDate maxStudents timeSlots')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const totalRecords = await Attendance.countDocuments(filter);

    // Get batch statistics
    const batchStats = await Attendance.getAttendanceStats(
      studentId,
      null,
      batchId,
      startDate,
      endDate
    );

    // Calculate pagination info
    const totalPages = Math.ceil(totalRecords / parseInt(limit));

    res.json({
      success: true,
      message: 'Batch attendance retrieved successfully',
      data: {
        attendanceRecords,
        batchStats,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalRecords,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Error getting batch attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve batch attendance',
      error: error.message
    });
  }
};

// Get student's attendance summary
const getMyAttendanceSummary = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { period = '30' } = req.query; // Default to last 30 days

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Get overall statistics for the period
    const overallStats = await Attendance.getAttendanceStats(
      studentId,
      null,
      null,
      startDate,
      endDate
    );

    // Get daily attendance for the period
    const dailyAttendance = await Attendance.aggregate([
      {
        $match: {
          studentId: new mongoose.Types.ObjectId(studentId),
          isActive: true,
          attendanceDate: {
            $gte: startDate,
            $lte: endDate
          }
        }
      },
      {
        $group: {
          _id: {
            date: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$attendanceDate'
              }
            },
            status: '$status'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.date',
          statusCounts: {
            $push: {
              status: '$_id.status',
              count: '$count'
            }
          }
        }
      },
      {
        $addFields: {
          totalClasses: { $sum: '$statusCounts.count' },
          presentClasses: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: '$statusCounts',
                    cond: { $in: ['$$this.status', ['present', 'late']] }
                  }
                },
                as: 'item',
                in: '$$item.count'
              }
            }
          }
        }
      },
      {
        $addFields: {
          attendancePercentage: {
            $cond: {
              if: { $gt: ['$totalClasses', 0] },
              then: {
                $round: [
                  {
                    $multiply: [
                      { $divide: ['$presentClasses', '$totalClasses'] },
                      100
                    ]
                  }
                ]
              },
              else: 0
            }
          }
        }
      },
      {
        $sort: { _id: -1 }
      }
    ]);

    // Get attendance trends (weekly)
    const weeklyTrends = await Attendance.aggregate([
      {
        $match: {
          studentId: new mongoose.Types.ObjectId(studentId),
          isActive: true,
          attendanceDate: {
            $gte: startDate,
            $lte: endDate
          }
        }
      },
      {
        $group: {
          _id: {
            week: { $week: '$attendanceDate' },
            year: { $year: '$attendanceDate' },
            status: '$status'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: {
            week: '$_id.week',
            year: '$_id.year'
          },
          statusCounts: {
            $push: {
              status: '$_id.status',
              count: '$count'
            }
          }
        }
      },
      {
        $addFields: {
          totalClasses: { $sum: '$statusCounts.count' },
          presentClasses: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: '$statusCounts',
                    cond: { $in: ['$$this.status', ['present', 'late']] }
                  }
                },
                as: 'item',
                in: '$$item.count'
              }
            }
          }
        }
      },
      {
        $addFields: {
          attendancePercentage: {
            $cond: {
              if: { $gt: ['$totalClasses', 0] },
              then: {
                $round: [
                  {
                    $multiply: [
                      { $divide: ['$presentClasses', '$totalClasses'] },
                      100
                    ]
                  }
                ]
              },
              else: 0
            }
          }
        }
      },
      {
        $sort: { '_id.year': -1, '_id.week': -1 }
      }
    ]);

    res.json({
      success: true,
      message: 'Attendance summary retrieved successfully',
      data: {
        period: {
          startDate,
          endDate,
          days: parseInt(period)
        },
        overall: overallStats,
        dailyAttendance,
        weeklyTrends
      }
    });

  } catch (error) {
    console.error('Error getting attendance summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve attendance summary',
      error: error.message
    });
  }
};

// Get student's own attendance report with month-wise data
const getMyAttendanceReport = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { year, month, startDate, endDate } = req.query;

    // Get student information
    const student = await Student.findById(studentId)
      .select('firstName lastName studentId email phoneNumber');
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Build date filter
    let dateFilter = {};
    
    if (year && month) {
      // Filter by specific year and month
      const startOfMonth = new Date(year, month - 1, 1);
      const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
      dateFilter = {
        attendanceDate: {
          $gte: startOfMonth,
          $lte: endOfMonth
        }
      };
    } else if (startDate && endDate) {
      // Filter by date range
      dateFilter = {
        attendanceDate: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    } else if (year) {
      // Filter by year only
      const startOfYear = new Date(year, 0, 1);
      const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999);
      dateFilter = {
        attendanceDate: {
          $gte: startOfYear,
          $lte: endOfYear
        }
      };
    }

    // Get attendance records for the student
    const attendanceRecords = await Attendance.find({
      studentId: new mongoose.Types.ObjectId(studentId),
      isActive: true,
      ...dateFilter
    })
    .populate('courseId', 'title category type')
    .populate('batchId', 'name startDate endDate')
    .populate('markedBy', 'firstName lastName email')
    .sort({ attendanceDate: -1 });

    // Group attendance by month
    const monthlyData = {};
    const statusCounts = {
      present: 0,
      absent: 0,
      late: 0,
      excused: 0
    };

    attendanceRecords.forEach(record => {
      const date = new Date(record.attendanceDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleString('default', { month: 'long', year: 'numeric' });

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthName,
          monthKey,
          totalDays: 0,
          present: 0,
          absent: 0,
          late: 0,
          excused: 0,
          attendanceRate: 0,
          records: []
        };
      }

      monthlyData[monthKey].totalDays++;
      monthlyData[monthKey][record.status]++;
      monthlyData[monthKey].records.push({
        id: record._id,
        date: record.attendanceDate,
        status: record.status,
        timeSlot: record.timeSlot,
        remarks: record.remarks,
        course: record.courseId,
        batch: record.batchId,
        markedBy: record.markedBy,
        createdAt: record.createdAt
      });

      // Update overall status counts
      statusCounts[record.status]++;
    });

    // Calculate attendance rates for each month
    Object.values(monthlyData).forEach(month => {
      const totalDays = month.totalDays;
      const presentDays = month.present + month.late; // Late is considered present
      month.attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;
    });

    // Calculate overall statistics
    const totalDays = attendanceRecords.length;
    const presentDays = statusCounts.present + statusCounts.late;
    const overallAttendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

    // Get student's enrollments for context
    const Enrollment = require('../models/enrollment.model');
    const enrollments = await Enrollment.find({
      studentId: new mongoose.Types.ObjectId(studentId),
      approvalStatus: 'approved',
      status: 'enrolled'
    })
    .populate('courseId', 'title category type')
    .populate('batchId', 'name startDate endDate');

    res.json({
      success: true,
      message: 'Your attendance report retrieved successfully',
      data: {
        student: {
          id: student._id,
          firstName: student.firstName,
          lastName: student.lastName,
          studentId: student.studentId,
          email: student.email,
          phoneNumber: student.phoneNumber
        },
        enrollments: enrollments.map(enrollment => ({
          id: enrollment._id,
          course: enrollment.courseId,
          batch: enrollment.batchId,
          enrollmentDate: enrollment.enrollmentDate,
          status: enrollment.status,
          approvalStatus: enrollment.approvalStatus
        })),
        summary: {
          totalDays: totalDays,
          present: statusCounts.present,
          absent: statusCounts.absent,
          late: statusCounts.late,
          excused: statusCounts.excused,
          overallAttendanceRate: overallAttendanceRate
        },
        monthlyReport: Object.values(monthlyData).sort((a, b) => b.monthKey.localeCompare(a.monthKey)),
        filter: {
          year: year || null,
          month: month || null,
          startDate: startDate || null,
          endDate: endDate || null
        }
      }
    });

  } catch (error) {
    console.error('Error getting student attendance report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get your attendance report',
      error: error.message
    });
  }
};

// Get student's complete profile data
const getMyProfile = async (req, res) => {
  try {
    const studentId = req.user.id;

    // Get complete student information
    const student = await Student.findById(studentId)
      .select('-password'); // Exclude hashed password
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    // Get student's KYC information
    const StudentKyc = require('../models/studentKyc.model');
    const kyc = await StudentKyc.findOne({ studentId: new mongoose.Types.ObjectId(studentId) })
      .populate('reviewedBy', 'firstName lastName email');

    // Get student's enrollments
    const Enrollment = require('../models/enrollment.model');
    const enrollments = await Enrollment.find({
      studentId: new mongoose.Types.ObjectId(studentId)
    })
    .populate('courseId', 'title category type price currency duration description instructor')
    .populate('batchId', 'name startDate endDate maxStudents timeSlots')
    .populate('approvedBy', 'firstName lastName email')
    .sort({ enrollmentDate: -1 });

    // Get student's attendance summary
    const attendanceSummary = await Attendance.aggregate([
      {
        $match: {
          studentId: new mongoose.Types.ObjectId(studentId),
          isActive: true
        }
      },
      {
        $group: {
          _id: null,
          totalDays: { $sum: 1 },
          present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
          absent: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } },
          late: { $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] } },
          excused: { $sum: { $cond: [{ $eq: ['$status', 'excused'] }, 1, 0] } }
        }
      }
    ]);

    // Get student's fee information
    const FeeRequest = require('../models/feeRequest.model');
    const FeePayment = require('../models/feePayment.model');
    
    const feeRequests = await FeeRequest.find({
      studentId: new mongoose.Types.ObjectId(studentId)
    })
    .populate('courseId', 'title category type')
    .populate('batchId', 'name startDate endDate')
    .sort({ createdAt: -1 });

    const feePayments = await FeePayment.find({
      studentId: new mongoose.Types.ObjectId(studentId)
    })
    .populate('courseId', 'title category type')
    .populate('batchId', 'name startDate endDate')
    .sort({ paymentDate: -1 });

    // Calculate fee summary
    const totalRequested = feeRequests.reduce((sum, req) => sum + req.amount, 0);
    const totalPaid = feePayments.reduce((sum, pay) => sum + pay.amount, 0);
    const totalPending = totalRequested - totalPaid;

    // Calculate attendance rate
    const attendance = attendanceSummary[0] || { totalDays: 0, present: 0, absent: 0, late: 0, excused: 0 };
    const presentDays = attendance.present + attendance.late;
    const attendanceRate = attendance.totalDays > 0 ? Math.round((presentDays / attendance.totalDays) * 100) : 0;

    res.json({
      success: true,
      message: 'Student profile retrieved successfully',
      data: {
        profile: {
          id: student._id,
          firstName: student.firstName,
          lastName: student.lastName,
          studentId: student.studentId,
          email: student.email,
          phoneNumber: student.phoneNumber,
          dateOfBirth: student.dateOfBirth,
          department: student.department,
          year: student.year,
          address: student.address,
          profilePicture: student.profilePicture,
          isActive: student.isActive,
          isVerified: student.isVerified,
          kycStatus: student.kycStatus,
          lastLogin: student.lastLogin,
          interests: student.interests,
          achievements: student.achievements,
          originalPassword: student.originalPassword,
          createdAt: student.createdAt,
          updatedAt: student.updatedAt
        },
        kyc: kyc ? {
          id: kyc._id,
          status: kyc.status,
          submittedAt: kyc.submittedAt,
          reviewedAt: kyc.reviewedAt,
          rejectionReason: kyc.rejectionReason,
          remarks: kyc.remarks,
          reviewedBy: kyc.reviewedBy,
          documents: {
            aadharNumber: kyc.aadharNumber,
            aadharCardImage: kyc.aadharCardImage
          }
        } : null,
        enrollments: enrollments.map(enrollment => ({
          id: enrollment._id,
          course: enrollment.courseId,
          batch: enrollment.batchId,
          status: enrollment.status,
          approvalStatus: enrollment.approvalStatus,
          enrollmentDate: enrollment.enrollmentDate,
          paymentAmount: enrollment.paymentAmount,
          currency: enrollment.currency,
          paymentStatus: enrollment.paymentStatus,
          approvedBy: enrollment.approvedBy,
          approvedAt: enrollment.approvedAt,
          rejectionReason: enrollment.rejectionReason,
          createdAt: enrollment.createdAt
        })),
        attendance: {
          summary: {
            totalDays: attendance.totalDays,
            present: attendance.present,
            absent: attendance.absent,
            late: attendance.late,
            excused: attendance.excused,
            attendanceRate: attendanceRate
          }
        },
        fees: {
          summary: {
            totalRequested: totalRequested,
            totalPaid: totalPaid,
            totalPending: totalPending,
            currency: 'INR' // Default currency
          },
          requests: feeRequests.map(request => ({
            id: request._id,
            course: request.courseId,
            batch: request.batchId,
            amount: request.amount,
            currency: request.currency,
            status: request.status,
            dueDate: request.dueDate,
            description: request.description,
            createdAt: request.createdAt
          })),
          payments: feePayments.map(payment => ({
            id: payment._id,
            course: payment.courseId,
            batch: payment.batchId,
            amount: payment.amount,
            currency: payment.currency,
            paymentMethod: payment.paymentMethod,
            paymentDate: payment.paymentDate,
            transactionId: payment.transactionId,
            status: payment.status,
            createdAt: payment.createdAt
          }))
        },
        statistics: {
          totalEnrollments: enrollments.length,
          activeEnrollments: enrollments.filter(e => e.status === 'enrolled' && e.approvalStatus === 'approved').length,
          pendingEnrollments: enrollments.filter(e => e.approvalStatus === 'pending').length,
          rejectedEnrollments: enrollments.filter(e => e.approvalStatus === 'rejected').length,
          totalFeeRequests: feeRequests.length,
          totalFeePayments: feePayments.length,
          attendanceRate: attendanceRate
        }
      }
    });

  } catch (error) {
    console.error('Error getting student profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get student profile',
      error: error.message
    });
  }
};

module.exports = {
  getMyAttendance,
  getMyAttendanceStats,
  getMyCourseAttendance,
  getMyBatchAttendance,
  getMyAttendanceSummary,
  getMyAttendanceReport,
  getMyProfile
};
