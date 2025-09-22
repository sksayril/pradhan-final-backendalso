const express = require('express');
const router = express.Router();
const {
  getPendingCDRequests,
  approveCDRequest,
  rejectCDRequest,
  getAllCDInvestments,
  getCDInvestmentDetailsAdmin
} = require('../controllers/cdInvestmentController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const { validate, validateCDApproval, validateCDRejection } = require('../middleware/validation');

// Admin CD Investment Routes

// Get all pending CD investment requests
router.get('/pending-requests', authenticate, authorizeAdmin, getPendingCDRequests);

// Get all CD investments with filtering and search
router.get('/all-investments', authenticate, authorizeAdmin, getAllCDInvestments);

// Get specific CD investment details (admin view)
router.get('/:cdId', authenticate, authorizeAdmin, getCDInvestmentDetailsAdmin);

// Approve CD investment request
router.patch('/:cdId/approve', authenticate, authorizeAdmin, validate(validateCDApproval), approveCDRequest);

// Reject CD investment request
router.patch('/:cdId/reject', authenticate, authorizeAdmin, validate(validateCDRejection), rejectCDRequest);

module.exports = router;
