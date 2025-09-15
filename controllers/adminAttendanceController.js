const Attendance = require('../models/attendance.model');
const Student = require('../models/student.model');
const Course = require('../models/course.model');
const Batch = require('../models/batch.model');
const Enrollment = require('../models/enrollment.model');

// Mark attendance for a single student (simplified - auto-detect course and batch)
const markAttendanceSimple = async (req, res) => {
  try {
    const { studentId, attendanceDate, status, timeSlot, remarks } = req.body;
    const adminId = req.user.id;

    // Validate required fields
    if (!studentId || !attendanceDate || !status || !timeSlot) {
      return res.status(400).json({
        success: false,
        message: 'Student ID, Attendance Date, Status, and Time Slot are required'
      });
    }

    // Validate status
    const validStatuses = ['present', 'absent', 'late', 'excused'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid attendance status. Must be: present, absent, late, or excused'
      });
    }

    // Validate time slot
    if (!timeSlot.startTime || !timeSlot.endTime) {
      return res.status(400).json({
        success: false,
        message: 'Time slot must include startTime and endTime'
      });
    }

    // Calculate duration
    const startTime = new Date(`2000-01-01T${timeSlot.startTime}:00`);
    const endTime = new Date(`2000-01-01T${timeSlot.endTime}:00`);
    const duration = (endTime - startTime) / (1000 * 60); // Duration in minutes

    if (duration <= 0) {
      return res.status(400).json({
        success: false,
        message: 'End time must be after start time'
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

    // Find active enrollments for the student
    const enrollments = await Enrollment.find({
      studentId,
      approvalStatus: 'approved',
      status: 'enrolled'
    }).populate('courseId', 'title category type')
      .populate('batchId', 'name startDate endDate maxStudents enrolledStudents');

    if (enrollments.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Student has no approved enrollments'
      });
    }

    // If multiple enrollments, we need to determine which one to use
    // For now, we'll use the first active enrollment
    // In the future, you might want to add logic to select based on date/time
    const enrollment = enrollments[0];
    const courseId = enrollment.courseId._id;
    const batchId = enrollment.batchId._id;

    // Note: Removed batch enrollment validation for simplified attendance marking
    // The system now relies on enrollment status rather than batch enrolledStudents array

    // Check if attendance already exists for this student, date, and time slot
    const existingAttendance = await Attendance.findOne({
      studentId,
      courseId,
      batchId,
      attendanceDate: new Date(attendanceDate),
      'timeSlot.startTime': timeSlot.startTime,
      'timeSlot.endTime': timeSlot.endTime,
      isActive: true
    });

    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        message: 'Attendance already marked for this student, date, and time slot',
        data: {
          existingAttendance: {
            id: existingAttendance._id,
            status: existingAttendance.status,
            markedAt: existingAttendance.createdAt
          }
        }
      });
    }

    // Create attendance record
    const attendanceData = {
      studentId,
      courseId,
      batchId,
      attendanceDate: new Date(attendanceDate),
      status,
      timeSlot: {
        startTime: timeSlot.startTime,
        endTime: timeSlot.endTime,
        duration
      },
      remarks: remarks || '',
      markedBy: adminId
    };

    const attendance = new Attendance(attendanceData);
    await attendance.save();

    // Populate the response
    await attendance.populate([
      { path: 'studentId', select: 'firstName lastName studentId email' },
      { path: 'courseId', select: 'title category type' },
      { path: 'batchId', select: 'name startDate endDate' },
      { path: 'markedBy', select: 'firstName lastName email' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Attendance marked successfully',
      data: {
        attendance: {
          id: attendance._id,
          student: attendance.studentId,
          course: attendance.courseId,
          batch: attendance.batchId,
          attendanceDate: attendance.attendanceDate,
          status: attendance.status,
          timeSlot: attendance.timeSlot,
          remarks: attendance.remarks,
          markedBy: attendance.markedBy,
          createdAt: attendance.createdAt
        }
      }
    });

  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark attendance',
      error: error.message
    });
  }
};

