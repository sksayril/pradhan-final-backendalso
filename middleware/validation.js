const { body, param } = require('express-validator');

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
  
  // Check if either email or studentId is provided
  if (!data.email && !data.studentId) {
    errors.push('Please provide either email or student ID');
  }
  
  // If email is provided, validate it
  if (data.email && !isValidEmail(data.email)) {
    errors.push('Please provide a valid email address');
  }
  
  // If studentId is provided, validate it
  if (data.studentId && (typeof data.studentId !== 'string' || data.studentId.trim().length === 0)) {
    errors.push('Please provide a valid student ID');
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
  
  // Check if either email or memberId is provided
  if (!data.email && !data.memberId) {
    errors.push('Please provide either email or member ID');
  }
  
  // If email is provided, validate it
  if (data.email && !isValidEmail(data.email)) {
    errors.push('Please provide a valid email address');
  }
  
  // If memberId is provided, validate it
  if (data.memberId && (typeof data.memberId !== 'string' || data.memberId.trim().length === 0)) {
    errors.push('Please provide a valid member ID');
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

// Payment validation functions
const validatePaymentOrder = (data) => {
  const errors = [];
  
  if (!data.investmentId) {
    errors.push('Investment ID is required');
  }
  
  if (!data.amount || typeof data.amount !== 'number' || data.amount <= 0) {
    errors.push('Amount must be a positive number');
  }
  
  if (!data.paymentMethod || !['upi', 'net_banking', 'credit_card', 'debit_card', 'wallet'].includes(data.paymentMethod)) {
    errors.push('Payment method must be one of: upi, net_banking, credit_card, debit_card, wallet');
  }
  
  if (data.emiNumber && (typeof data.emiNumber !== 'number' || data.emiNumber < 1)) {
    errors.push('EMI number must be a positive integer');
  }
  
  return errors;
};

const validateCashPayment = (data) => {
  const errors = [];
  
  if (!data.memberId) {
    errors.push('Member ID is required');
  }
  
  if (!data.investmentId) {
    errors.push('Investment ID is required');
  }
  
  if (!data.amount || typeof data.amount !== 'number' || data.amount <= 0) {
    errors.push('Amount must be a positive number');
  }
  
  if (!data.paymentFor || !['principal', 'emi', 'penalty', 'interest', 'full_investment'].includes(data.paymentFor)) {
    errors.push('Payment type must be one of: principal, emi, penalty, interest, full_investment');
  }
  
  if (data.emiNumber && (typeof data.emiNumber !== 'number' || data.emiNumber < 1)) {
    errors.push('EMI number must be a positive integer');
  }
  
  if (data.receiptNumber && (typeof data.receiptNumber !== 'string' || data.receiptNumber.trim().length === 0)) {
    errors.push('Receipt number must be a non-empty string');
  }
  
  if (data.remarks && (typeof data.remarks !== 'string' || data.remarks.trim().length === 0)) {
    errors.push('Remarks must be a non-empty string');
  }
  
  return errors;
};

const validatePaymentVerification = (data) => {
  const errors = [];
  
  if (!data.verificationStatus || !['verified', 'rejected'].includes(data.verificationStatus)) {
    errors.push('Verification status must be either verified or rejected');
  }
  
  if (data.remarks && (typeof data.remarks !== 'string' || data.remarks.trim().length === 0)) {
    errors.push('Remarks must be a non-empty string');
  }
  
  return errors;
};

const validatePenaltyApplication = (data) => {
  const errors = [];
  
  if (!data.penaltyAmount || typeof data.penaltyAmount !== 'number' || data.penaltyAmount < 0) {
    errors.push('Penalty amount must be a non-negative number');
  }
  
  if (data.penaltyRate && (typeof data.penaltyRate !== 'number' || data.penaltyRate < 0 || data.penaltyRate > 100)) {
    errors.push('Penalty rate must be between 0 and 100');
  }
  
  if (!data.reason || typeof data.reason !== 'string' || data.reason.trim().length === 0) {
    errors.push('Reason is required and must be a non-empty string');
  }
  
  return errors;
};

const validatePenaltyWaiver = (data) => {
  const errors = [];
  
  if (!data.reason || typeof data.reason !== 'string' || data.reason.trim().length === 0) {
    errors.push('Reason is required and must be a non-empty string');
  }
  
  return errors;
};

const validateEMIReminder = (data) => {
  const errors = [];
  
  if (!data.reminderType || !['due_date', 'overdue', 'penalty_applied', 'grace_period'].includes(data.reminderType)) {
    errors.push('Reminder type must be one of: due_date, overdue, penalty_applied, grace_period');
  }
  
  if (!data.reminderMethod || !['email', 'sms', 'push_notification', 'whatsapp'].includes(data.reminderMethod)) {
    errors.push('Reminder method must be one of: email, sms, push_notification, whatsapp');
  }
  
  if (data.message && (typeof data.message !== 'string' || data.message.trim().length === 0)) {
    errors.push('Message must be a non-empty string');
  }
  
  return errors;
};

const validatePaymentScreenshot = (data) => {
  const errors = [];
  
  if (!data.screenshotType || !['payment_confirmation', 'bank_statement', 'upi_screenshot', 'receipt', 'other'].includes(data.screenshotType)) {
    errors.push('Screenshot type must be one of: payment_confirmation, bank_statement, upi_screenshot, receipt, other');
  }
  
  if (data.description && (typeof data.description !== 'string' || data.description.trim().length === 0)) {
    errors.push('Description must be a non-empty string');
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
  validateKycRejection,
  validatePaymentOrder,
  validateCashPayment,
  validatePaymentVerification,
  validatePenaltyApplication,
  validatePenaltyWaiver,
  validateEMIReminder,
  validatePaymentScreenshot
};

// Loan Request Validations
const validateLoanRequest = [
  body('loanAmount')
    .isNumeric()
    .withMessage('Loan amount must be a number')
    .isFloat({ min: 1000, max: 1000000 })
    .withMessage('Loan amount must be between ₹1,000 and ₹10,00,000'),
  
  body('loanPurpose')
    .isIn(['Personal', 'Business', 'Education', 'Medical', 'Home', 'Vehicle', 'Other'])
    .withMessage('Invalid loan purpose'),
  
  body('loanDescription')
    .isLength({ min: 10, max: 500 })
    .withMessage('Loan description must be between 10 and 500 characters'),
  
  body('tenureMonths')
    .isInt({ min: 3, max: 60 })
    .withMessage('Tenure must be between 3 and 60 months'),
  
  body('emiAmount')
    .isNumeric()
    .withMessage('EMI amount must be a number')
    .isFloat({ min: 100 })
    .withMessage('EMI amount must be at least ₹100'),
  
  body('interestRate')
    .isNumeric()
    .withMessage('Interest rate must be a number')
    .isFloat({ min: 0, max: 30 })
    .withMessage('Interest rate must be between 0% and 30%')
];

const validateLoanRequestUpdate = [
  body('loanAmount')
    .optional()
    .isNumeric()
    .withMessage('Loan amount must be a number')
    .isFloat({ min: 1000, max: 1000000 })
    .withMessage('Loan amount must be between ₹1,000 and ₹10,00,000'),
  
  body('loanPurpose')
    .optional()
    .isIn(['Personal', 'Business', 'Education', 'Medical', 'Home', 'Vehicle', 'Other'])
    .withMessage('Invalid loan purpose'),
  
  body('loanDescription')
    .optional()
    .isLength({ min: 10, max: 500 })
    .withMessage('Loan description must be between 10 and 500 characters'),
  
  body('tenureMonths')
    .optional()
    .isInt({ min: 3, max: 60 })
    .withMessage('Tenure must be between 3 and 60 months'),
  
  body('emiAmount')
    .optional()
    .isNumeric()
    .withMessage('EMI amount must be a number')
    .isFloat({ min: 100 })
    .withMessage('EMI amount must be at least ₹100'),
  
  body('interestRate')
    .optional()
    .isNumeric()
    .withMessage('Interest rate must be a number')
    .isFloat({ min: 0, max: 30 })
    .withMessage('Interest rate must be between 0% and 30%')
];

const validateLoanApproval = [
  body('approvalNotes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Approval notes cannot exceed 500 characters')
];

const validateLoanRejection = [
  body('rejectionReason')
    .isLength({ min: 10, max: 500 })
    .withMessage('Rejection reason must be between 10 and 500 characters')
];

const validateLoanDisbursement = [
  body('disbursedAmount')
    .isNumeric()
    .withMessage('Disbursed amount must be a number')
    .isFloat({ min: 1000 })
    .withMessage('Disbursed amount must be at least ₹1,000'),
  
  body('disbursementMethod')
    .isIn(['bank_transfer', 'cash', 'cheque'])
    .withMessage('Invalid disbursement method'),
  
  body('disbursementReference')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Disbursement reference cannot exceed 100 characters')
];

const validateRequestId = [
  param('requestId')
    .isLength({ min: 1 })
    .withMessage('Request ID is required')
    .matches(/^LOAN\d{7}$/)
    .withMessage('Invalid request ID format')
];

const validateDocumentUpload = [
  body('documentType')
    .isIn(['identity_proof', 'address_proof', 'income_proof', 'bank_statement', 'other'])
    .withMessage('Invalid document type'),
  
  body('documentName')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Document name cannot exceed 100 characters')
];

const validateMemberId = [
  param('memberId')
    .isMongoId()
    .withMessage('Invalid member ID format')
];

// Chat Validations
const validateChatCreation = [
  body('subject')
    .isLength({ min: 5, max: 200 })
    .withMessage('Subject must be between 5 and 200 characters'),
  
  body('chatType')
    .optional()
    .isIn(['member_to_admin', 'member_to_member', 'group', 'support'])
    .withMessage('Invalid chat type'),
  
  body('category')
    .optional()
    .isIn(['general', 'loan_inquiry', 'payment_issue', 'technical_support', 'complaint', 'suggestion'])
    .withMessage('Invalid category'),
  
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority level'),
  
  body('participants')
    .optional()
    .isArray()
    .withMessage('Participants must be an array')
];

const validateMessage = [
  body('content')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message content must be between 1 and 1000 characters'),
  
  body('messageType')
    .optional()
    .isIn(['text', 'image', 'file', 'system', 'payment_link', 'emi_reminder'])
    .withMessage('Invalid message type'),
  
  body('replyTo')
    .optional()
    .isMongoId()
    .withMessage('Invalid reply message ID')
];

const validateChatId = [
  param('chatId')
    .isLength({ min: 1 })
    .withMessage('Chat ID is required')
    .matches(/^CHAT\d{7}$/)
    .withMessage('Invalid chat ID format')
];

const validateMessageId = [
  param('messageId')
    .isLength({ min: 1 })
    .withMessage('Message ID is required')
    .matches(/^MSG\d{7}$/)
    .withMessage('Invalid message ID format')
];

// Thumbnail Validations
const validateThumbnailUpload = [
  body('category')
    .optional()
    .isIn(['gallery', 'banner', 'slider', 'event', 'announcement', 'society_photo', 'other'])
    .withMessage('Invalid category'),
  
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean'),
  
  body('isFeatured')
    .optional()
    .isBoolean()
    .withMessage('isFeatured must be a boolean'),
  
  body('tags')
    .optional()
    .isString()
    .withMessage('Tags must be a comma-separated string')
];

const validateThumbnailUpdate = [
  body('title')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  
  body('category')
    .optional()
    .isIn(['gallery', 'banner', 'slider', 'event', 'announcement', 'society_photo', 'other'])
    .withMessage('Invalid category'),
  
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'archived'])
    .withMessage('Invalid status'),
  
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean'),
  
  body('isFeatured')
    .optional()
    .isBoolean()
    .withMessage('isFeatured must be a boolean'),
  
  body('altText')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Alt text cannot exceed 200 characters'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('tags.*')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Each tag cannot exceed 50 characters')
];

