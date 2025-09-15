const express = require('express');
const router = express.Router();
const { adminSignup, adminLogin, logout, getProfile } = require('../controllers/authController');
const { validate, validateAdminSignup, validateAdminLogin } = require('../middleware/validation');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

// Public routes
router.post('/signup', validate(validateAdminSignup), adminSignup);
router.post('/login', validate(validateAdminLogin), adminLogin);

// Protected routes
router.post('/logout', authenticate, logout);
router.get('/profile', authenticate, authorizeAdmin, getProfile);

// Admin dashboard route (example)
router.get('/dashboard', authenticate, authorizeAdmin, (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Admin Dashboard',
    data: {
      admin: req.user,
      stats: {
        totalUsers: 0, // This would be fetched from database
        activeUsers: 0,
        totalSocieties: 0
      }
    }
  });
});

module.exports = router;