// Mark attendance for a single student (original - requires course and batch)
const markAttendance = async (req, res) => {
  try {
    const { studentId, courseId, batchId, attendanceDate, status, timeSlot, remarks } = req.body;
    const adminId = req.user.id;

    // Validate required fields
    if (!studentId || !courseId || !batchId || !status || !timeSlot) {
      return res.status(400).json({
        success: false,
        message: 'Student ID, Course ID, Batch ID, Status, and Time Slot are required'
      });
    }

    // Validate status
    const validStatuses = ['present', 'absent', 'late', 'excused'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid attendance status. Must be: present, absent, late, or excused'
      });
    }

    // Validate time slot
    if (!timeSlot.startTime || !timeSlot.endTime) {
      return res.status(400).json({
        success: false,
        message: 'Time slot must include startTime and endTime'
      });
    }

    // Calculate duration
    const startTime = new Date(`2000-01-01T${timeSlot.startTime}:00`);
    const endTime = new Date(`2000-01-01T${timeSlot.endTime}:00`);
    const duration = (endTime - startTime) / (1000 * 60); // Duration in minutes

    if (duration <= 0) {
      return res.status(400).json({
        success: false,
        message: 'End time must be after start time'
      });
    }

    // Check if student exists and is enrolled in the batch
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

    // Check if batch exists and belongs to the course
    const batch = await Batch.findById(batchId).populate('enrolledStudents');
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }

    if (batch.courseId.toString() !== courseId) {
      return res.status(400).json({
        success: false,
        message: 'Batch does not belong to the specified course'
      });
    }

    // Check if student is enrolled in this batch
    const enrolledStudentIds = batch.enrolledStudents.map(id => id.toString());
    if (!enrolledStudentIds.includes(studentId)) {
      // Check if student has an approved enrollment for this batch
      const Enrollment = require('../models/enrollment.model');
      const enrollment = await Enrollment.findOne({
        studentId,
        batchId,
        approvalStatus: 'approved',
        status: 'enrolled'
      });

      return res.status(400).json({
        success: false,
        message: 'Student is not enrolled in this batch',
        debug: {
          studentId,
          batchId,
          enrolledStudents: batch.enrolledStudents,
          enrolledStudentIds,
          hasApprovedEnrollment: !!enrollment,
          enrollmentStatus: enrollment ? {
            status: enrollment.status,
            approvalStatus: enrollment.approvalStatus,
            enrollmentDate: enrollment.enrollmentDate
          } : null,
          suggestion: enrollment ? 'Student has approved enrollment but is not in batch. Use sync endpoint to fix.' : 'Student needs to be enrolled in this batch first.'
        }
      });
    }

    // Create attendance record
    const attendanceData = {
      studentId,
      courseId,
      batchId,
      attendanceDate: attendanceDate ? new Date(attendanceDate) : new Date(),
      status,
      timeSlot: {
        startTime: timeSlot.startTime,
        endTime: timeSlot.endTime,
        duration
      },
      remarks: remarks || '',
      markedBy: adminId
    };

    const attendance = new Attendance(attendanceData);
    await attendance.save();

    // Populate the response
    await attendance.populate([
      { path: 'studentId', select: 'firstName lastName studentId email' },
      { path: 'courseId', select: 'title category type' },
      { path: 'batchId', select: 'name startDate endDate' },
      { path: 'markedBy', select: 'firstName lastName email' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Attendance marked successfully',
      data: {
        attendance
      }
    });

  } catch (error) {
    console.error('Error marking attendance:', error);
    
    if (error.message.includes('Attendance already marked')) {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to mark attendance',
      error: error.message
    });
  }
};

