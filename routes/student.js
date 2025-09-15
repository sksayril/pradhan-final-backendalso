const express = require('express');
const router = express.Router();
const { studentSignup, studentLogin, logout, getProfile } = require('../controllers/authController');
const { validate, validateStudentSignup, validateStudentLogin } = require('../middleware/validation');
const { authenticate } = require('../middleware/auth');

// Public routes
router.post('/signup', validate(validateStudentSignup), studentSignup);
router.post('/login', validate(validateStudentLogin), studentLogin);

// Protected routes
router.post('/logout', authenticate, logout);
router.get('/profile', authenticate, getProfile);

// Student dashboard route (example)
router.get('/dashboard', authenticate, (req, res) => {
  if (req.userType !== 'student') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Student privileges required.'
    });
  }
  
  res.json({
    success: true,
    message: 'Welcome to Student Dashboard',
    data: {
      student: req.user,
      stats: {
        enrolledSocieties: 0, // This would be fetched from database
        eventsAttended: 0,
        achievements: 0
      }
    }
  });
});

// Student-specific routes
router.get('/societies', authenticate, (req, res) => {
  if (req.userType !== 'student') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Student privileges required.'
    });
  }
  
  res.json({
    success: true,
    message: 'Student societies',
    data: {
      societies: [] // This would be fetched from database
    }
  });
});

module.exports = router;
