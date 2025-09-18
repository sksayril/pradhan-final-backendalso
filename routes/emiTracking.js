const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const auth = require('../middleware/auth');
const {
  generateEMISchedule,
  getEMISchedule,
  getOverdueEMIs,
  applyPenalty,
  waivePenalty,
  getEMIStatistics,
  sendEMIReminder
} = require('../controllers/emiTrackingController');

// Validation middleware
const validateInvestmentId = [
  param('investmentId').isMongoId().withMessage('Valid investment ID is required')
];

const validateEMIId = [
  param('emiId').isMongoId().withMessage('Valid EMI ID is required')
];

const validatePenaltyApplication = [
  body('penaltyAmount').isFloat({ min: 0 }).withMessage('Penalty amount must be non-negative'),
  body('penaltyRate').optional().isFloat({ min: 0, max: 100 }).withMessage('Penalty rate must be between 0 and 100'),
  body('reason').isString().trim().notEmpty().withMessage('Reason is required')
];

const validatePenaltyWaiver = [
  body('reason').isString().trim().notEmpty().withMessage('Reason is required')
];

const validateEMIReminder = [
  body('reminderType').isIn(['due_date', 'overdue', 'penalty_applied', 'grace_period']).withMessage('Invalid reminder type'),
  body('reminderMethod').isIn(['email', 'sms', 'push_notification', 'whatsapp']).withMessage('Invalid reminder method'),
  body('message').optional().isString().trim().withMessage('Message must be a string')
];

const validateEMISchedule = [
  query('status').optional().isIn(['pending', 'paid', 'overdue', 'penalty_applied', 'waived', 'cancelled']).withMessage('Invalid status'),
  query('overdue').optional().isBoolean().withMessage('Overdue must be boolean')
];

const validateOverdueEMIs = [
  query('memberId').optional().isMongoId().withMessage('Valid member ID is required'),
  query('investmentId').optional().isMongoId().withMessage('Valid investment ID is required'),
  query('gracePeriodOnly').optional().isBoolean().withMessage('gracePeriodOnly must be boolean'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
];

const validateEMIStatistics = [
  query('memberId').optional().isMongoId().withMessage('Valid member ID is required'),
  query('investmentId').optional().isMongoId().withMessage('Valid investment ID is required'),
  query('startDate').optional().isISO8601().withMessage('Invalid start date format'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date format')
];

// Routes

// Generate EMI schedule for investment (Admin only)
router.post('/generate/:investmentId',
  auth.authenticate,
  auth.authorize('admin'),
  validateInvestmentId,
  generateEMISchedule
);

// Get EMI schedule for investment
router.get('/schedule/:investmentId',
  auth.authenticate,
  auth.authorize('admin'),
  validateInvestmentId,
  validateEMISchedule,
  getEMISchedule
);

// Get overdue EMIs
router.get('/overdue',
  auth.authenticate,
  auth.authorize('admin'),
  validateOverdueEMIs,
  getOverdueEMIs
);

// Apply penalty to overdue EMI (Admin only)
router.post('/penalty/:emiId',
  auth.authenticate,
  auth.authorize('admin'),
  validateEMIId,
  validatePenaltyApplication,
  applyPenalty
);

// Waive penalty for EMI (Admin only)
router.post('/waive-penalty/:emiId',
  auth.authenticate,
  auth.authorize('admin'),
  validateEMIId,
  validatePenaltyWaiver,
  waivePenalty
);

// Get EMI statistics
router.get('/statistics',
  auth.authenticate,
  auth.authorize('admin'),
  validateEMIStatistics,
  getEMIStatistics
);

// Send EMI reminder (Admin only)
router.post('/reminder/:emiId',
  auth.authenticate,
  auth.authorize('admin'),
  validateEMIId,
  validateEMIReminder,
  sendEMIReminder
);

module.exports = router;