// Mark attendance for multiple students in a batch
const markBatchAttendance = async (req, res) => {
  try {
    const { courseId, batchId, attendanceDate, timeSlot, attendanceList, remarks } = req.body;
    const adminId = req.user.id;

    // Validate required fields
    if (!courseId || !batchId || !timeSlot || !attendanceList || !Array.isArray(attendanceList)) {
      return res.status(400).json({
        success: false,
        message: 'Course ID, Batch ID, Time Slot, and Attendance List are required'
      });
    }

    // Validate time slot
    if (!timeSlot.startTime || !timeSlot.endTime) {
      return res.status(400).json({
        success: false,
        message: 'Time slot must include startTime and endTime'
      });
    }

    // Calculate duration
    const startTime = new Date(`2000-01-01T${timeSlot.startTime}:00`);
    const endTime = new Date(`2000-01-01T${timeSlot.endTime}:00`);
    const duration = (endTime - startTime) / (1000 * 60);

    if (duration <= 0) {
      return res.status(400).json({
        success: false,
        message: 'End time must be after start time'
      });
    }

    // Check if batch exists and get enrolled students
    const batch = await Batch.findById(batchId).populate('enrolledStudents', 'firstName lastName studentId email');
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }

    if (batch.courseId.toString() !== courseId) {
      return res.status(400).json({
        success: false,
        message: 'Batch does not belong to the specified course'
      });
    }

    const enrolledStudentIds = batch.enrolledStudents.map(student => student._id.toString());
    const attendanceRecords = [];
    const errors = [];

    // Process each attendance record
    for (const attendanceItem of attendanceList) {
      const { studentId, status } = attendanceItem;

      // Validate student ID and status
      if (!studentId || !status) {
        errors.push({
          studentId,
          error: 'Student ID and status are required'
        });
        continue;
      }

      const validStatuses = ['present', 'absent', 'late', 'excused'];
      if (!validStatuses.includes(status)) {
        errors.push({
          studentId,
          error: 'Invalid status. Must be: present, absent, late, or excused'
        });
        continue;
      }

      // Check if student is enrolled
      if (!enrolledStudentIds.includes(studentId)) {
        errors.push({
          studentId,
          error: 'Student is not enrolled in this batch'
        });
        continue;
      }

      // Create attendance record
      const attendanceData = {
        studentId,
        courseId,
        batchId,
        attendanceDate: attendanceDate ? new Date(attendanceDate) : new Date(),
        status,
        timeSlot: {
          startTime: timeSlot.startTime,
          endTime: timeSlot.endTime,
          duration
        },
        remarks: remarks || '',
        markedBy: adminId
      };

      try {
        const attendance = new Attendance(attendanceData);
        await attendance.save();
        attendanceRecords.push(attendance);
      } catch (error) {
        if (error.message.includes('Attendance already marked')) {
          errors.push({
            studentId,
            error: 'Attendance already marked for this student on this date and time slot'
          });
        } else {
          errors.push({
            studentId,
            error: error.message
          });
        }
      }
    }

    // Populate the successful records
    await Attendance.populate(attendanceRecords, [
      { path: 'studentId', select: 'firstName lastName studentId email' },
      { path: 'courseId', select: 'title category type' },
      { path: 'batchId', select: 'name startDate endDate' },
      { path: 'markedBy', select: 'firstName lastName email' }
    ]);

    res.status(201).json({
      success: true,
      message: `Attendance marked for ${attendanceRecords.length} students`,
      data: {
        successfulRecords: attendanceRecords,
        errors: errors.length > 0 ? errors : undefined,
        summary: {
          totalProcessed: attendanceList.length,
          successful: attendanceRecords.length,
          failed: errors.length
        }
      }
    });

  } catch (error) {
    console.error('Error marking batch attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark batch attendance',
      error: error.message
    });
  }
};

