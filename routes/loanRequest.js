const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { uploadSingle } = require('../middleware/fileUpload');
const {
  createLoanRequest,
  getMemberLoanRequests,
  getLoanRequestDetails,
  uploadLoanDocuments,
  deleteLoanDocument,
  updateLoanRequest,
  cancelLoanRequest
} = require('../controllers/loanRequestController');
const {
  validateLoanRequest,
  validateLoanRequestUpdate,
  validateRequestId,
  validateDocumentUpload
} = require('../middleware/validation');

// Create loan request
router.post('/',
  auth.authenticate,
  auth.authorize('societyMember'),
  validateLoanRequest,
  createLoanRequest
);

// Get member's loan requests
router.get('/',
  auth.authenticate,
  auth.authorize('societyMember'),
  getMemberLoanRequests
);

// Get loan request details
router.get('/:requestId',
  auth.authenticate,
  auth.authorize('societyMember'),
  validateRequestId,
  getLoanRequestDetails
);

// Update loan request (only for pending requests)
router.put('/:requestId',
  auth.authenticate,
  auth.authorize('societyMember'),
  validateRequestId,
  validateLoanRequestUpdate,
  updateLoanRequest
);

// Cancel loan request (only for pending requests)
router.delete('/:requestId',
  auth.authenticate,
  auth.authorize('societyMember'),
  validateRequestId,
  cancelLoanRequest
);

// Upload loan documents
router.post('/:requestId/documents',
  auth.authenticate,
  auth.authorize('societyMember'),
  validateRequestId,
  uploadSingle('document'),
  validateDocumentUpload,
  uploadLoanDocuments
);

// Delete loan document
router.delete('/:requestId/documents/:documentId',
  auth.authenticate,
  auth.authorize('societyMember'),
  validateRequestId,
  deleteLoanDocument
);

module.exports = router;
