const express = require('express');
const router = express.Router();
const {
  createFeeRequest,
  recordFeePayment,
  getAllFeeRequests,
  getStudentFeeRequests,
  getFeePaymentHistory,
  getFeeStatistics
} = require('../controllers/feeManagementController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

// Apply authentication and admin authorization to all routes
router.use(authenticate);
router.use(authorizeAdmin);

// Fee Request Management
router.post('/requests/create', createFeeRequest);
router.get('/requests', getAllFeeRequests);
router.get('/requests/student/:studentId', getStudentFeeRequests);

// Payment Management
router.post('/payments/record', recordFeePayment);
router.get('/payments/history', getFeePaymentHistory);

// Statistics
router.get('/statistics', getFeeStatistics);

module.exports = router;
