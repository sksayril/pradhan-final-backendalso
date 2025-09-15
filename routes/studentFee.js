const express = require('express');
const router = express.Router();
const {
  getMyFeeRequests,
  getMyPaymentHistory,
  getMyPendingFees,
  getMyFeeSummary
} = require('../controllers/studentFeeController');
const { authenticate, authorize } = require('../middleware/auth');

// Apply authentication and student authorization to all routes
router.use(authenticate);
router.use(authorize('student'));

// Student Fee Management Routes
router.get('/requests', getMyFeeRequests);
router.get('/payments/history', getMyPaymentHistory);
router.get('/pending', getMyPendingFees);
router.get('/summary', getMyFeeSummary);

module.exports = router;
