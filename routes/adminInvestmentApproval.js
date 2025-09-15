const express = require('express');
const router = express.Router();
const {
  getAllInvestmentApplications,
  getInvestmentApplicationDetails,
  approveApplication,
  rejectApplication,
  recordPayment,
  getApplicationStatistics,
  addNoteToApplication,
  getAllSocietyMemberInvestments,
  getSocietyMemberInvestmentDetails,
  getAllSocietyMembersWithPendingApplications,
  getAllPendingInvestmentPlanRequests,
  getPendingApplicationsStatistics,
  bulkApproveApplications,
  bulkRejectApplications
} = require('../controllers/adminInvestmentApprovalController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

// Investment Application Management Routes

// Get all investment applications
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
  approveApplication
);

// Reject investment application
router.patch('/applications/:applicationId/reject', 
  authenticate, 
  authorizeAdmin, 
  rejectApplication
);

// Record payment for investment application
router.post('/applications/:applicationId/payment', 
  authenticate, 
  authorizeAdmin, 
  recordPayment
);

// Add note to application
router.post('/applications/:applicationId/notes', 
  authenticate, 
  authorizeAdmin, 
  addNoteToApplication
);

// Get application statistics
router.get('/statistics', 
  authenticate, 
  authorizeAdmin, 
  getApplicationStatistics
);

// Society Member Investment Management Routes

// Get all society member investments (created investments)
router.get('/investments', 
  authenticate, 
  authorizeAdmin, 
  getAllSocietyMemberInvestments
);

// Get society member investment details
router.get('/investments/:investmentId', 
  authenticate, 
  authorizeAdmin, 
  getSocietyMemberInvestmentDetails
);

// Pending Applications Management Routes

// Get all society members with pending applications
router.get('/pending-members', 
  authenticate, 
  authorizeAdmin, 
  getAllSocietyMembersWithPendingApplications
);

// Get all pending investment plan acceptance requests
router.get('/pending-requests', 
  authenticate, 
  authorizeAdmin, 
  getAllPendingInvestmentPlanRequests
);

// Get pending applications statistics
router.get('/pending-statistics', 
  authenticate, 
  authorizeAdmin, 
  getPendingApplicationsStatistics
);

// Bulk Operations Routes

// Bulk approve multiple applications
router.patch('/applications/bulk-approve', 
  authenticate, 
  authorizeAdmin, 
  bulkApproveApplications
);

// Bulk reject multiple applications
router.patch('/applications/bulk-reject', 
  authenticate, 
  authorizeAdmin, 
  bulkRejectApplications
);

module.exports = router;
