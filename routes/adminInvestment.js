const express = require('express');
const router = express.Router();
const {
  createInvestmentPlan,
  getAllInvestmentPlans,
  getInvestmentPlanById,
  updateInvestmentPlan,
  deleteInvestmentPlan,
  togglePlanStatus,
  getPlanStatistics,
  createInvestment,
  getAllInvestments,
  calculateEMICost,
  getSampleEMICosts
} = require('../controllers/adminInvestmentController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

// Investment Plan Management Routes

// Create new investment plan
router.post('/plans', 
  authenticate, 
  authorizeAdmin, 
  createInvestmentPlan
);

// Get all investment plans
router.get('/plans', 
  authenticate, 
  authorizeAdmin, 
  getAllInvestmentPlans
);

// Get investment plan by ID
router.get('/plans/:planId', 
  authenticate, 
  authorizeAdmin, 
  getInvestmentPlanById
);

// Update investment plan
router.put('/plans/:planId', 
  authenticate, 
  authorizeAdmin, 
  updateInvestmentPlan
);

// Delete investment plan
router.delete('/plans/:planId', 
  authenticate, 
  authorizeAdmin, 
  deleteInvestmentPlan
);

// Toggle plan status (activate/deactivate)
router.patch('/plans/:planId/status', 
  authenticate, 
  authorizeAdmin, 
  togglePlanStatus
);

// Get plan statistics
router.get('/plans/:planId/statistics', 
  authenticate, 
  authorizeAdmin, 
  getPlanStatistics
);

// Calculate EMI cost for specific amount
router.post('/plans/:planId/calculate-emi', 
  authenticate, 
  authorizeAdmin, 
  calculateEMICost
);

// Get sample EMI costs for a plan
router.get('/plans/:planId/sample-emi-costs', 
  authenticate, 
  authorizeAdmin, 
  getSampleEMICosts
);

// Investment Management Routes

// Create investment for society member
router.post('/investments', 
  authenticate, 
  authorizeAdmin, 
  createInvestment
);

// Get all investments
router.get('/investments', 
  authenticate, 
  authorizeAdmin, 
  getAllInvestments
);

module.exports = router;
