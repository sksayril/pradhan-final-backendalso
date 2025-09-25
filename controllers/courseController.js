const Course = require('../models/course.model');
const Batch = require('../models/batch.model');
const { uploadFileToS3, deleteFileFromS3 } = require('../middleware/fileUpload');

// Create a new course
const createCourse = async (req, res) => {
  let thumbnailUploadResult;
  try {
    console.log('Course creation request received:', {
      body: req.body,
      files: req.files ? Object.keys(req.files) : 'no files',
      file: req.file ? 'thumbnail present' : 'no thumbnail'
    });

    const {
      title,
      description,
      type,
      category,
      instructor,
      price,
      currency,
      duration,
      durationUnit,
      venue,
      address,
      maxStudents,
      tags,
      prerequisites,
      learningObjectives,
      videoUrl
    } = req.body;

    // Validate required fields
    if (!title || !description || !type || !category || !instructor || !price || !duration) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, description, type, category, instructor, price, duration'
      });
    }

    // Validate instructor object
    if (!instructor.name || !instructor.email) {
      return res.status(400).json({
        success: false,
        message: 'Instructor name and email are required'
      });
    }

    // Validate required fields based on course type
    if (type === 'offline' && !venue) {
      return res.status(400).json({
        success: false,
        message: 'Venue is required for offline courses'
      });
    }

    if (type === 'offline' && !maxStudents) {
      return res.status(400).json({
        success: false,
        message: 'Maximum students is required for offline courses'
      });
    }

    // Check if thumbnail is uploaded
    if (!req.file && !req.files?.thumbnail) {
      return res.status(400).json({
        success: false,
        message: 'Course thumbnail is required'
      });
    }

    // Handle thumbnail upload
    let thumbnailUploadResult;
    if (req.file) {
      // Single file upload (old format)
      thumbnailUploadResult = await uploadFileToS3(req.file, 'course-thumbnails');
    } else if (req.files && req.files.thumbnail) {
      // Multiple files upload (new format)
      thumbnailUploadResult = await uploadFileToS3(req.files.thumbnail[0], 'course-thumbnails');
    }
    
    // For online courses, check if PDF is uploaded (coursePdf or syllabus)
    let coursePdfUrl = null;
    if (type === 'online' && req.files) {
      if (req.files.coursePdf) {
        const pdfUploadResult = await uploadFileToS3(req.files.coursePdf[0], 'course-materials');
        coursePdfUrl = pdfUploadResult.url;
      } else if (req.files.syllabus) {
        const pdfUploadResult = await uploadFileToS3(req.files.syllabus[0], 'course-materials');
        coursePdfUrl = pdfUploadResult.url;
      }
    }

    // Create course data
    const courseData = {
      title,
      description,
      type,
      category,
      instructor: {
        name: instructor.name,
        email: instructor.email,
        phone: instructor.phone,
        bio: instructor.bio
      },
      price: parseFloat(price),
      currency: currency || 'INR',
      duration: parseInt(duration),
      durationUnit: durationUnit || 'hours',
      thumbnail: thumbnailUploadResult.url,
      createdBy: req.user._id,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      prerequisites: prerequisites ? prerequisites.split(',').map(prereq => prereq.trim()) : [],
      learningObjectives: learningObjectives ? learningObjectives.split(',').map(obj => obj.trim()) : []
    };

    // Add type-specific fields
    if (type === 'online') {
      courseData.coursePdf = coursePdfUrl;
      courseData.videoUrl = videoUrl;
    } else {
      courseData.venue = venue;
      courseData.address = address;
      courseData.maxStudents = parseInt(maxStudents);
    }

    const course = await Course.create(courseData);

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: {
        course
      }
    });

  } catch (error) {
    console.error('Course creation error:', error);
    
    // Clean up uploaded files if course creation fails
    if (thumbnailUploadResult && thumbnailUploadResult.key) {
      try {
        await deleteFileFromS3(thumbnailUploadResult.key);
        console.log('Cleaned up thumbnail file');
      } catch (cleanupError) {
        console.error('Error cleaning up thumbnail:', cleanupError);
      }
    }
    
    if (coursePdfUrl && req.files && (req.files.coursePdf || req.files.syllabus)) {
      try {
        const pdfKey = coursePdfUrl.split('/').pop();
        await deleteFileFromS3(pdfKey);
        console.log('Cleaned up PDF file');
      } catch (cleanupError) {
        console.error('Error cleaning up PDF:', cleanupError);
      }
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create course',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Get all courses with pagination and filtering
const getAllCourses = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = {};
    
    // Search by title, description, or category
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
        { category: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    // Filter by type
    if (req.query.type) {
      filter.type = req.query.type;
    }
    
    // Filter by category
    if (req.query.category) {
      filter.category = { $regex: req.query.category, $options: 'i' };
    }
    
    // Filter by status
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    // Filter by price range
    if (req.query.minPrice) {
      filter.price = { ...filter.price, $gte: parseFloat(req.query.minPrice) };
    }
    if (req.query.maxPrice) {
      filter.price = { ...filter.price, $lte: parseFloat(req.query.maxPrice) };
    }
    
    // Filter by active status
    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true';
    }

    // Build sort object
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    const sort = { [sortBy]: sortOrder };

    // Get courses with pagination
    const courses = await Course.find(filter)
      .populate('createdBy', 'firstName lastName email')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const totalCourses = await Course.countDocuments(filter);
    const totalPages = Math.ceil(totalCourses / limit);

    // Debug logging
    console.log('Course query debug:', {
      filter,
      sort,
      skip,
      limit,
      totalCourses,
      coursesFound: courses.length
    });

    res.json({
      success: true,
      message: totalCourses === 0 ? 'No courses found' : 'Courses retrieved successfully',
      data: {
        courses,
        pagination: {
          currentPage: page,
          totalPages,
          totalCourses,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        },
        filters: {
          applied: Object.keys(filter).length > 0 ? filter : 'none',
          sortBy,
          sortOrder: req.query.sortOrder || 'desc'
        }
      }
    });

  } catch (error) {
    console.error('Error getting courses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve courses',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get course by ID
const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid course ID format'
      });
    }

    const course = await Course.findById(id)
      .populate('createdBy', 'firstName lastName email');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Get batches for this course
    const batches = await Batch.find({ courseId: id, isActive: true })
      .select('name description status startDate endDate maxStudents enrollmentCount availableSpots price')
      .sort({ startDate: 1 });

    res.json({
      success: true,
      message: 'Course retrieved successfully',
      data: {
        course,
        batches
      }
    });

  } catch (error) {
    console.error('Error getting course by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve course',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Update course
const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid course ID format'
      });
    }

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user is the creator or has admin privileges
    if (course.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only update courses you created'
      });
    }

    // Handle file uploads if provided
    if (req.file) {
      // Delete old thumbnail
      if (course.thumbnail) {
        try {
          const oldKey = course.thumbnail.split('/').pop();
          await deleteFileFromS3(oldKey);
        } catch (error) {
          console.error('Error deleting old thumbnail:', error);
        }
      }
      
      // Upload new thumbnail
      const thumbnailUploadResult = await uploadFileToS3(req.file, 'course-thumbnails');
      updateData.thumbnail = thumbnailUploadResult.url;
    }

    // Handle PDF upload for online courses
    if (req.files && req.files.coursePdf) {
      // Delete old PDF
      if (course.coursePdf) {
        try {
          const oldKey = course.coursePdf.split('/').pop();
          await deleteFileFromS3(oldKey);
        } catch (error) {
          console.error('Error deleting old PDF:', error);
        }
      }
      
      // Upload new PDF
      const pdfUploadResult = await uploadFileToS3(req.files.coursePdf[0], 'course-materials');
      updateData.coursePdf = pdfUploadResult.url;
    }

    // Convert arrays if they are strings
    if (updateData.tags && typeof updateData.tags === 'string') {
      updateData.tags = updateData.tags.split(',').map(tag => tag.trim());
    }
    if (updateData.prerequisites && typeof updateData.prerequisites === 'string') {
      updateData.prerequisites = updateData.prerequisites.split(',').map(prereq => prereq.trim());
    }
    if (updateData.learningObjectives && typeof updateData.learningObjectives === 'string') {
      updateData.learningObjectives = updateData.learningObjectives.split(',').map(obj => obj.trim());
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'firstName lastName email');

    res.json({
      success: true,
      message: 'Course updated successfully',
      data: {
        course: updatedCourse
      }
    });

  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update course',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Delete course
