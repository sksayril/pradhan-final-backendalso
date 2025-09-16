const express = require('express');
const router = express.Router();
const {
  getPendingInvestmentApplications,
  getApprovedInvestmentApplications,
  getAllInvestmentApplications,
  getInvestmentApplicationDetails,
  approveInvestmentApplication,
  rejectInvestmentApplication,
  getApprovedInvestments,
  getInvestmentDetails,
  recordEMIPayment,
  applyPenalty,
  getEMIStatistics
} = require('../controllers/adminSocietyMemberInvestmentController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

// Investment Application Management Routes

// Get all pending investment applications
router.get('/applications/pending',
  authenticate,
  authorizeAdmin,
  getPendingInvestmentApplications
);

// Get all approved investment applications
router.get('/applications/approved',
  authenticate,
  authorizeAdmin,
  getApprovedInvestmentApplications
);

// Get all investment applications by status (generic endpoint)
router.get('/applications',
  authenticate,
  authorizeAdmin,
  getAllInvestmentApplications
);

// Get investment application details
router.get('/applications/:applicationId',
  authenticate,
  authorizeAdmin,
  getInvestmentApplicationDetails
);

// Approve investment application
router.patch('/applications/:applicationId/approve',
  authenticate,
  authorizeAdmin,
  approveInvestmentApplication
);

// Reject investment application
router.patch('/applications/:applicationId/reject',
  authenticate,
  authorizeAdmin,
  rejectInvestmentApplication
);

// Investment Management Routes

// Get all approved investments with EMI tracking
router.get('/investments',
  authenticate,
  authorizeAdmin,
  getApprovedInvestments
);

// Get investment details with EMI tracking
router.get('/investments/:investmentId',
  authenticate,
  authorizeAdmin,
  getInvestmentDetails
);

// Record EMI payment
router.post('/investments/:investmentId/emi-payment',
  authenticate,
  authorizeAdmin,
  recordEMIPayment
);

// Apply penalty for overdue EMI
router.post('/investments/:investmentId/penalty',
  authenticate,
  authorizeAdmin,
  applyPenalty
);

// Get EMI statistics and reports
router.get('/statistics/emi',
  authenticate,
  authorizeAdmin,
  getEMIStatistics
);

module.exports = router;
