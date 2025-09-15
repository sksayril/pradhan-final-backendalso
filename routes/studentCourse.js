const express = require('express');
const router = express.Router();
const {
  getAllCoursesForStudents,
  getCourseDetailsForStudent,
  enrollInCourse,
  getMyCourses,
  getMyCourseDetails
} = require('../controllers/studentCourseController');
const { authenticate } = require('../middleware/auth'); // Assuming students are authenticated

// All student course routes require authentication
router.use(authenticate);

// Routes for enrolled students must come BEFORE dynamic routes
router.post('/enroll', enrollInCourse);
router.get('/my-courses', getMyCourses);
router.get('/my-courses/:enrollmentId', getMyCourseDetails);

// Public routes for browsing courses
router.get('/', getAllCoursesForStudents);
router.get('/:courseId', getCourseDetailsForStudent);


module.exports = router;
