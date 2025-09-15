const express = require('express');
const router = express.Router();
const {
  submitStudentKyc,
  submitSocietyMemberKyc,
  getStudentKycStatus,
  getSocietyMemberKycStatus,
  getAllPendingKyc,
  approveStudentKyc,
  rejectStudentKyc,
  approveSocietyMemberKyc,
  rejectSocietyMemberKyc
} = require('../controllers/kycController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const { uploadSingle, uploadMultiple, uploadSocietyMemberKyc, handleUploadError } = require('../middleware/fileUpload');
const { validate, validateStudentKyc, validateSocietyMemberKyc, validateKycApproval, validateKycRejection } = require('../middleware/validation');

// Student KYC routes
router.post('/student/submit', 
  authenticate, 
  uploadSingle('aadharCardImage'),
  handleUploadError,
  validate(validateStudentKyc),
  submitStudentKyc
);

router.get('/student/status', authenticate, getStudentKycStatus);

// Society Member KYC routes
router.post('/society-member/submit', 
  authenticate, 
  uploadSocietyMemberKyc(),
  handleUploadError,
  validate(validateSocietyMemberKyc),
  submitSocietyMemberKyc
);

router.get('/society-member/status', authenticate, getSocietyMemberKycStatus);

// Admin KYC management routes
router.get('/admin/pending', authenticate, authorizeAdmin, getAllPendingKyc);

router.post('/admin/student/approve', authenticate, authorizeAdmin, validate(validateKycApproval), approveStudentKyc);
router.post('/admin/student/reject', authenticate, authorizeAdmin, validate(validateKycRejection), rejectStudentKyc);

router.post('/admin/society-member/approve', authenticate, authorizeAdmin, validate(validateKycApproval), approveSocietyMemberKyc);
router.post('/admin/society-member/reject', authenticate, authorizeAdmin, validate(validateKycRejection), rejectSocietyMemberKyc);

module.exports = router;
