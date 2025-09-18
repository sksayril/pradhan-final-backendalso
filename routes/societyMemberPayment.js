const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const auth = require('../middleware/auth');
const fileUpload = require('../middleware/fileUpload');
const {
  generatePaymentOrder,
  processPaymentCallback,
  uploadPaymentScreenshot,
  getPaymentHistory,
  getEMIDetails,
  getInvestmentPaymentSummary,
  getPaymentDetails,
  createCashPaymentRequest,
  getPendingEMIs,
  getPendingEMIsByMonth,
  getPaymentOptions
} = require('../controllers/societyMemberPaymentController');

// Validation middleware
const validatePaymentOrder = [
  body('investmentId').isMongoId().withMessage('Valid investment ID is required'),
  body('emiNumber').optional().isInt({ min: 1 }).withMessage('EMI number must be a positive integer'),
  body('amount').isFloat({ min: 1 }).withMessage('Amount must be greater than 0'),
  body('paymentMethod').isIn(['upi', 'net_banking', 'credit_card', 'debit_card', 'wallet']).withMessage('Invalid payment method')
];

const validatePaymentCallback = [
  body('paymentId').notEmpty().withMessage('Payment ID is required'),
  body('transactionId').notEmpty().withMessage('Transaction ID is required'),
  body('gatewayResponse').isObject().withMessage('Gateway response is required')
];

const validateScreenshotUpload = [
  body('screenshotType').isIn(['payment_confirmation', 'bank_statement', 'upi_screenshot', 'receipt', 'other']).withMessage('Invalid screenshot type'),
  body('description').optional().isString().trim().withMessage('Description must be a string')
];

const validatePaymentHistory = [
  query('status').optional().isIn(['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded']).withMessage('Invalid status'),
  query('paymentType').optional().isIn(['cash', 'online', 'cheque', 'bank_transfer']).withMessage('Invalid payment type'),
  query('startDate').optional().isISO8601().withMessage('Invalid start date format'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date format'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
];

const validateInvestmentId = [
  param('investmentId').isMongoId().withMessage('Valid investment ID is required')
];

const validatePaymentId = [
  param('paymentId').notEmpty().withMessage('Payment ID is required')
];

const validateCashPaymentRequest = [
  body('investmentId').isMongoId().withMessage('Valid investment ID is required'),
  body('emiNumber').optional().isInt({ min: 1 }).withMessage('EMI number must be a positive integer'),
  body('amount').isFloat({ min: 1 }).withMessage('Amount must be greater than 0'),
  body('remarks').optional().isString().trim().withMessage('Remarks must be a string')
];

const validatePendingEMIs = [
  query('month').optional().isInt({ min: 1, max: 12 }).withMessage('Month must be between 1 and 12'),
  query('year').optional().isInt({ min: 2020 }).withMessage('Year must be valid'),
  query('investmentId').optional().isMongoId().withMessage('Valid investment ID is required'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
];

const validateEMIId = [
  param('emiId').isMongoId().withMessage('Valid EMI ID is required')
];

// Routes

// Generate payment order for online payments
router.post('/generate-order', 
  auth.authenticate,
  auth.authorize('societyMember'),
  validatePaymentOrder,
  generatePaymentOrder
);

// Process payment callback (webhook from payment gateway)
router.post('/callback', 
  validatePaymentCallback,
  processPaymentCallback
);

// Upload payment screenshot
router.post('/:paymentId/screenshot',
  auth.authenticate,
  auth.authorize('societyMember'),
  validatePaymentId,
  validateScreenshotUpload,
  fileUpload.uploadSingle('screenshot'),
  uploadPaymentScreenshot
);

// Get payment history
router.get('/history',
  auth.authenticate,
  auth.authorize('societyMember'),
  validatePaymentHistory,
  getPaymentHistory
);

// Get payment details
router.get('/:paymentId',
  auth.authenticate,
  auth.authorize('societyMember'),
  validatePaymentId,
  getPaymentDetails
);

// Get EMI details for investment
router.get('/emi/:investmentId',
  auth.authenticate,
  auth.authorize('societyMember'),
  validateInvestmentId,
  getEMIDetails
);

// Get investment payment summary
router.get('/summary/investments',
  auth.authenticate,
  auth.authorize('societyMember'),
  getInvestmentPaymentSummary
);

// Create cash payment request
router.post('/cash-payment',
  auth.authenticate,
  auth.authorize('societyMember'),
  validateCashPaymentRequest,
  createCashPaymentRequest
);

// Get pending EMIs
router.get('/pending-emis',
  auth.authenticate,
  auth.authorize('societyMember'),
  validatePendingEMIs,
  getPendingEMIs
);

// Get pending EMIs grouped by month
router.get('/pending-emis/monthly',
  auth.authenticate,
  auth.authorize('societyMember'),
  getPendingEMIsByMonth
);

// Get payment options for specific EMI
router.get('/payment-options/:emiId',
  auth.authenticate,
  auth.authorize('societyMember'),
  validateEMIId,
  getPaymentOptions
);

module.exports = router;
