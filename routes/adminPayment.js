const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const auth = require('../middleware/auth');
const {
  getPendingCashPayments,
  verifyCashPayment,
  getAllPendingEMIs,
  getPendingEMIsGroupedByMonth,
  getPaymentStatistics,
  getMemberPaymentSummary
} = require('../controllers/adminSocietyMemberPaymentController');

// Validation middleware
const validateCashPaymentVerification = [
  body('verificationStatus').isIn(['verified', 'rejected']).withMessage('Invalid verification status'),
  body('remarks').optional().isString().trim().withMessage('Remarks must be a string'),
  body('receiptNumber').optional().isString().trim().withMessage('Receipt number must be a string'),
  body('receivedAmount').optional().isFloat({ min: 1 }).withMessage('Received amount must be greater than 0')
];

const validatePaymentId = [
  param('paymentId').notEmpty().withMessage('Payment ID is required')
];

const validateMemberId = [
  param('memberId').isMongoId().withMessage('Valid member ID is required')
];

const validatePendingCashPayments = [
  query('memberId').optional().isMongoId().withMessage('Valid member ID is required'),
  query('investmentId').optional().isMongoId().withMessage('Valid investment ID is required'),
  query('startDate').optional().isISO8601().withMessage('Invalid start date format'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date format'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
];

const validatePendingEMIs = [
  query('memberId').optional().isMongoId().withMessage('Valid member ID is required'),
  query('investmentId').optional().isMongoId().withMessage('Valid investment ID is required'),
  query('month').optional().isInt({ min: 1, max: 12 }).withMessage('Month must be between 1 and 12'),
  query('year').optional().isInt({ min: 2020 }).withMessage('Year must be valid'),
  query('overdue').optional().isBoolean().withMessage('Overdue must be boolean'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
];

const validatePaymentStatistics = [
  query('startDate').optional().isISO8601().withMessage('Invalid start date format'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date format'),
  query('memberId').optional().isMongoId().withMessage('Valid member ID is required'),
  query('investmentId').optional().isMongoId().withMessage('Valid investment ID is required')
];

// Routes

// Get pending cash payments (Admin only)
router.get('/pending-cash-payments',
  auth.authenticate,
  auth.authorize('admin'),
  validatePendingCashPayments,
  getPendingCashPayments
);

// Verify cash payment (Admin only)
router.put('/verify-cash/:paymentId',
  auth.authenticate,
  auth.authorize('admin'),
  validatePaymentId,
  validateCashPaymentVerification,
  verifyCashPayment
);

// Get all pending EMIs (Admin only)
router.get('/pending-emis',
  auth.authenticate,
  auth.authorize('admin'),
  validatePendingEMIs,
  getAllPendingEMIs
);

// Get pending EMIs grouped by month (Admin only)
router.get('/pending-emis/monthly',
  auth.authenticate,
  auth.authorize('admin'),
  getPendingEMIsGroupedByMonth
);

// Get member payment summary (Admin only)
router.get('/member-summary/:memberId',
  auth.authenticate,
  auth.authorize('admin'),
  validateMemberId,
  getMemberPaymentSummary
);

// Get payment statistics (Admin only)
router.get('/statistics',
  auth.authenticate,
  auth.authorize('admin'),
  validatePaymentStatistics,
  getPaymentStatistics
);

module.exports = router;
 