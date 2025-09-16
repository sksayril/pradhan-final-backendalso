require("dotenv").config()
require("./utilities/database")
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');

// Import routes
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const adminRouter = require('./routes/admin');
const studentRouter = require('./routes/student');
const societyMemberRouter = require('./routes/societyMember');
const kycRouter = require('./routes/kyc');
const userManagementRouter = require('./routes/userManagement');
const courseRouter = require('./routes/course');
const batchRouter = require('./routes/batch');
const studentCourseRouter = require('./routes/studentCourse');
const feeManagementRouter = require('./routes/feeManagement');
const studentFeeRouter = require('./routes/studentFee');
const adminAttendanceRouter = require('./routes/adminAttendance');
const studentAttendanceRouter = require('./routes/studentAttendance');
const adminEnrollmentRouter = require('./routes/adminEnrollment');
const adminInvestmentRouter = require('./routes/adminInvestment');
const memberInvestmentRouter = require('./routes/memberInvestment');
const societyMemberInvestmentRouter = require('./routes/societyMemberInvestment');
const adminInvestmentApprovalRouter = require('./routes/adminInvestmentApproval');
const adminSocietyMemberInvestmentRouter = require('./routes/adminSocietyMemberInvestment');
const adminStudentDocumentRouter = require('./routes/adminStudentDocument');
const studentDocumentRouter = require('./routes/studentDocument');

// Import middleware
const { securityHeaders, corsOptions, requestLogger, errorHandler, notFoundHandler } = require('./middleware/security');
const { sanitizeInput } = require('./middleware/validation');

const app = express();

// Security middleware
app.use(securityHeaders);
app.use(cors());

// Logging middleware
app.use(requestLogger);
app.use(logger('dev'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));
app.use(cookieParser());

// Input sanitization
app.use(sanitizeInput);

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/', indexRouter);
app.use('/api/users', usersRouter);
app.use('/api/admin', adminRouter);
app.use('/api/student', studentRouter);
app.use('/api/society-member', societyMemberRouter);
app.use('/api/kyc', kycRouter);
app.use('/api/user-management', userManagementRouter);
app.use('/api/courses', courseRouter);
app.use('/api/batches', batchRouter);
app.use('/api/student/courses', studentCourseRouter);
app.use('/api/fee-management', feeManagementRouter);
app.use('/api/student/fees', studentFeeRouter);
app.use('/api/admin/attendance', adminAttendanceRouter);
app.use('/api/student/attendance', studentAttendanceRouter);
app.use('/api/admin/enrollments', adminEnrollmentRouter);
app.use('/api/admin/investment', adminInvestmentRouter);
app.use('/api/society-member/investment', memberInvestmentRouter);
app.use('/api/society-member/investment-applications', societyMemberInvestmentRouter);
app.use('/api/admin/investment-approval', adminInvestmentApprovalRouter);
app.use('/api/admin/society-member-investment', adminSocietyMemberInvestmentRouter);
app.use('/api/admin/student-documents', adminStudentDocumentRouter);
app.use('/api/student/documents', studentDocumentRouter);

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
