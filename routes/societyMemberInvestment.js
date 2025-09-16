const express = require('express');
const router = express.Router();
const {
  getMyInvestmentApplications,
  getInvestmentApplicationDetails,
  applyForInvestment,
  makePayment,
  getEMISchedule,
  getPaymentHistory,
  cancelApplication,
  getAvailableInvestmentPlans,
  getAllInvestmentData,
  getPendingStatus,
  getEMIList
} = require('../controllers/societyMemberInvestmentController');
const { authenticate } = require('../middleware/auth');

// Investment Application Routes

// Get available investment plans
router.get('/plans', 
  authenticate, 
  getAvailableInvestmentPlans
);

// Get all my investment applications
router.get('/', 
  authenticate, 
  getMyInvestmentApplications
);

// Get investment application details
router.get('/:applicationId', 
  authenticate, 
  getInvestmentApplicationDetails
);

// Apply for investment
router.post('/apply', 
  authenticate, 
  applyForInvestment
);

// Cancel investment application
router.patch('/:applicationId/cancel', 
  authenticate, 
  cancelApplication
);

// Payment Routes

// Make payment for investment
router.post('/:applicationId/payment', 
  authenticate, 
  makePayment
);

// Get EMI schedule for application
router.get('/:applicationId/emi-schedule', 
  authenticate, 
  getEMISchedule
);

// Get payment history for application
router.get('/:applicationId/payment-history', 
  authenticate, 
  getPaymentHistory
);

// New comprehensive endpoints

// Get all investment data (applications + investments)
router.get('/data/all', 
  authenticate, 
  getAllInvestmentData
);

// Get pending status (applications and payments)
router.get('/status/pending', 
  authenticate, 
  getPendingStatus
);

// Get EMI list for all investments
router.get('/emis/list', 
  authenticate, 
  getEMIList
);

module.exports = router;