// Get attendance records with filtering and pagination
const getAttendanceRecords = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      studentId,
      courseId,
      batchId,
      status,
      startDate,
      endDate,
      sortBy = 'attendanceDate',
      sortOrder = 'desc'
    } = req.query;

    // Build filter query
    const filter = { isActive: true };

    if (studentId) filter.studentId = studentId;
    if (courseId) filter.courseId = courseId;
    if (batchId) filter.batchId = batchId;
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
      .populate('studentId', 'firstName lastName studentId email')
      .populate('courseId', 'title category type')
      .populate('batchId', 'name startDate endDate')
      .populate('markedBy', 'firstName lastName email')
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
    console.error('Error getting attendance records:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve attendance records',
      error: error.message
    });
  }
};

// Get attendance statistics
const getAttendanceStatistics = async (req, res) => {
  try {
    const { studentId, courseId, batchId, startDate, endDate } = req.query;

    let matchQuery = { isActive: true };

    if (studentId) matchQuery.studentId = new mongoose.Types.ObjectId(studentId);
    if (courseId) matchQuery.courseId = new mongoose.Types.ObjectId(courseId);
    if (batchId) matchQuery.batchId = new mongoose.Types.ObjectId(batchId);

    if (startDate && endDate) {
      matchQuery.attendanceDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Get overall statistics
    const overallStats = await Attendance.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get statistics by course
    const courseStats = await Attendance.aggregate([
      { $match: matchQuery },
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
          statusCounts: {
            $push: {
              status: '$_id.status',
              count: '$count'
            }
          }
        }
      }
    ]);

    // Get statistics by batch
    const batchStats = await Attendance.aggregate([
      { $match: matchQuery },
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
        $group: {
          _id: '$_id.batchId',
          batchName: { $first: '$batch.name' },
          statusCounts: {
            $push: {
              status: '$_id.status',
              count: '$count'
            }
          }
        }
      }
    ]);

    // Process overall statistics
    const processedOverallStats = {
      total: 0,
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
      attendancePercentage: 0
    };

    overallStats.forEach(stat => {
      processedOverallStats[stat._id] = stat.count;
      processedOverallStats.total += stat.count;
    });

    if (processedOverallStats.total > 0) {
      processedOverallStats.attendancePercentage = Math.round(
        ((processedOverallStats.present + processedOverallStats.late) / processedOverallStats.total) * 100
      );
    }

    res.json({
      success: true,
      message: 'Attendance statistics retrieved successfully',
      data: {
        overall: processedOverallStats,
        byCourse: courseStats,
        byBatch: batchStats
      }
    });

  } catch (error) {
    console.error('Error getting attendance statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve attendance statistics',
      error: error.message
    });
  }
};

// Update attendance record
const updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;
    const adminId = req.user.id;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const validStatuses = ['present', 'absent', 'late', 'excused'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid attendance status. Must be: present, absent, late, or excused'
      });
    }

    const attendance = await Attendance.findById(id);
    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    // Update attendance
    attendance.status = status;
    if (remarks !== undefined) attendance.remarks = remarks;
    attendance.markedBy = adminId;
    attendance.markedAt = new Date();

    await attendance.save();

    // Populate the response
    await attendance.populate([
      { path: 'studentId', select: 'firstName lastName studentId email' },
      { path: 'courseId', select: 'title category type' },
      { path: 'batchId', select: 'name startDate endDate' },
      { path: 'markedBy', select: 'firstName lastName email' }
    ]);

    res.json({
      success: true,
      message: 'Attendance updated successfully',
      data: {
        attendance
      }
    });

  } catch (error) {
    console.error('Error updating attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update attendance',
      error: error.message
    });
  }
};

// Delete attendance record (soft delete)
const deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;

    const attendance = await Attendance.findById(id);
    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    // Soft delete
    attendance.isActive = false;
    await attendance.save();

    res.json({
      success: true,
      message: 'Attendance record deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete attendance record',
      error: error.message
    });
  }
};

