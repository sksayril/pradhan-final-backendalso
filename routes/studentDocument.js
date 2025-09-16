const express = require('express');
const router = express.Router();
const {
  // Student marksheet access
  getMyMarksheets,
  getMarksheetDetails,
  getMarksheetByVerificationCode,
  
  // Student certificate access
  getMyCertificates,
  getCertificateDetails,
  getCertificateByVerificationCode,
  
  // Document summary
  getMyDocumentSummary,
  
  // Public verification
  verifyMarksheetPublic,
  verifyCertificatePublic
} = require('../controllers/studentDocumentController');
const { authenticate } = require('../middleware/auth');

// ==================== STUDENT MARKSHEET ROUTES ====================

// Get all marksheets for logged-in student
router.get('/marksheets',
  authenticate,
  getMyMarksheets
);

// Get marksheet details by ID
router.get('/marksheets/:marksheetId',
  authenticate,
  getMarksheetDetails
);

// Get marksheet by verification code (for student)
router.get('/marksheets/verify/:verificationCode',
  authenticate,
  getMarksheetByVerificationCode
);

// ==================== STUDENT CERTIFICATE ROUTES ====================

// Get all certificates for logged-in student
router.get('/certificates',
  authenticate,
  getMyCertificates
);

// Get certificate details by ID
router.get('/certificates/:certificateId',
  authenticate,
  getCertificateDetails
);

// Get certificate by verification code (for student)
router.get('/certificates/verify/:verificationCode',
  authenticate,
  getCertificateByVerificationCode
);

// ==================== STUDENT DOCUMENT SUMMARY ROUTES ====================

// Get student document summary
router.get('/summary',
  authenticate,
  getMyDocumentSummary
);

// ==================== PUBLIC VERIFICATION ROUTES ====================

// Public marksheet verification (no authentication required)
router.get('/public/verify/marksheet/:verificationCode',
  verifyMarksheetPublic
);

// Public certificate verification (no authentication required)
router.get('/public/verify/certificate/:verificationCode',
  verifyCertificatePublic
);

module.exports = router;
