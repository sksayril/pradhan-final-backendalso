const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getAllLoanRequests,
  getLoanRequestDetails,
  approveLoanRequest,
  rejectLoanRequest,
  disburseLoan,
  getLoanStatistics,
  getMemberLoanSummary
} = require('../controllers/adminLoanController');
const {
  validateRequestId,
  validateLoanApproval,
  validateLoanRejection,
  validateLoanDisbursement,
  validateMemberId
} = require('../middleware/validation');

// Get all loan requests
router.get('/',
  auth.authenticate,
  auth.authorize('admin'),
  getAllLoanRequests
);

// Get loan request details
router.get('/:requestId',
  auth.authenticate,
  auth.authorize('admin'),
  validateRequestId,
  getLoanRequestDetails
);

// Approve loan request
router.put('/:requestId/approve',
  auth.authenticate,
  auth.authorize('admin'),
  validateRequestId,
  validateLoanApproval,
  approveLoanRequest
);

// Reject loan request
router.put('/:requestId/reject',
  auth.authenticate,
  auth.authorize('admin'),
  validateRequestId,
  validateLoanRejection,
  rejectLoanRequest
);

// Disburse loan
router.put('/:requestId/disburse',
  auth.authenticate,
  auth.authorize('admin'),
  validateRequestId,
  validateLoanDisbursement,
  disburseLoan
);

// Get loan statistics
router.get('/statistics/overview',
  auth.authenticate,
  auth.authorize('admin'),
  getLoanStatistics
);

// Get member loan summary
router.get('/member/:memberId/summary',
  auth.authenticate,
  auth.authorize('admin'),
  validateMemberId,
  getMemberLoanSummary
);

module.exports = router;