const validateThumbnailId = [
  param('thumbnailId')
    .isLength({ min: 1 })
    .withMessage('Thumbnail ID is required')
    .matches(/^THUMB\d{7}$/)
    .withMessage('Invalid thumbnail ID format')
];

const validateDisplayOrder = [
  body('displayOrder')
    .isInt({ min: 0 })
    .withMessage('Display order must be a non-negative integer')
];

const validateBulkDelete = [
  body('thumbnailIds')
    .isArray({ min: 1 })
    .withMessage('Thumbnail IDs must be a non-empty array'),
  
  body('thumbnailIds.*')
    .matches(/^THUMB\d{7}$/)
    .withMessage('Invalid thumbnail ID format')
];

// CD Investment validation functions
const validateCDInvestmentRequest = (data) => {
  const errors = [];
  
  if (!data.investmentAmount || typeof data.investmentAmount !== 'number') {
    errors.push('Investment amount is required and must be a number');
  } else if (data.investmentAmount < 1000) {
    errors.push('Minimum investment amount is ₹1,000');
  } else if (data.investmentAmount > 1000000) {
    errors.push('Maximum investment amount is ₹10,00,000');
  }
  
  if (!data.tenureMonths || typeof data.tenureMonths !== 'number') {
    errors.push('Tenure is required and must be a number');
  } else if (![6, 12, 18, 24, 36, 48, 60].includes(data.tenureMonths)) {
    errors.push('Tenure must be one of: 6, 12, 18, 24, 36, 48, 60 months');
  }
  
  if (data.purpose && (typeof data.purpose !== 'string' || data.purpose.trim().length > 200)) {
    errors.push('Purpose cannot exceed 200 characters');
  }
  
  if (data.notes && (typeof data.notes !== 'string' || data.notes.trim().length > 500)) {
    errors.push('Notes cannot exceed 500 characters');
  }
  
  return errors;
};

