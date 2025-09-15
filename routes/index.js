const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.json({
    success: true,
    message: 'Welcome to Basic API Building',
    version: '1.0.0',
    endpoints: {
      admin: {
        signup: 'POST /api/admin/signup',
        login: 'POST /api/admin/login',
        profile: 'GET /api/admin/profile',
        dashboard: 'GET /api/admin/dashboard',
        logout: 'POST /api/admin/logout'
      },
      student: {
        signup: 'POST /api/student/signup',
        login: 'POST /api/student/login',
        profile: 'GET /api/student/profile',
        dashboard: 'GET /api/student/dashboard',
        societies: 'GET /api/student/societies',
        logout: 'POST /api/student/logout'
      },
      societyMember: {
        signup: 'POST /api/society-member/signup',
        login: 'POST /api/society-member/login',
        profile: 'GET /api/society-member/profile',
        dashboard: 'GET /api/society-member/dashboard',
        events: 'GET /api/society-member/events',
        members: 'GET /api/society-member/members',
        logout: 'POST /api/society-member/logout'
      },
      kyc: {
        studentSubmit: 'POST /api/kyc/student/submit',
        studentStatus: 'GET /api/kyc/student/status',
        societyMemberSubmit: 'POST /api/kyc/society-member/submit',
        societyMemberStatus: 'GET /api/kyc/society-member/status',
        adminPending: 'GET /api/kyc/admin/pending',
        adminStudentApprove: 'POST /api/kyc/admin/student/approve',
        adminStudentReject: 'POST /api/kyc/admin/student/reject',
        adminSocietyMemberApprove: 'POST /api/kyc/admin/society-member/approve',
        adminSocietyMemberReject: 'POST /api/kyc/admin/society-member/reject'
      },
      userManagement: {
        getAllStudents: 'GET /api/user-management/students',
        getAllSocietyMembers: 'GET /api/user-management/society-members',
        getAllAdmins: 'GET /api/user-management/admins',
        getUserStatistics: 'GET /api/user-management/statistics',
        getStudentById: 'GET /api/user-management/students/:id',
        getSocietyMemberById: 'GET /api/user-management/society-members/:id',
        getAdminById: 'GET /api/user-management/admins/:id',
        getStudentByStudentId: 'GET /api/user-management/students/by-student-id/:studentId',
        getSocietyMemberByMemberId: 'GET /api/user-management/society-members/by-member-id/:memberId',
        getAllApprovedKycStudents: 'GET /api/user-management/students/approved-kyc',
        getAllApprovedKycSocietyMembers: 'GET /api/user-management/society-members/approved-kyc',
        getAllEnrollments: 'GET /api/user-management/enrollments',
        getEnrollmentsByStudentId: 'GET /api/user-management/enrollments/student/:studentId',
        getAllStudentsWithEnrollments: 'GET /api/user-management/students/with-enrollments'
      },
      feeManagement: {
        createFeeRequest: 'POST /api/fee-management/requests/create',
        getAllFeeRequests: 'GET /api/fee-management/requests',
        getStudentFeeRequests: 'GET /api/fee-management/requests/student/:studentId',
        recordFeePayment: 'POST /api/fee-management/payments/record',
        getFeePaymentHistory: 'GET /api/fee-management/payments/history',
        getFeeStatistics: 'GET /api/fee-management/statistics'
      },
      courses: {
        createCourse: 'POST /api/courses/create',
        createSimpleCourse: 'POST /api/courses/create-simple',
        getAllCourses: 'GET /api/courses',
        getCourseById: 'GET /api/courses/:id',
        updateCourse: 'PUT /api/courses/:id',
        deleteCourse: 'DELETE /api/courses/:id',
        getCourseStatistics: 'GET /api/courses/statistics',
        createSampleCourses: 'POST /api/courses/create-sample'
      },
      batches: {
        createBatch: 'POST /api/batches/create',
        getAllBatches: 'GET /api/batches',
        getBatchById: 'GET /api/batches/:id',
        updateBatch: 'PUT /api/batches/:id',
        deleteBatch: 'DELETE /api/batches/:id',
        getBatchesByCourse: 'GET /api/batches/course/:courseId',
        getBatchStatistics: 'GET /api/batches/statistics'
      },
      studentCourses: {
        getAllCourses: 'GET /api/student/courses',
        getCourseDetails: 'GET /api/student/courses/:courseId',
        enrollInCourse: 'POST /api/student/courses/enroll',
        getMyCourses: 'GET /api/student/courses/my-courses',
        getMyCourseDetails: 'GET /api/student/courses/my-courses/:enrollmentId'
      },
      studentFees: {
        getMyFeeRequests: 'GET /api/student/fees/requests',
        getMyPaymentHistory: 'GET /api/student/fees/payments/history',
        getMyPendingFees: 'GET /api/student/fees/pending',
        getMyFeeSummary: 'GET /api/student/fees/summary'
      },
      adminAttendance: {
        markAttendanceSimple: 'POST /api/admin/attendance/mark-simple',
        markAttendance: 'POST /api/admin/attendance/mark',
        markBatchAttendance: 'POST /api/admin/attendance/mark-batch',
        getAttendanceRecords: 'GET /api/admin/attendance/records',
        getAttendanceStatistics: 'GET /api/admin/attendance/statistics',
        updateAttendance: 'PUT /api/admin/attendance/:id',
        deleteAttendance: 'DELETE /api/admin/attendance/:id',
        getStudentEnrollments: 'GET /api/admin/attendance/student/:studentId/enrollments',
        checkEnrollmentStatus: 'GET /api/admin/attendance/debug/enrollment',
        getStudentAttendanceReport: 'GET /api/admin/attendance/student/:studentId/report'
      },
      studentAttendance: {
        getMyAttendance: 'GET /api/student/attendance',
        getMyAttendanceStats: 'GET /api/student/attendance/statistics',
        getMyAttendanceSummary: 'GET /api/student/attendance/summary',
        getMyCourseAttendance: 'GET /api/student/attendance/course/:courseId',
        getMyBatchAttendance: 'GET /api/student/attendance/batch/:batchId',
        getMyAttendanceReport: 'GET /api/student/attendance/report',
        getMyProfile: 'GET /api/student/attendance/profile'
      },
      adminEnrollments: {
        getAllEnrollments: 'GET /api/admin/enrollments',
        checkStudentStatus: 'GET /api/admin/enrollments/student/status',
        getPendingEnrollments: 'GET /api/admin/enrollments/pending',
        getEnrollmentStatistics: 'GET /api/admin/enrollments/statistics',
        getEnrollmentDetails: 'GET /api/admin/enrollments/:enrollmentId',
        approveEnrollment: 'PUT /api/admin/enrollments/:enrollmentId/approve',
        rejectEnrollment: 'PUT /api/admin/enrollments/:enrollmentId/reject',
        syncEnrollmentWithBatch: 'PUT /api/admin/enrollments/:enrollmentId/sync'
      },
      adminInvestment: {
        createPlan: 'POST /api/admin/investment/plans',
        getAllPlans: 'GET /api/admin/investment/plans',
        getPlanById: 'GET /api/admin/investment/plans/:planId',
        updatePlan: 'PUT /api/admin/investment/plans/:planId',
        deletePlan: 'DELETE /api/admin/investment/plans/:planId',
        togglePlanStatus: 'PATCH /api/admin/investment/plans/:planId/status',
        getPlanStatistics: 'GET /api/admin/investment/plans/:planId/statistics',
        calculateEMICost: 'POST /api/admin/investment/plans/:planId/calculate-emi',
        getSampleEMICosts: 'GET /api/admin/investment/plans/:planId/sample-emi-costs',
        createInvestment: 'POST /api/admin/investment/investments',
        getAllInvestments: 'GET /api/admin/investment/investments'
      },
      memberInvestment: {
        getAvailablePlans: 'GET /api/society-member/investment/plans',
        getPlanDetails: 'GET /api/society-member/investment/plans/:planId',
        calculateReturns: 'POST /api/society-member/investment/plans/:planId/calculate',
        getMyInvestments: 'GET /api/society-member/investment/investments',
        getInvestmentDetails: 'GET /api/society-member/investment/investments/:investmentId',
        getEMISchedule: 'GET /api/society-member/investment/investments/:investmentId/emi-schedule',
        getInvestmentSummary: 'GET /api/society-member/investment/summary'
      },
      societyMemberInvestmentApplications: {
        getAvailablePlans: 'GET /api/society-member/investment-applications/plans',
        getMyApplications: 'GET /api/society-member/investment-applications',
        getApplicationDetails: 'GET /api/society-member/investment-applications/:applicationId',
        applyForInvestment: 'POST /api/society-member/investment-applications/apply',
        cancelApplication: 'PATCH /api/society-member/investment-applications/:applicationId/cancel',
        makePayment: 'POST /api/society-member/investment-applications/:applicationId/payment',
        getEMISchedule: 'GET /api/society-member/investment-applications/:applicationId/emi-schedule',
        getPaymentHistory: 'GET /api/society-member/investment-applications/:applicationId/payment-history'
      },
      adminInvestmentApproval: {
        getAllApplications: 'GET /api/admin/investment-approval/applications',
        getApplicationDetails: 'GET /api/admin/investment-approval/applications/:applicationId',
        approveApplication: 'PATCH /api/admin/investment-approval/applications/:applicationId/approve',
        rejectApplication: 'PATCH /api/admin/investment-approval/applications/:applicationId/reject',
        recordPayment: 'POST /api/admin/investment-approval/applications/:applicationId/payment',
        addNote: 'POST /api/admin/investment-approval/applications/:applicationId/notes',
        getStatistics: 'GET /api/admin/investment-approval/statistics',
        getAllSocietyMemberInvestments: 'GET /api/admin/investment-approval/investments',
        getSocietyMemberInvestmentDetails: 'GET /api/admin/investment-approval/investments/:investmentId',
        getAllSocietyMembersWithPendingApplications: 'GET /api/admin/investment-approval/pending-members',
        getAllPendingInvestmentPlanRequests: 'GET /api/admin/investment-approval/pending-requests',
        getPendingApplicationsStatistics: 'GET /api/admin/investment-approval/pending-statistics',
        bulkApproveApplications: 'PATCH /api/admin/investment-approval/applications/bulk-approve',
        bulkRejectApplications: 'PATCH /api/admin/investment-approval/applications/bulk-reject'
      }
    },
    documentation: {
      authentication: 'All protected routes require Bearer token in Authorization header',
      rateLimiting: 'Authentication endpoints have rate limiting (5 attempts per 15 minutes)',
      validation: 'All input data is validated and sanitized',
      security: 'Passwords are hashed using bcrypt, JWT tokens for authentication'
    }
  });
});

// Health check endpoint
router.get('/health', function(req, res, next) {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

module.exports = router;
