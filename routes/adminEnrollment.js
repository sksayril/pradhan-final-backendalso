const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  checkStudentEnrollmentStatus,
  getAllEnrollments,
  getPendingEnrollments,
  approveEnrollment,
  rejectEnrollment,
  getEnrollmentStatistics,
  getEnrollmentDetails,
  syncEnrollmentWithBatch
} = require('../controllers/adminEnrollmentController');

// Apply authentication and admin authorization to all routes
router.use(authenticate);
router.use(authorize('admin'));

// Get all enrollments with filtering and pagination
router.get('/', getAllEnrollments);

// Check student enrollment status
router.get('/student/status', checkStudentEnrollmentStatus);

// Get all pending enrollment requests
router.get('/pending', getPendingEnrollments);

// Get enrollment statistics
router.get('/statistics', getEnrollmentStatistics);

// Get specific enrollment details
router.get('/:enrollmentId', getEnrollmentDetails);

// Approve student enrollment
router.put('/:enrollmentId/approve', approveEnrollment);

// Reject student enrollment
router.put('/:enrollmentId/reject', rejectEnrollment);

// Sync enrollment with batch
router.put('/:enrollmentId/sync', syncEnrollmentWithBatch);

module.exports = router;