const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid course ID format'
      });
    }

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user is the creator or has admin privileges
    if (course.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete courses you created'
      });
    }

    // Check if course has active batches
    const activeBatches = await Batch.countDocuments({ courseId: id, isActive: true });
    if (activeBatches > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete course with active batches. Please deactivate or delete batches first.'
      });
    }

    // Delete associated files from S3
    try {
      if (course.thumbnail) {
        const thumbnailKey = course.thumbnail.split('/').pop();
        await deleteFileFromS3(thumbnailKey);
      }
      if (course.coursePdf) {
        const pdfKey = course.coursePdf.split('/').pop();
        await deleteFileFromS3(pdfKey);
      }
    } catch (error) {
      console.error('Error deleting files from S3:', error);
    }

    await Course.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Course deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete course',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get course statistics
const getCourseStatistics = async (req, res) => {
  try {
    const [
      totalCourses,
      onlineCourses,
      offlineCourses,
      publishedCourses,
      draftCourses,
      totalEnrollments,
      averageRating
    ] = await Promise.all([
      Course.countDocuments(),
      Course.countDocuments({ type: 'online' }),
      Course.countDocuments({ type: 'offline' }),
      Course.countDocuments({ status: 'published' }),
      Course.countDocuments({ status: 'draft' }),
      Course.aggregate([
        { $group: { _id: null, total: { $sum: '$enrollmentCount' } } }
      ]),
      Course.aggregate([
        { $group: { _id: null, avgRating: { $avg: '$rating.average' } } }
      ])
    ]);

    res.json({
      success: true,
      message: 'Course statistics retrieved successfully',
      data: {
        totalCourses,
        onlineCourses,
        offlineCourses,
        publishedCourses,
        draftCourses,
        totalEnrollments: totalEnrollments[0]?.total || 0,
        averageRating: averageRating[0]?.avgRating || 0
      }
    });

  } catch (error) {
    console.error('Error getting course statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve course statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Create sample courses for testing
const createSampleCourses = async (req, res) => {
  try {
    const sampleCourses = [
      {
        title: "Introduction to JavaScript",
        description: "Learn the fundamentals of JavaScript programming language",
        type: "online",
        category: "Programming",
        instructor: {
          name: "John Doe",
          email: "john@example.com",
          phone: "+1234567890",
          bio: "Senior JavaScript Developer with 10+ years experience"
        },
        price: 1999,
        currency: "INR",
        duration: 20,
        durationUnit: "hours",
        thumbnail: "https://via.placeholder.com/300x200/4CAF50/FFFFFF?text=JavaScript+Course",
        coursePdf: "https://via.placeholder.com/800x600/2196F3/FFFFFF?text=Course+Material",
        videoUrl: "https://youtube.com/watch?v=example1",
        tags: ["javascript", "programming", "web-development"],
        prerequisites: ["Basic HTML", "Basic CSS"],
        learningObjectives: ["Understand JavaScript syntax", "Build interactive web pages"],
        createdBy: req.user._id
      },
      {
        title: "Advanced React Development",
        description: "Master React.js and build modern web applications",
        type: "online",
        category: "Web Development",
        instructor: {
          name: "Jane Smith",
          email: "jane@example.com",
          phone: "+1234567891",
          bio: "React expert and full-stack developer"
        },
        price: 2999,
        currency: "INR",
        duration: 30,
        durationUnit: "hours",
        thumbnail: "https://via.placeholder.com/300x200/2196F3/FFFFFF?text=React+Course",
        coursePdf: "https://via.placeholder.com/800x600/FF9800/FFFFFF?text=React+Material",
        videoUrl: "https://youtube.com/watch?v=example2",
        tags: ["react", "javascript", "frontend"],
        prerequisites: ["JavaScript basics", "HTML/CSS"],
        learningObjectives: ["Build React applications", "State management", "Component lifecycle"],
        createdBy: req.user._id
      },
      {
        title: "Python for Data Science",
        description: "Learn Python programming for data analysis and machine learning",
        type: "offline",
        category: "Data Science",
        instructor: {
          name: "Mike Johnson",
          email: "mike@example.com",
          phone: "+1234567892",
          bio: "Data scientist with expertise in Python and ML"
        },
        price: 3999,
        currency: "INR",
        duration: 40,
        durationUnit: "hours",
        thumbnail: "https://via.placeholder.com/300x200/FF5722/FFFFFF?text=Python+Course",
        venue: "Tech Hub Learning Center",
        address: {
          street: "123 Tech Street",
          city: "Mumbai",
          state: "Maharashtra",
          zipCode: "400001",
          country: "India"
        },
        maxStudents: 25,
        tags: ["python", "data-science", "machine-learning"],
        prerequisites: ["Basic programming knowledge"],
        learningObjectives: ["Python programming", "Data analysis", "Machine learning basics"],
        createdBy: req.user._id
      }
    ];

    const createdCourses = await Course.insertMany(sampleCourses);

    res.status(201).json({
      success: true,
      message: 'Sample courses created successfully',
      data: {
        courses: createdCourses,
        count: createdCourses.length
      }
    });

  } catch (error) {
    console.error('Error creating sample courses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create sample courses',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Create a simple course without file uploads (for testing)
const createSimpleCourse = async (req, res) => {
  try {
    console.log('Simple course creation request received:', req.body);

    const {
      title,
      description,
      type,
      category,
      instructor,
      price,
      currency,
      duration,
      durationUnit,
      venue,
      address,
      maxStudents,
      tags,
      prerequisites,
      learningObjectives,
      videoUrl
    } = req.body;

    // Validate required fields
    if (!title || !description || !type || !category || !instructor || !price || !duration) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, description, type, category, instructor, price, duration'
      });
    }

    // Validate instructor object
    if (!instructor.name || !instructor.email) {
      return res.status(400).json({
        success: false,
        message: 'Instructor name and email are required'
      });
    }

    // Validate required fields based on course type
    if (type === 'offline' && !venue) {
      return res.status(400).json({
        success: false,
        message: 'Venue is required for offline courses'
      });
    }

    if (type === 'offline' && !maxStudents) {
      return res.status(400).json({
        success: false,
        message: 'Maximum students is required for offline courses'
      });
    }

    // Create course data with placeholder thumbnail
    const courseData = {
      title,
      description,
      type,
      category,
      instructor: {
        name: instructor.name,
        email: instructor.email,
        phone: instructor.phone,
        bio: instructor.bio
      },
      price: parseFloat(price),
      currency: currency || 'INR',
      duration: parseInt(duration),
      durationUnit: durationUnit || 'hours',
      thumbnail: 'https://via.placeholder.com/300x200/4CAF50/FFFFFF?text=Course+Thumbnail', // Placeholder
      createdBy: req.user._id,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      prerequisites: prerequisites ? prerequisites.split(',').map(prereq => prereq.trim()) : [],
      learningObjectives: learningObjectives ? learningObjectives.split(',').map(obj => obj.trim()) : []
    };

    // Add type-specific fields
    if (type === 'online') {
      courseData.videoUrl = videoUrl;
    } else {
      courseData.venue = venue;
      courseData.address = address;
      courseData.maxStudents = parseInt(maxStudents);
    }

    const course = await Course.create(courseData);

    res.status(201).json({
      success: true,
      message: 'Simple course created successfully',
      data: {
        course
      }
    });

  } catch (error) {
    console.error('Simple course creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create simple course',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

module.exports = {
  createCourse,
  createSimpleCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  getCourseStatistics,
  createSampleCourses
};
