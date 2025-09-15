const express = require('express');
const router = express.Router();
const { societyMemberSignup, societyMemberLogin, logout, getProfile } = require('../controllers/authController');
const { validate, validateSocietyMemberSignup, validateSocietyMemberLogin } = require('../middleware/validation');
const { authenticate } = require('../middleware/auth');

// Public routes
router.post('/signup', validate(validateSocietyMemberSignup), societyMemberSignup);
router.post('/login', validate(validateSocietyMemberLogin), societyMemberLogin);

// Protected routes
router.post('/logout', authenticate, logout);
router.get('/profile', authenticate, getProfile);

// Society Member dashboard route (example)
router.get('/dashboard', authenticate, (req, res) => {
  if (req.userType !== 'societyMember') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Society member privileges required.'
    });
  }
  
  res.json({
    success: true,
    message: 'Welcome to Society Member Dashboard',
    data: {
      member: req.user,
      stats: {
        eventsOrganized: 0, // This would be fetched from database
        membersManaged: 0,
        upcomingEvents: 0
      }
    }
  });
});

// Society Member-specific routes
router.get('/events', authenticate, (req, res) => {
  if (req.userType !== 'societyMember') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Society member privileges required.'
    });
  }
  
  res.json({
    success: true,
    message: 'Society events',
    data: {
      events: [] // This would be fetched from database
    }
  });
});

router.get('/members', authenticate, (req, res) => {
  if (req.userType !== 'societyMember') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Society member privileges required.'
    });
  }
  
  res.json({
    success: true,
    message: 'Society members',
    data: {
      members: [] // This would be fetched from database
    }
  });
});

module.exports = router;
