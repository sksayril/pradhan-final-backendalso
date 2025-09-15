const express = require('express');
const router = express.Router();
const {
  getAvailablePlans,
  getPlanDetails,
  getMemberInvestments,
  getInvestmentDetails,
  getEMISchedule,
  getInvestmentSummary,
  calculateReturns
} = require('../controllers/memberInvestmentController');
const { authenticate } = require('../middleware/auth');

// Investment Plan Routes

// Get available investment plans
router.get('/plans', 
  authenticate, 
  getAvailablePlans
);

// Get plan details
router.get('/plans/:planId', 
  authenticate, 
  getPlanDetails
);

// Calculate investment returns
router.post('/plans/:planId/calculate', 
  authenticate, 
  calculateReturns
);

// Member Investment Routes

// Get member's investments
router.get('/investments', 
  authenticate, 
  getMemberInvestments
);

// Get investment details
router.get('/investments/:investmentId', 
  authenticate, 
  getInvestmentDetails
);

// Get EMI schedule for RD investments
router.get('/investments/:investmentId/emi-schedule', 
  authenticate, 
  getEMISchedule
);

// Get investment summary/dashboard
router.get('/summary', 
  authenticate, 
  getInvestmentSummary
);

module.exports = router;
