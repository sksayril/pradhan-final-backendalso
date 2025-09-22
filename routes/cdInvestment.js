const express = require('express');
const router = express.Router();
const {
  getCDInvestmentInfo,
  requestCDInvestment,
  getMyCDInvestments,
  getCDInvestmentDetails
} = require('../controllers/cdInvestmentController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate, validateCDInvestmentRequest } = require('../middleware/validation');

// User CD Investment Routes

// Get CD investment information and user capacity
router.get('/info', authenticate, authorize('student', 'societyMember'), getCDInvestmentInfo);

// Request new CD investment
router.post('/request', authenticate, authorize('student', 'societyMember'), validate(validateCDInvestmentRequest), requestCDInvestment);

// Get user's CD investments
router.get('/my-investments', authenticate, authorize('student', 'societyMember'), getMyCDInvestments);

// Get specific CD investment details
router.get('/:cdId', authenticate, authorize('student', 'societyMember'), getCDInvestmentDetails);

module.exports = router;
