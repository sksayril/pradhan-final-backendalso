const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  getMyAttendance,
  getMyAttendanceStats,
  getMyCourseAttendance,
  getMyBatchAttendance,
  getMyAttendanceSummary,
  getMyAttendanceReport,
  getMyProfile
} = require('../controllers/studentAttendanceController');

// Apply authentication and student authorization to all routes
router.use(authenticate);
router.use(authorize('student'));

// Get student's own attendance records
router.get('/', getMyAttendance);

// Get student's attendance statistics
router.get('/statistics', getMyAttendanceStats);

// Get student's attendance summary
router.get('/summary', getMyAttendanceSummary);

// Get student's attendance for a specific course
router.get('/course/:courseId', getMyCourseAttendance);

// Get student's attendance for a specific batch
router.get('/batch/:batchId', getMyBatchAttendance);

// Get student's attendance report with month-wise data
router.get('/report', getMyAttendanceReport);

// Get student's complete profile data
router.get('/profile', getMyProfile);

module.exports = router;
