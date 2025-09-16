const express = require('express');
const router = express.Router();
const {
  // Marksheet management
  createMarksheet,
  getAllMarksheets,
  getMarksheetById,
  updateMarksheet,
  verifyMarksheet,
  getMarksheetsByStudent,
  
  // Certificate management
  generateCertificateFromMarksheet,
  createCertificate,
  getAllCertificates,
  getCertificateById,
  updateCertificate,
  verifyCertificate,
  issueCertificate,
  getCertificatesByStudent,
  getStudentCertificateData,
  
  // Statistics
  getDocumentStatistics
} = require('../controllers/adminStudentDocumentController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

// ==================== MARKSHEET MANAGEMENT ROUTES ====================

// Create marksheet for student
router.post('/marksheets',
  authenticate,
  authorizeAdmin,
  createMarksheet
);

// Get all marksheets with filtering
router.get('/marksheets',
  authenticate,
  authorizeAdmin,
  getAllMarksheets
);

// Get marksheet by ID
router.get('/marksheets/:marksheetId',
  authenticate,
  authorizeAdmin,
  getMarksheetById
);

// Update marksheet
router.put('/marksheets/:marksheetId',
  authenticate,
  authorizeAdmin,
  updateMarksheet
);

// Verify marksheet
router.patch('/marksheets/:marksheetId/verify',
  authenticate,
  authorizeAdmin,
  verifyMarksheet
);

// Get marksheets by student
router.get('/students/:studentId/marksheets',
  authenticate,
  authorizeAdmin,
  getMarksheetsByStudent
);

// ==================== CERTIFICATE MANAGEMENT ROUTES ====================

// Generate certificate from marksheet number
router.post('/certificates/generate-from-marksheet/:marksheetNumber',
  authenticate,
  authorizeAdmin,
  generateCertificateFromMarksheet
);

// Create certificate for student
router.post('/certificates',
  authenticate,
  authorizeAdmin,
  createCertificate
);

// Get all certificates with filtering
router.get('/certificates',
  authenticate,
  authorizeAdmin,
  getAllCertificates
);

// Get certificate by ID
router.get('/certificates/:certificateId',
  authenticate,
  authorizeAdmin,
  getCertificateById
);

// Update certificate
router.put('/certificates/:certificateId',
  authenticate,
  authorizeAdmin,
  updateCertificate
);

// Verify certificate
router.patch('/certificates/:certificateId/verify',
  authenticate,
  authorizeAdmin,
  verifyCertificate
);

// Issue certificate
router.patch('/certificates/:certificateId/issue',
  authenticate,
  authorizeAdmin,
  issueCertificate
);

// Get certificates by student
router.get('/students/:studentId/certificates',
  authenticate,
  authorizeAdmin,
  getCertificatesByStudent
);

// Get student certificate data (enhanced with all details)
router.get('/students/:studentId/certificate-data',
  authenticate,
  authorizeAdmin,
  getStudentCertificateData
);

// ==================== STATISTICS AND REPORTS ROUTES ====================

// Get document statistics
router.get('/statistics',
  authenticate,
  authorizeAdmin,
  getDocumentStatistics
);

module.exports = router;
