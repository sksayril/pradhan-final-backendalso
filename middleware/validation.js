// Custom validation functions without third-party libraries

// Email validation
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation
const isValidPassword = (password) => {
  if (typeof password !== 'string') return false;
  if (password.length < 6) return false;
  if (password.length > 128) return false;
  
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  
  return hasLowercase && hasUppercase && hasNumber;
};

// Name validation
const isValidName = (name) => {
  if (typeof name !== 'string') return false;
  const trimmed = name.trim();
  if (trimmed.length < 2) return false;
  if (trimmed.length > 50) return false;
  const nameRegex = /^[a-zA-Z\s]+$/;
  return nameRegex.test(trimmed);
};

// Phone number validation
const isValidPhoneNumber = (phone) => {
  if (!phone) return true; // Optional field
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone);
};

// Date validation
const isValidDate = (date) => {
  if (!date) return true; // Optional field
  const dateObj = new Date(date);
  return dateObj instanceof Date && !isNaN(dateObj) && dateObj < new Date();
};

// URL validation
const isValidURL = (url) => {
  if (!url) return true; // Optional field
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Admin validation functions
const validateAdminSignup = (data) => {
  const errors = [];
  
  if (!data.email || !isValidEmail(data.email)) {
    errors.push('Please provide a valid email address');
  }
  
  if (!data.password || !isValidPassword(data.password)) {
    errors.push('Password must be at least 6 characters long and contain at least one lowercase letter, one uppercase letter, and one number');
  }
  
  if (!data.firstName || !isValidName(data.firstName)) {
    errors.push('First name must be 2-50 characters long and contain only letters and spaces');
  }
  
  if (!data.lastName || !isValidName(data.lastName)) {
    errors.push('Last name must be 2-50 characters long and contain only letters and spaces');
  }
  
  if (data.role && !['super-admin', 'admin', 'moderator'].includes(data.role)) {
    errors.push('Role must be one of: super-admin, admin, moderator');
  }
  
  if (data.permissions && Array.isArray(data.permissions)) {
    const validPermissions = ['user-management', 'content-management', 'system-settings', 'reports'];
    const invalidPermissions = data.permissions.filter(p => !validPermissions.includes(p));
    if (invalidPermissions.length > 0) {
      errors.push('Invalid permissions provided');
    }
  }
  
  return errors;
};

const validateAdminLogin = (data) => {
  const errors = [];
  
  if (!data.email || !isValidEmail(data.email)) {
    errors.push('Please provide a valid email address');
  }
  
  if (!data.password) {
    errors.push('Password is required');
  }
  
  return errors;
};

// Student validation functions
const validateStudentSignup = (data) => {
  const errors = [];
  
  if (!data.email || !isValidEmail(data.email)) {
    errors.push('Please provide a valid email address');
  }
  
  if (!data.password || !isValidPassword(data.password)) {
    errors.push('Password must be at least 6 characters long and contain at least one lowercase letter, one uppercase letter, and one number');
  }
  
  if (!data.firstName || !isValidName(data.firstName)) {
    errors.push('First name must be 2-50 characters long and contain only letters and spaces');
  }
  
  if (!data.lastName || !isValidName(data.lastName)) {
    errors.push('Last name must be 2-50 characters long and contain only letters and spaces');
  }
  
  // Student ID is now auto-generated, no validation needed
  
  if (!data.department || typeof data.department !== 'string' || data.department.trim().length < 2 || data.department.trim().length > 100) {
    errors.push('Department must be 2-100 characters long');
  }
  
  if (!data.year || !['1st', '2nd', '3rd', '4th', '5th', 'Graduate', 'Post-Graduate'].includes(data.year)) {
    errors.push('Academic year must be one of: 1st, 2nd, 3rd, 4th, 5th, Graduate, Post-Graduate');
  }
  
  if (data.phoneNumber && !isValidPhoneNumber(data.phoneNumber)) {
    errors.push('Please provide a valid phone number');
  }
  
  if (data.dateOfBirth && !isValidDate(data.dateOfBirth)) {
    errors.push('Date of birth must be in the past');
  }
  
  if (data.profilePicture && !isValidURL(data.profilePicture)) {
    errors.push('Please provide a valid URL for profile picture');
  }
  
  return errors;
};

const validateStudentLogin = (data) => {
  const errors = [];
  
  if (!data.email || !isValidEmail(data.email)) {
    errors.push('Please provide a valid email address');
  }
  
  if (!data.password) {
    errors.push('Password is required');
  }
  
  return errors;
};

// Society Member validation functions
const validateSocietyMemberSignup = (data) => {
  const errors = [];
  
  if (!data.email || !isValidEmail(data.email)) {
    errors.push('Please provide a valid email address');
  }
  
  if (!data.password || !isValidPassword(data.password)) {
    errors.push('Password must be at least 6 characters long and contain at least one lowercase letter, one uppercase letter, and one number');
  }
  
  if (!data.firstName || !isValidName(data.firstName)) {
    errors.push('First name must be 2-50 characters long and contain only letters and spaces');
  }
  
  if (!data.lastName || !isValidName(data.lastName)) {
    errors.push('Last name must be 2-50 characters long and contain only letters and spaces');
  }
  
  // Member ID is now auto-generated, no validation needed
  
  if (!data.societyName || typeof data.societyName !== 'string' || data.societyName.trim().length < 2 || data.societyName.trim().length > 100) {
    errors.push('Society name must be 2-100 characters long');
  }
  
  if (!data.position || !['President', 'Vice-President', 'Secretary', 'Treasurer', 'Member', 'Coordinator', 'Volunteer'].includes(data.position)) {
    errors.push('Position must be one of: President, Vice-President, Secretary, Treasurer, Member, Coordinator, Volunteer');
  }
  
  if (data.department && (typeof data.department !== 'string' || data.department.trim().length > 100)) {
    errors.push('Department cannot exceed 100 characters');
  }
  
  if (data.phoneNumber && !isValidPhoneNumber(data.phoneNumber)) {
    errors.push('Please provide a valid phone number');
  }
  
  if (data.dateOfBirth && !isValidDate(data.dateOfBirth)) {
    errors.push('Date of birth must be in the past');
  }
  
  if (data.profilePicture && !isValidURL(data.profilePicture)) {
    errors.push('Please provide a valid URL for profile picture');
  }
  
  return errors;
};

const validateSocietyMemberLogin = (data) => {
  const errors = [];
  
  if (!data.email || !isValidEmail(data.email)) {
    errors.push('Please provide a valid email address');
  }
  
  if (!data.password) {
    errors.push('Password is required');
  }
  
  return errors;
};

// Validation middleware factory
const validate = (validationFunction) => {
  return (req, res, next) => {
    const errors = validationFunction(req.body);
    
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors
      });
    }
    
    next();
  };
};

