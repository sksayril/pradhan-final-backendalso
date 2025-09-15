const express = require('express');
const router = express.Router();
const {
  getAllStudents,
  getAllSocietyMembers,
  getAllAdmins,
  getUserStatistics,
  getStudentById,
  getSocietyMemberById,
  getAdminById,
  getStudentByStudentId,
  getSocietyMemberByMemberId,
  getAllApprovedKycStudents,
  getAllApprovedKycSocietyMembers,
  getAllEnrollments,
  getEnrollmentsByStudentId,
  getAllStudentsWithEnrollments
} = require('../controllers/userManagementController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

// All routes require authentication and admin authorization
router.use(authenticate);
router.use(authorizeAdmin);

// Get all students with pagination and filtering
router.get('/students', getAllStudents);

// Get all society members with pagination and filtering
router.get('/society-members', getAllSocietyMembers);

// Get all admins with pagination and filtering
router.get('/admins', getAllAdmins);

// Get user statistics
router.get('/statistics', getUserStatistics);

// Get all approved KYC users (must come before dynamic routes)
router.get('/students/approved-kyc', getAllApprovedKycStudents);
router.get('/society-members/approved-kyc', getAllApprovedKycSocietyMembers);

// Get all students with complete enrollment data (must come before dynamic routes)
router.get('/students/with-enrollments', getAllStudentsWithEnrollments);

// Get users by their custom IDs (studentId, memberId) (must come before dynamic routes)
router.get('/students/by-student-id/:studentId', getStudentByStudentId);
router.get('/society-members/by-member-id/:memberId', getSocietyMemberByMemberId);

// Get all enrollments
router.get('/enrollments', getAllEnrollments);
router.get('/enrollments/student/:studentId', getEnrollmentsByStudentId);

// Get specific users by ID (dynamic routes must come last)
router.get('/students/:id', getStudentById);
router.get('/society-members/:id', getSocietyMemberById);
router.get('/admins/:id', getAdminById);

module.exports = router;
