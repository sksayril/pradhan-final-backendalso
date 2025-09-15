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
  getAvailableInvestmentPlans
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

module.exports = router;
