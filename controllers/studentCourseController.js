const Course = require('../models/course.model');
const Batch = require('../models/batch.model');
const Enrollment = require('../models/enrollment.model');
const Student = require('../models/student.model');

// Get all published courses for students
const getAllCoursesForStudents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {
      status: 'published',
      isActive: true
    };

    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
        { category: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    if (req.query.type) {
      filter.type = req.query.type;
    }
    
    if (req.query.category) {
      filter.category = { $regex: req.query.category, $options: 'i' };
    }

    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    const sort = { [sortBy]: sortOrder };

    const courses = await Course.find(filter)
      .select('title description type category instructor price currency duration durationUnit thumbnail rating enrollmentCount')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const totalCourses = await Course.countDocuments(filter);
    const totalPages = Math.ceil(totalCourses / limit);

    res.json({
      success: true,
      message: 'Courses retrieved successfully',
      data: {
        courses,
        pagination: {
          currentPage: page,
          totalPages,
          totalCourses,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Error getting courses for students:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve courses'
    });
  }
};

// Get details of a single course and its available batches for students
const getCourseDetailsForStudent = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findOne({ _id: courseId, status: 'published', isActive: true })
      .select('-createdBy -__v');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found or not available'
      });
    }

    const batches = await Batch.find({
      courseId: courseId,
      status: 'scheduled',
      isActive: true,
      registrationEndDate: { $gte: new Date() }
    }).select('name description timeSlots maxStudents startDate endDate price currency enrolledStudents');

    res.json({
      success: true,
      message: 'Course details retrieved successfully',
      data: {
        course,
        availableBatches: batches
      }
    });
  } catch (error) {
    console.error('Error getting course details for student:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve course details'
    });
  }
};

// Enroll a student in a specific batch of a course
const enrollInCourse = async (req, res) => {
    const { courseId, batchId } = req.body;
    const studentId = req.user.id; 

    try {
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found.' });
        }

        const course = await Course.findById(courseId);
        if (!course || course.status !== 'published' || !course.isActive) {
            return res.status(404).json({ success: false, message: 'Course not found or is not available for enrollment.' });
        }

        const batch = await Batch.findById(batchId);
        if (!batch || batch.courseId.toString() !== courseId) {
            return res.status(404).json({ success: false, message: 'Batch not found for this course.' });
        }

        if (batch.status !== 'scheduled' || !batch.isActive) {
            return res.status(400).json({ success: false, message: 'This batch is not open for enrollment.' });
        }
        
        const now = new Date();
        if (now < batch.registrationStartDate || now > batch.registrationEndDate) {
            return res.status(400).json({ success: false, message: 'The registration period for this batch is not active.' });
        }
        
        if (batch.enrolledStudents.length >= batch.maxStudents) {
            return res.status(400).json({ success: false, message: 'This batch is full.' });
        }

        const existingEnrollment = await Enrollment.findOne({ studentId, courseId });
        if (existingEnrollment) {
            return res.status(400).json({ success: false, message: 'You are already enrolled in this course.' });
        }

        const enrollment = new Enrollment({
            studentId,
            courseId,
            batchId,
            paymentAmount: batch.price || course.price,
            currency: batch.currency || course.currency,
        });

        await enrollment.save();

        batch.enrolledStudents.push({ studentId });
        await batch.save();
        
        course.enrollmentCount += 1;
        await course.save();

        res.status(201).json({
            success: true,
            message: 'Successfully enrolled in the course.',
            data: enrollment
        });
    } catch (error) {
        console.error('Enrollment error:', error);
        res.status(500).json({ success: false, message: 'Failed to enroll in the course.' });
    }
};


// Get all courses a student is enrolled in
const getMyCourses = async (req, res) => {
  try {
    const studentId = req.user.id;

    const enrollments = await Enrollment.find({ studentId })
      .populate({
        path: 'courseId',
        select: 'title description thumbnail category type rating'
      })
      .populate({
        path: 'batchId',
        select: 'name startDate endDate'
      });

    res.json({
      success: true,
      message: 'Enrolled courses retrieved successfully',
      data: {
        enrolledCourses: enrollments
      }
    });
  } catch (error) {
    console.error('Error getting my courses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve enrolled courses'
    });
  }
};

// Get details of a single enrolled course
const getMyCourseDetails = async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const studentId = req.user.id;

    const enrollment = await Enrollment.findOne({ _id: enrollmentId, studentId })
      .populate({
        path: 'courseId',
        select: '-__v -status -isActive -createdBy'
      })
      .populate({
        path: 'batchId',
        select: '-__v -isActive -createdBy -enrolledStudents'
      });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found or you do not have permission to view it.'
      });
    }

    res.json({
      success: true,
      message: 'Enrolled course details retrieved successfully',
      data: {
        enrollment
      }
    });
  } catch (error) {
    console.error('Error getting my course details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve enrolled course details'
    });
  }
};

module.exports = {
  getAllCoursesForStudents,
  getCourseDetailsForStudent,
  enrollInCourse,
  getMyCourses,
  getMyCourseDetails
};