const validateCDApproval = (data) => {
  const errors = [];
  
  if (data.adminNotes && (typeof data.adminNotes !== 'string' || data.adminNotes.trim().length > 500)) {
    errors.push('Admin notes cannot exceed 500 characters');
  }
  
  return errors;
};

const validateCDRejection = (data) => {
  const errors = [];
  
  if (!data.rejectionReason || typeof data.rejectionReason !== 'string' || data.rejectionReason.trim().length < 10) {
    errors.push('Rejection reason is required and must be at least 10 characters long');
  } else if (data.rejectionReason.trim().length > 500) {
    errors.push('Rejection reason cannot exceed 500 characters');
  }
  
  if (data.adminNotes && (typeof data.adminNotes !== 'string' || data.adminNotes.trim().length > 500)) {
    errors.push('Admin notes cannot exceed 500 characters');
  }
  
  return errors;
};

// Export loan validation functions
module.exports = {
  ...module.exports,
  validateLoanRequest,
  validateLoanRequestUpdate,
  validateLoanApproval,
  validateLoanRejection,
  validateLoanDisbursement,
  validateRequestId,
  validateDocumentUpload,
  validateMemberId,
  
  // Chat Validations
  validateChatCreation,
  validateMessage,
  validateChatId,
  validateMessageId,
  
  // Thumbnail Validations
  validateThumbnailUpload,
  validateThumbnailUpdate,
  validateThumbnailId,
  validateDisplayOrder,
  validateBulkDelete,
  
  // CD Investment Validations
  validateCDInvestmentRequest,
  validateCDApproval,
  validateCDRejection
};