// Sanitize input middleware
const sanitizeInput = (req, res, next) => {
  const sanitizeObject = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        // Remove potentially dangerous characters and trim
        obj[key] = obj[key].trim();
        if (key === 'email') {
          obj[key] = obj[key].toLowerCase();
        }
        if (key === 'studentId' || key === 'memberId') {
          obj[key] = obj[key].toUpperCase();
        }
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObject(obj[key]);
      }
    }
  };
  
  if (req.body) {
    sanitizeObject(req.body);
  }
  
  next();
};

// KYC validation functions
const validateStudentKyc = (data) => {
  const errors = [];
  
  if (!data.aadharNumber) {
    errors.push('Aadhar number is required');
  } else if (typeof data.aadharNumber !== 'string') {
    errors.push('Aadhar number must be a string');
  } else if (!/^\d{12}$/.test(data.aadharNumber.trim())) {
    errors.push('Aadhar number must be exactly 12 digits');
  }
  
  return errors;
};

const validateSocietyMemberKyc = (data) => {
  const errors = [];
  
  if (!data.aadharNumber) {
    errors.push('Aadhar number is required');
  } else if (typeof data.aadharNumber !== 'string') {
    errors.push('Aadhar number must be a string');
  } else if (!/^\d{12}$/.test(data.aadharNumber.trim())) {
    errors.push('Aadhar number must be exactly 12 digits');
  }
  
  if (!data.panNumber) {
    errors.push('PAN number is required');
  } else if (typeof data.panNumber !== 'string') {
    errors.push('PAN number must be a string');
  } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(data.panNumber.trim().toUpperCase())) {
    errors.push('PAN number must be in format: ABCDE1234F');
  }
  
  return errors;
};

const validateKycApproval = (data) => {
  const errors = [];
  
  if (!data.kycId) {
    errors.push('KYC ID is required');
  }
  
  return errors;
};

const validateKycRejection = (data) => {
  const errors = [];
  
  if (!data.kycId) {
    errors.push('KYC ID is required');
  }
  
  if (!data.rejectionReason || data.rejectionReason.trim().length < 10) {
    errors.push('Rejection reason must be at least 10 characters long');
  }
  
  return errors;
};

module.exports = {
  validate,
  sanitizeInput,
  validateAdminSignup,
  validateAdminLogin,
  validateStudentSignup,
  validateStudentLogin,
  validateSocietyMemberSignup,
  validateSocietyMemberLogin,
  validateStudentKyc,
  validateSocietyMemberKyc,
  validateKycApproval,
  validateKycRejection
};