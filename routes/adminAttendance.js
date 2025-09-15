const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
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
} = require('../controllers/adminAttendanceController');

// Apply authentication and admin authorization to all routes
router.use(authenticate);
router.use(authorize('admin'));

// Mark attendance for a single student (simplified - auto-detect course and batch)
router.post('/mark-simple', markAttendanceSimple);

// Mark attendance for a single student (original - requires course and batch)
router.post('/mark', markAttendance);

// Mark attendance for multiple students in a batch
router.post('/mark-batch', markBatchAttendance);

// Get attendance records with filtering and pagination
router.get('/records', getAttendanceRecords);

// Get attendance statistics
router.get('/statistics', getAttendanceStatistics);

// Update attendance record
router.put('/:id', updateAttendance);

// Delete attendance record (soft delete)
router.delete('/:id', deleteAttendance);

// Get all enrollments for a student
router.get('/student/:studentId/enrollments', getStudentEnrollments);

// Debug endpoint to check enrollment status
router.get('/debug/enrollment', checkEnrollmentStatus);

// Get student attendance report with month-wise data
router.get('/student/:studentId/report', getStudentAttendanceReport);

module.exports = router;
