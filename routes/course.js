const express = require('express');
const router = express.Router();
const {
  createCourse,
  createSimpleCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  getCourseStatistics,
  createSampleCourses
} = require('../controllers/courseController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const { uploadCourseFiles, handleUploadError } = require('../middleware/fileUpload');

// All routes require authentication and admin authorization
router.use(authenticate);
router.use(authorizeAdmin);

// Course CRUD operations
router.post('/create', 
  uploadCourseFiles,
  handleUploadError,
  createCourse
);

router.get('/', getAllCourses);
router.get('/statistics', getCourseStatistics);
router.post('/create-sample', createSampleCourses);
router.post('/create-simple', createSimpleCourse);
router.get('/:id', getCourseById);

router.put('/:id',
  uploadCourseFiles,
  handleUploadError,
  updateCourse
);

router.delete('/:id', deleteCourse);

module.exports = router;