// Get all enrollments for a student
const getStudentEnrollments = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: 'Student ID is required'
      });
    }

    // Get student
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Get all enrollments for this student
    const Enrollment = require('../models/enrollment.model');
    const enrollments = await Enrollment.find({ studentId })
      .populate('courseId', 'title category type price currency')
      .populate('batchId', 'name startDate endDate maxStudents enrolledStudents')
      .sort({ enrollmentDate: -1 });

    res.json({
      success: true,
      message: 'Student enrollments retrieved successfully',
      data: {
        student: {
          id: student._id,
          name: `${student.firstName} ${student.lastName}`,
          studentId: student.studentId,
          email: student.email
        },
        enrollments: enrollments.map(enrollment => ({
          enrollmentId: enrollment._id,
          enrollmentDate: enrollment.enrollmentDate,
          status: enrollment.status,
          paymentStatus: enrollment.paymentStatus,
          course: enrollment.courseId,
          batch: {
            id: enrollment.batchId._id,
            name: enrollment.batchId.name,
            startDate: enrollment.batchId.startDate,
            endDate: enrollment.batchId.endDate,
            maxStudents: enrollment.batchId.maxStudents,
            enrolledStudentsCount: enrollment.batchId.enrolledStudents.length,
            isStudentEnrolled: enrollment.batchId.enrolledStudents.includes(studentId)
          }
        }))
      }
    });

  } catch (error) {
    console.error('Error getting student enrollments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get student enrollments',
      error: error.message
    });
  }
};

// Get student attendance report with month-wise data
const getStudentAttendanceReport = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { year, month, startDate, endDate } = req.query;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: 'Student ID is required'
      });
    }

    // Check if student exists
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
      studentId,
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
    const enrollments = await Enrollment.find({
      studentId,
      approvalStatus: 'approved',
      status: 'enrolled'
    })
    .populate('courseId', 'title category type')
    .populate('batchId', 'name startDate endDate');

    res.json({
      success: true,
      message: 'Student attendance report retrieved successfully',
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
      message: 'Failed to get student attendance report',
      error: error.message
    });
  }
};

// Debug endpoint to check enrollment status
const checkEnrollmentStatus = async (req, res) => {
  try {
    const { studentId, courseId, batchId } = req.query;

    if (!studentId || !courseId || !batchId) {
      return res.status(400).json({
        success: false,
        message: 'Student ID, Course ID, and Batch ID are required'
      });
    }

    // Get student
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Get course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Get batch with enrolled students
    const batch = await Batch.findById(batchId).populate('enrolledStudents', 'firstName lastName studentId email');
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }

    // Check if batch belongs to course
    const batchBelongsToCourse = batch.courseId.toString() === courseId;

    // Check enrollment status
    const enrolledStudentIds = batch.enrolledStudents.map(id => id._id.toString());
    const isEnrolled = enrolledStudentIds.includes(studentId);

    res.json({
      success: true,
      message: 'Enrollment status checked',
      data: {
        student: {
          id: student._id,
          name: `${student.firstName} ${student.lastName}`,
          studentId: student.studentId,
          email: student.email
        },
        course: {
          id: course._id,
          title: course.title,
          type: course.type
        },
        batch: {
          id: batch._id,
          name: batch.name,
          courseId: batch.courseId,
          enrolledStudentsCount: batch.enrolledStudents.length
        },
        enrollment: {
          isEnrolled,
          batchBelongsToCourse,
          enrolledStudentIds,
          totalEnrolledStudents: batch.enrolledStudents.length,
          enrolledStudents: batch.enrolledStudents.map(student => ({
            id: student._id,
            name: `${student.firstName} ${student.lastName}`,
            studentId: student.studentId,
            email: student.email
          }))
        }
      }
    });

  } catch (error) {
    console.error('Error checking enrollment status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check enrollment status',
      error: error.message
    });
  }
};

module.exports = {
  markAttendanceSimple,
  markAttendance,
  markBatchAttendance,
  getAttendanceRecords,
  getAttendanceStatistics,
  updateAttendance,
  deleteAttendance,
  getStudentEnrollments,
  checkEnrollmentStatus,
  getStudentAttendanceReport
};
