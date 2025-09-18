const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getDashboardData,
  getUpcomingEMIs,
  getMyLoansSummary,
  getMyInvestmentsSummary,
  getRecentPayments,
  getDashboardStatistics,
  getNotifications,
  getQuickActions
} = require('../controllers/societyMemberDashboardController');

// Get comprehensive dashboard data
router.get('/',
  auth.authenticate,
  auth.authorize('societyMember'),
  getDashboardData
);

// Get upcoming EMIs
router.get('/upcoming-emis',
  auth.authenticate,
  auth.authorize('societyMember'),
  getUpcomingEMIs
);

// Get my loans summary
router.get('/my-loans',
  auth.authenticate,
  auth.authorize('societyMember'),
  getMyLoansSummary
);

// Get my investments summary
router.get('/my-investments',
  auth.authenticate,
  auth.authorize('societyMember'),
  getMyInvestmentsSummary
);

// Get recent payments
router.get('/recent-payments',
  auth.authenticate,
  auth.authorize('societyMember'),
  getRecentPayments
);

// Get dashboard statistics
router.get('/statistics',
  auth.authenticate,
  auth.authorize('societyMember'),
  getDashboardStatistics
);

// Get notifications
router.get('/notifications',
  auth.authenticate,
  auth.authorize('societyMember'),
  getNotifications
);

// Get quick actions
router.get('/quick-actions',
  auth.authenticate,
  auth.authorize('societyMember'),
  getQuickActions
);

module.exports = router;
