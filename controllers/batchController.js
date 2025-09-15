const Batch = require('../models/batch.model');
const Course = require('../models/course.model');

// Create a new batch
const createBatch = async (req, res) => {
  try {
    console.log('Batch creation request received:', {
      body: req.body,
      timeSlots: req.body.timeSlots
    });

    const {
      name,
      description,
      courseId,
      timeSlots,
      maxStudents,
      price,
      currency,
      startDate,
      endDate,
      registrationStartDate,
      registrationEndDate,
      allowLateRegistration
    } = req.body;

    // Validate course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Validate required fields
    if (!name || !courseId || !maxStudents || !startDate || !endDate || !registrationStartDate || !registrationEndDate) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, courseId, maxStudents, startDate, endDate, registrationStartDate, registrationEndDate'
      });
    }

    // Validate time slots
    if (!timeSlots || timeSlots.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one time slot is required'
      });
    }

    // Validate time slots format
    for (const slot of timeSlots) {
      if (!slot.date || !slot.startTime || !slot.endTime) {
        return res.status(400).json({
          success: false,
          message: 'Each time slot must have date, startTime, and endTime'
        });
      }

      // Validate time format
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(slot.startTime) || !timeRegex.test(slot.endTime)) {
        return res.status(400).json({
          success: false,
          message: 'Time must be in HH:MM format'
        });
      }

      // Validate that end time is after start time
      const start = new Date(`2000-01-01T${slot.startTime}:00`);
      const end = new Date(`2000-01-01T${slot.endTime}:00`);
      if (end <= start) {
        return res.status(400).json({
          success: false,
          message: 'End time must be after start time for each time slot'
        });
      }
    }

    // Create batch data with calculated durations
    const processedTimeSlots = timeSlots.map(slot => {
      // Calculate duration in minutes
      const start = new Date(`2000-01-01T${slot.startTime}:00`);
      const end = new Date(`2000-01-01T${slot.endTime}:00`);
      const duration = Math.round((end - start) / (1000 * 60)); // duration in minutes
      
      console.log('Processing time slot:', {
        date: slot.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        calculatedDuration: duration
      });
      
      return {
        date: new Date(slot.date),
        startTime: slot.startTime,
        endTime: slot.endTime,
        duration: duration,
        isActive: true
      };
    });

    const batchData = {
      name,
      description,
      courseId,
      timeSlots: processedTimeSlots,
      maxStudents: parseInt(maxStudents),
      price: price ? parseFloat(price) : course.price,
      currency: currency || course.currency,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      registrationStartDate: new Date(registrationStartDate),
      registrationEndDate: new Date(registrationEndDate),
      allowLateRegistration: allowLateRegistration === 'true',
      createdBy: req.user._id
    };

    const batch = await Batch.create(batchData);

    // Populate course information
    await batch.populate('courseId', 'title type category');

    res.status(201).json({
      success: true,
      message: 'Batch created successfully',
      data: {
        batch
      }
    });

  } catch (error) {
    console.error('Batch creation error:', error);
    
    // Handle validation errors specifically
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message,
        value: err.value
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Batch validation failed',
        errors: validationErrors,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
    
    // Handle custom validation errors from pre-save middleware
    if (error.message && error.message.includes('Registration end date')) {
      return res.status(400).json({
        success: false,
        message: 'Date validation failed',
        error: error.message,
        suggestion: 'Please ensure registration end date is before or on batch end date, or enable allowLateRegistration'
      });
    }
    
    if (error.message && error.message.includes('End date must be after start date')) {
      return res.status(400).json({
        success: false,
        message: 'Date validation failed',
        error: error.message,
        suggestion: 'Please ensure batch end date is after batch start date'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create batch',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Get all batches with pagination and filtering
const getAllBatches = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = {};
    
    // Search by batch name or course title
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    // Filter by course ID
    if (req.query.courseId) {
      filter.courseId = req.query.courseId;
    }
    
    // Filter by status
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    // Filter by date range
    if (req.query.startDate) {
      filter.startDate = { $gte: new Date(req.query.startDate) };
    }
    if (req.query.endDate) {
      filter.endDate = { $lte: new Date(req.query.endDate) };
    }
    
    // Filter by active status
    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true';
    }

    // Get batches with pagination
    const batches = await Batch.find(filter)
      .populate('courseId', 'title type category price')
      .populate('createdBy', 'firstName lastName email')
      .sort({ startDate: 1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const totalBatches = await Batch.countDocuments(filter);
    const totalPages = Math.ceil(totalBatches / limit);

    res.json({
      success: true,
      message: 'Batches retrieved successfully',
      data: {
        batches,
        pagination: {
          currentPage: page,
          totalPages,
          totalBatches,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error getting batches:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve batches',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get batch by ID
const getBatchById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid batch ID format'
      });
    }

    const batch = await Batch.findById(id)
      .populate('courseId', 'title type category price description')
      .populate('createdBy', 'firstName lastName email')
      .populate('enrolledStudents.studentId', 'firstName lastName email studentId');

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }

    res.json({
      success: true,
      message: 'Batch retrieved successfully',
      data: {
        batch
      }
    });

  } catch (error) {
    console.error('Error getting batch by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve batch',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Update batch
const updateBatch = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid batch ID format'
      });
    }

    const batch = await Batch.findById(id);
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }

    // Check if user is the creator or has admin privileges
    if (batch.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only update batches you created'
      });
    }

    // Validate time slots if provided
    if (updateData.timeSlots) {
      for (const slot of updateData.timeSlots) {
        if (!slot.date || !slot.startTime || !slot.endTime) {
          return res.status(400).json({
            success: false,
            message: 'Each time slot must have date, startTime, and endTime'
          });
        }

        // Validate time format
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(slot.startTime) || !timeRegex.test(slot.endTime)) {
          return res.status(400).json({
            success: false,
            message: 'Time must be in HH:MM format'
          });
        }
      }
    }

    // Convert date strings to Date objects
    if (updateData.startDate) updateData.startDate = new Date(updateData.startDate);
    if (updateData.endDate) updateData.endDate = new Date(updateData.endDate);
    if (updateData.registrationStartDate) updateData.registrationStartDate = new Date(updateData.registrationStartDate);
    if (updateData.registrationEndDate) updateData.registrationEndDate = new Date(updateData.registrationEndDate);

    const updatedBatch = await Batch.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('courseId', 'title type category')
    .populate('createdBy', 'firstName lastName email');

    res.json({
      success: true,
      message: 'Batch updated successfully',
      data: {
        batch: updatedBatch
      }
    });

  } catch (error) {
    console.error('Error updating batch:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update batch',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Delete batch
const deleteBatch = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid batch ID format'
      });
    }

    const batch = await Batch.findById(id);
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }

    // Check if user is the creator or has admin privileges
    if (batch.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete batches you created'
      });
    }

    // Check if batch has enrolled students
    if (batch.enrolledStudents.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete batch with enrolled students. Please transfer or remove students first.'
      });
    }

    await Batch.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Batch deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting batch:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete batch',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get batches by course ID
const getBatchesByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    // Validate ObjectId format
    if (!courseId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid course ID format'
      });
    }

    // Validate course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const batches = await Batch.find({ courseId, isActive: true })
      .select('name description status startDate endDate maxStudents enrollmentCount availableSpots price timeSlots')
      .sort({ startDate: 1 });

    res.json({
      success: true,
      message: 'Batches retrieved successfully',
      data: {
        course: {
          _id: course._id,
          title: course.title,
          type: course.type
        },
        batches
      }
    });

  } catch (error) {
    console.error('Error getting batches by course:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve batches',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get batch statistics
const getBatchStatistics = async (req, res) => {
  try {
    const [
      totalBatches,
      scheduledBatches,
      ongoingBatches,
      completedBatches,
      totalEnrollments,
      averageEnrollment
    ] = await Promise.all([
      Batch.countDocuments(),
      Batch.countDocuments({ status: 'scheduled' }),
      Batch.countDocuments({ status: 'ongoing' }),
      Batch.countDocuments({ status: 'completed' }),
      Batch.aggregate([
        { $group: { _id: null, total: { $sum: { $size: '$enrolledStudents' } } } }
      ]),
      Batch.aggregate([
        { $group: { _id: null, avgEnrollment: { $avg: { $size: '$enrolledStudents' } } } }
      ])
    ]);

    res.json({
      success: true,
      message: 'Batch statistics retrieved successfully',
      data: {
        totalBatches,
        scheduledBatches,
        ongoingBatches,
        completedBatches,
        totalEnrollments: totalEnrollments[0]?.total || 0,
        averageEnrollment: averageEnrollment[0]?.avgEnrollment || 0
      }
    });

  } catch (error) {
    console.error('Error getting batch statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve batch statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  createBatch,
  getAllBatches,
  getBatchById,
  updateBatch,
  deleteBatch,
  getBatchesByCourse,
  getBatchStatistics
};
