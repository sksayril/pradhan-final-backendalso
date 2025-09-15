const jwt = require('jsonwebtoken');
const Admin = require('../models/admin.model');
const Student = require('../models/student.model');
const SocietyMember = require('../models/societyMember.model');

// Generate JWT token
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET || 'fallback-secret', {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Verify JWT token
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
};

// Authentication middleware
const authenticate = async (req, res, next) => {
  try {
    let token;
    
    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    // Check for token in cookies
    if (!token && req.cookies.token) {
      token = req.cookies.token;
    }
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }
    
    // Verify token
    const decoded = verifyToken(token);
    
    // Find user based on user type
    let user;
    switch (decoded.userType) {
      case 'admin':
        user = await Admin.findById(decoded.id).select('+password');
        break;
      case 'student':
        user = await Student.findById(decoded.id).select('+password');
        break;
      case 'societyMember':
        user = await SocietyMember.findById(decoded.id).select('+password');
        break;
      default:
        return res.status(401).json({
          success: false,
          message: 'Invalid token. Unknown user type.'
        });
    }
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token is no longer valid. User not found.'
      });
    }
    
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated.'
      });
    }
    
    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });
    
    req.user = user;
    req.userType = decoded.userType;
    next();
    
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired.'
      });
    }
    
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication.'
    });
  }
};

// Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }
    
    if (req.userType === 'admin' && roles.includes('admin')) {
      return next();
    }
    
    if (req.userType === 'student' && roles.includes('student')) {
      return next();
    }
    
    if (req.userType === 'societyMember' && roles.includes('societyMember')) {
      return next();
    }
    
    return res.status(403).json({
      success: false,
      message: 'Access denied. Insufficient permissions.'
    });
  };
};

// Admin-specific authorization
const authorizeAdmin = (req, res, next) => {
  if (req.userType !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }
  next();
};

// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token && req.cookies.token) {
      token = req.cookies.token;
    }
    
    if (token) {
      const decoded = verifyToken(token);
      
      let user;
      switch (decoded.userType) {
        case 'admin':
          user = await Admin.findById(decoded.id);
          break;
        case 'student':
          user = await Student.findById(decoded.id);
          break;
        case 'societyMember':
          user = await SocietyMember.findById(decoded.id);
          break;
      }
      
      if (user && user.isActive) {
        req.user = user;
        req.userType = decoded.userType;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};

module.exports = {
  generateToken,
  verifyToken,
  authenticate,
  authorize,
  authorizeAdmin,
  optionalAuth
};
