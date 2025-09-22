const express = require('express');
const router = express.Router();
const { adminSignup, adminLogin, logout, getProfile } = require('../controllers/authController');
const { getAdminDashboard, getQuickStats } = require('../controllers/adminDashboardController');
const { validate, validateAdminSignup, validateAdminLogin } = require('../middleware/validation');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

// Public routes
router.post('/signup', validate(validateAdminSignup), adminSignup);
router.post('/login', validate(validateAdminLogin), adminLogin);

// Protected routes
router.post('/logout', authenticate, logout);
router.get('/profile', authenticate, authorizeAdmin, getProfile);

// Admin dashboard routes
router.get('/dashboard', authenticate, authorizeAdmin, getAdminDashboard);
router.get('/dashboard/quick-stats', authenticate, authorizeAdmin, getQuickStats);

module.exports = router;
