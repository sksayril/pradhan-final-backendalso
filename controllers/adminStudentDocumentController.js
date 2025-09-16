const Marksheet = require('../models/marksheet.model');
const Certificate = require('../models/certificate.model');
const Student = require('../models/student.model');
const Course = require('../models/course.model');
const Batch = require('../models/batch.model');

// ==================== MARKSHEET MANAGEMENT ====================

// Create marksheet for student
const createMarksheet = async (req, res) => {
  try {
    const {
      studentId,
      courseId,
      batchId,
      academicYear,
      semester,
      examinationType,
      subjects,
      examinationDate,
      resultDate,
      remarks
    } = req.body;

    const adminId = req.user._id;

    // Validate required fields
    if (!studentId || !courseId || !batchId || !academicYear || !semester || !examinationType || !subjects || !examinationDate || !resultDate) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided'
      });
    }

    // Validate student exists and get student info
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Validate course exists and get course info
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Validate batch exists and get batch info
    const batch = await Batch.findById(batchId);
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }

    // Check if marksheet already exists for this student, course, batch, and semester
    const existingMarksheet = await Marksheet.findOne({
      studentId,
      courseId,
      batchId,
      academicYear,
      semester,
      examinationType
    });

    if (existingMarksheet) {
      return res.status(400).json({
        success: false,
        message: 'Marksheet already exists for this student, course, batch, and semester combination'
      });
    }

    // Calculate overall results from subjects
    let totalMarks = 0;
    let maxTotalMarks = 0;
    let totalGradePoints = 0;
    let totalCredits = 0;
    let hasFailed = false;

    subjects.forEach(subject => {
      totalMarks += subject.marksObtained;
      maxTotalMarks += subject.maxMarks;
      totalGradePoints += (subject.gradePoints * subject.credits);
      totalCredits += subject.credits;
      
      // Check if any subject is failed
      if (subject.grade === 'F' || subject.grade === 'NP') {
        hasFailed = true;
      }
    });

    // Calculate percentage
    const percentage = maxTotalMarks > 0 ? (totalMarks / maxTotalMarks) * 100 : 0;

    // Calculate CGPA
    const cgpa = totalCredits > 0 ? totalGradePoints / totalCredits : 0;

    // Determine overall grade based on percentage
    let overallGrade;
    if (percentage >= 90) overallGrade = 'A+';
    else if (percentage >= 80) overallGrade = 'A';
    else if (percentage >= 70) overallGrade = 'B+';
    else if (percentage >= 60) overallGrade = 'B';
    else if (percentage >= 50) overallGrade = 'C+';
    else if (percentage >= 40) overallGrade = 'C';
    else if (percentage >= 30) overallGrade = 'D';
    else overallGrade = 'F';

    // Determine result
    const result = hasFailed ? 'FAIL' : 'PASS';

    // Create marksheet with embedded student, course, and batch info
    const marksheet = new Marksheet({
      studentId,
      studentInfo: {
        studentId: student.studentId,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        department: student.department,
        year: student.year,
        phoneNumber: student.phoneNumber,
        address: student.address
      },
      courseId,
      courseInfo: {
        courseId: course.courseId || course._id.toString(),
        title: course.title,
        category: course.category,
        instructor: course.instructor,
        duration: course.duration
      },
      batchId,
      batchInfo: {
        batchId: batch.batchId || batch._id.toString(),
        name: batch.name,
        startDate: batch.startDate,
        endDate: batch.endDate,
        maxStudents: batch.maxStudents
      },
      academicYear,
      semester,
      examinationType,
      subjects,
      totalMarks,
      maxTotalMarks,
      percentage: Math.round(percentage * 100) / 100, // Round to 2 decimal places
      cgpa: Math.round(cgpa * 100) / 100, // Round to 2 decimal places
      overallGrade,
      result,
      examinationDate,
      resultDate,
      remarks,
      createdBy: adminId
    });

    await marksheet.save();

    // Populate only the createdBy field for response
    await marksheet.populate([
      { path: 'createdBy', select: 'firstName lastName email' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Marksheet created successfully',
      data: {
        marksheet: marksheet.getMarksheetSummary(),
        student: marksheet.studentInfo,
        course: marksheet.courseInfo,
        batch: marksheet.batchInfo,
        createdBy: marksheet.createdBy
      }
    });

  } catch (error) {
    console.error('Create marksheet error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while creating marksheet'
    });
  }
};

// Get all marksheets with filtering
const getAllMarksheets = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      studentId,
      courseId,
      batchId,
      academicYear,
      semester,
      examinationType,
      result,
      status,
      search
    } = req.query;

    // Build filter
    const filter = {};
    
    if (studentId) filter.studentId = studentId;
    if (courseId) filter.courseId = courseId;
    if (batchId) filter.batchId = batchId;
    if (academicYear) filter.academicYear = academicYear;
    if (semester) filter.semester = semester;
    if (examinationType) filter.examinationType = examinationType;
    if (result) filter.result = result.toUpperCase();
    if (status) filter.status = status;
    
    if (search) {
      const students = await Student.find({
        $or: [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { studentId: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');
      
      filter.studentId = { $in: students.map(s => s._id) };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get marksheets with pagination
    const marksheets = await Marksheet.find(filter)
      .populate('createdBy', 'firstName lastName email')
      .populate('verifiedBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalMarksheets = await Marksheet.countDocuments(filter);

    // Get marksheet summaries
    const marksheetSummaries = marksheets.map(ms => ({
      ...ms.getMarksheetSummary(),
      student: ms.studentInfo,
      course: ms.courseInfo,
      batch: ms.batchInfo,
      createdBy: ms.createdBy,
      verifiedBy: ms.verifiedBy,
      subjects: ms.subjects,
      remarks: ms.remarks,
      createdAt: ms.createdAt,
      updatedAt: ms.updatedAt
    }));

    res.json({
      success: true,
      message: 'Marksheets retrieved successfully',
      data: {
        marksheets: marksheetSummaries,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalMarksheets / parseInt(limit)),
          totalMarksheets,
          hasNextPage: skip + marksheets.length < totalMarksheets,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Get all marksheets error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching marksheets'
    });
  }
};

// Get marksheet by ID
const getMarksheetById = async (req, res) => {
  try {
    const { marksheetId } = req.params;

    const marksheet = await Marksheet.findById(marksheetId)
      .populate('createdBy', 'firstName lastName email')
      .populate('verifiedBy', 'firstName lastName email')
      .populate('lastModifiedBy', 'firstName lastName email');

    if (!marksheet) {
      return res.status(404).json({
        success: false,
        message: 'Marksheet not found'
      });
    }

    res.json({
      success: true,
      message: 'Marksheet retrieved successfully',
      data: {
        marksheet: {
          ...marksheet.getMarksheetSummary(),
          student: marksheet.studentInfo,
          course: marksheet.courseInfo,
          batch: marksheet.batchInfo,
          createdBy: marksheet.createdBy,
          verifiedBy: marksheet.verifiedBy,
          lastModifiedBy: marksheet.lastModifiedBy,
          subjects: marksheet.subjects,
          remarks: marksheet.remarks,
          printHistory: marksheet.printHistory,
          downloadHistory: marksheet.downloadHistory,
          createdAt: marksheet.createdAt,
          updatedAt: marksheet.updatedAt
        }
      }
    });

  } catch (error) {
    console.error('Get marksheet by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching marksheet'
    });
  }
};

// Update marksheet
const updateMarksheet = async (req, res) => {
  try {
    const { marksheetId } = req.params;
    const updateData = req.body;
    const adminId = req.user._id;

    // Remove fields that shouldn't be updated
    delete updateData.marksheetNumber;
    delete updateData.verificationCode;
    delete updateData.createdBy;

    const marksheet = await Marksheet.findByIdAndUpdate(
      marksheetId,
      { ...updateData, lastModifiedBy: adminId },
      { new: true, runValidators: true }
    )
      .populate('createdBy', 'firstName lastName email')
      .populate('lastModifiedBy', 'firstName lastName email');

    if (!marksheet) {
      return res.status(404).json({
        success: false,
        message: 'Marksheet not found'
      });
    }

    res.json({
      success: true,
      message: 'Marksheet updated successfully',
      data: {
        marksheet: {
          ...marksheet.getMarksheetSummary(),
          student: marksheet.studentInfo,
          course: marksheet.courseInfo,
          batch: marksheet.batchInfo,
          createdBy: marksheet.createdBy,
          lastModifiedBy: marksheet.lastModifiedBy
        }
      }
    });

  } catch (error) {
    console.error('Update marksheet error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while updating marksheet'
    });
  }
};

// Verify marksheet
const verifyMarksheet = async (req, res) => {
  try {
    const { marksheetId } = req.params;
    const adminId = req.user._id;

    const marksheet = await Marksheet.findById(marksheetId);

    if (!marksheet) {
      return res.status(404).json({
        success: false,
        message: 'Marksheet not found'
      });
    }

    if (marksheet.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Marksheet is already verified'
      });
    }

    // Verify marksheet
    marksheet.verifyMarksheet(adminId);
    await marksheet.save();

    await marksheet.populate([
      { path: 'verifiedBy', select: 'firstName lastName email' }
    ]);

    res.json({
      success: true,
      message: 'Marksheet verified successfully',
      data: {
        marksheet: {
          marksheetNumber: marksheet.marksheetNumber,
          student: marksheet.studentInfo,
          isVerified: marksheet.isVerified,
          verifiedBy: marksheet.verifiedBy,
          verifiedAt: marksheet.verifiedAt,
          status: marksheet.status,
          verificationCode: marksheet.verificationCode
        }
      }
    });

  } catch (error) {
    console.error('Verify marksheet error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while verifying marksheet'
    });
  }
};

// Get marksheets by student
const getMarksheetsByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { 
      page = 1, 
      limit = 10, 
      academicYear, 
      semester, 
      examinationType, 
      result, 
      status,
      includeDetails = false 
    } = req.query;

    // Validate student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Build filter
    const filter = { studentId };
    
    if (academicYear) filter.academicYear = academicYear;
    if (semester) filter.semester = semester;
    if (examinationType) filter.examinationType = examinationType;
    if (result) filter.result = result.toUpperCase();
    if (status) filter.status = status;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get marksheets with populated admin fields
    const marksheets = await Marksheet.find(filter)
      .populate('createdBy', 'firstName lastName email')
      .populate('verifiedBy', 'firstName lastName email')
      .populate('lastModifiedBy', 'firstName lastName email')
      .sort({ academicYear: -1, semester: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalMarksheets = await Marksheet.countDocuments(filter);

    // Get marksheet data based on includeDetails flag
    const marksheetData = marksheets.map(ms => {
      const baseData = {
        ...ms.getMarksheetSummary(),
        course: ms.courseInfo,
        batch: ms.batchInfo,
        createdBy: ms.createdBy,
        verifiedBy: ms.verifiedBy,
        lastModifiedBy: ms.lastModifiedBy,
        createdAt: ms.createdAt,
        updatedAt: ms.updatedAt
      };

      // Include detailed information if requested
      if (includeDetails === 'true') {
        baseData.subjects = ms.subjects;
        baseData.remarks = ms.remarks;
        baseData.verificationCode = ms.verificationCode;
        baseData.printHistory = ms.printHistory;
        baseData.downloadHistory = ms.downloadHistory;
        baseData.digitalSignature = ms.digitalSignature;
      }

      return baseData;
    });

    // Calculate student statistics
    const allMarksheets = await Marksheet.find({ studentId });
    const studentStats = {
      totalMarksheets: allMarksheets.length,
      verifiedMarksheets: allMarksheets.filter(ms => ms.isVerified).length,
      publishedMarksheets: allMarksheets.filter(ms => ms.status === 'published').length,
      averagePercentage: allMarksheets.length > 0 ? 
        Math.round((allMarksheets.reduce((sum, ms) => sum + ms.percentage, 0) / allMarksheets.length) * 100) / 100 : 0,
      averageCGPA: allMarksheets.length > 0 ? 
        Math.round((allMarksheets.reduce((sum, ms) => sum + ms.cgpa, 0) / allMarksheets.length) * 100) / 100 : 0,
      passCount: allMarksheets.filter(ms => ms.result === 'PASS').length,
      failCount: allMarksheets.filter(ms => ms.result === 'FAIL').length
    };

    res.json({
      success: true,
      message: 'Student marksheets retrieved successfully',
      data: {
        student: {
          _id: student._id,
          firstName: student.firstName,
          lastName: student.lastName,
          fullName: `${student.firstName} ${student.lastName}`,
          studentId: student.studentId,
          email: student.email,
          department: student.department,
          year: student.year,
          phoneNumber: student.phoneNumber,
          address: student.address
        },
        statistics: studentStats,
        marksheets: marksheetData,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalMarksheets / parseInt(limit)),
          totalMarksheets,
          hasNextPage: skip + marksheets.length < totalMarksheets,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Get marksheets by student error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching student marksheets'
    });
  }
};

// ==================== CERTIFICATE MANAGEMENT ====================

// Generate certificate based on marksheet number
const generateCertificateFromMarksheet = async (req, res) => {
  try {
    const { marksheetNumber } = req.params;
    const {
      certificateType = 'Completion',
      certificateTitle,
      description,
      achievements,
      deliveryMethod = 'Digital',
      deliveryAddress
    } = req.body;

    const adminId = req.user._id;

    // Find marksheet by marksheet number
    const marksheet = await Marksheet.findOne({ marksheetNumber: marksheetNumber.toUpperCase() })
      .populate('studentId')
      .populate('courseId')
      .populate('batchId');

    if (!marksheet) {
      return res.status(404).json({
        success: false,
        message: 'Marksheet not found with the provided marksheet number'
      });
    }

    // Check if student passed
    if (marksheet.result !== 'PASS') {
      return res.status(400).json({
        success: false,
        message: 'Certificate can only be generated for students who have passed'
      });
    }

    // Check if certificate already exists for this marksheet
    const existingCertificate = await Certificate.findOne({
      studentId: marksheet.studentId._id,
      courseId: marksheet.courseId._id,
      batchId: marksheet.batchId._id,
      certificateType
    });

    if (existingCertificate) {
      return res.status(400).json({
        success: false,
        message: 'Certificate already exists for this student, course, batch, and type combination'
      });
    }

    // Generate certificate title if not provided
    const finalCertificateTitle = certificateTitle || 
      `${certificateType} Certificate - ${marksheet.courseId.title}`;

    // Create certificate
    const certificate = new Certificate({
      studentId: marksheet.studentId._id,
      courseId: marksheet.courseId._id,
      batchId: marksheet.batchId._id,
      marksheetId: marksheet._id,
      certificateType,
      certificateTitle: finalCertificateTitle,
      academicYear: marksheet.academicYear,
      duration: marksheet.courseId.duration || 'N/A',
      grade: marksheet.overallGrade,
      percentage: marksheet.percentage,
      cgpa: marksheet.cgpa,
      courseStartDate: marksheet.batchId.startDate,
      courseEndDate: marksheet.batchId.endDate,
      certificateIssueDate: new Date(Math.max(new Date(), new Date(marksheet.batchId.endDate).getTime() + 24 * 60 * 60 * 1000)),
      description: description || `Successfully completed ${marksheet.courseId.title} with ${marksheet.overallGrade} grade`,
      achievements: achievements || [
        {
          title: 'Course Completion',
          description: `Completed ${marksheet.courseId.title} with ${marksheet.percentage}% marks`,
          date: new Date()
        }
      ],
      deliveryMethod,
      deliveryAddress,
      createdBy: adminId
    });

    await certificate.save();

    // Populate the response
    await certificate.populate([
      { path: 'studentId', select: 'firstName lastName studentId email department year' },
      { path: 'courseId', select: 'title category instructor duration' },
      { path: 'batchId', select: 'name startDate endDate' },
      { path: 'createdBy', select: 'firstName lastName email' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Certificate generated successfully from marksheet',
      data: {
        certificate: certificate.getCertificateSummary(),
        student: {
          _id: certificate.studentId._id,
          firstName: certificate.studentId.firstName,
          lastName: certificate.studentId.lastName,
          fullName: `${certificate.studentId.firstName} ${certificate.studentId.lastName}`,
          studentId: certificate.studentId.studentId,
          email: certificate.studentId.email,
          department: certificate.studentId.department,
          year: certificate.studentId.year
        },
        course: {
          _id: certificate.courseId._id,
          title: certificate.courseId.title,
          category: certificate.courseId.category,
          instructor: certificate.courseId.instructor,
          duration: certificate.courseId.duration
        },
        batch: {
          _id: certificate.batchId._id,
          name: certificate.batchId.name,
          startDate: certificate.batchId.startDate,
          endDate: certificate.batchId.endDate
        },
        marksheet: {
          marksheetNumber: marksheet.marksheetNumber,
          academicYear: marksheet.academicYear,
          semester: marksheet.semester,
          examinationType: marksheet.examinationType,
          percentage: marksheet.percentage,
          cgpa: marksheet.cgpa,
          overallGrade: marksheet.overallGrade,
          result: marksheet.result
        },
        createdBy: certificate.createdBy
      }
    });

  } catch (error) {
    console.error('Generate certificate from marksheet error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while generating certificate from marksheet'
    });
  }
};

// Create certificate for student
const createCertificate = async (req, res) => {
  try {
    const {
      studentId,
      courseId,
      batchId,
      certificateType,
      certificateTitle,
      academicYear,
      duration,
      grade,
      percentage,
      cgpa,
      courseStartDate,
      courseEndDate,
      certificateIssueDate,
      description,
      achievements,
      deliveryMethod,
      deliveryAddress
    } = req.body;

    const adminId = req.user._id;

    // Validate required fields
    if (!studentId || !courseId || !batchId || !certificateType || !certificateTitle || !academicYear || !duration || !courseStartDate || !courseEndDate || !certificateIssueDate) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided'
      });
    }

    // Validate student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
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

    // Validate batch exists
    const batch = await Batch.findById(batchId);
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }

    // Check if certificate already exists for this student, course, and batch
    const existingCertificate = await Certificate.findOne({
      studentId,
      courseId,
      batchId,
      certificateType
    });

    if (existingCertificate) {
      return res.status(400).json({
        success: false,
        message: 'Certificate already exists for this student, course, batch, and type combination'
      });
    }

    // Create certificate
    const certificate = new Certificate({
      studentId,
      courseId,
      batchId,
      certificateType,
      certificateTitle,
      academicYear,
      duration,
      grade,
      percentage,
      cgpa,
      courseStartDate,
      courseEndDate,
      certificateIssueDate,
      description,
      achievements,
      deliveryMethod,
      deliveryAddress,
      createdBy: adminId
    });

    await certificate.save();

    // Populate the response
    await certificate.populate([
      { path: 'studentId', select: 'firstName lastName studentId email department year' },
      { path: 'courseId', select: 'title category instructor' },
      { path: 'batchId', select: 'name startDate endDate' },
      { path: 'createdBy', select: 'firstName lastName email' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Certificate created successfully',
      data: {
        certificate: certificate.getCertificateSummary(),
        student: certificate.studentId,
        course: certificate.courseId,
        batch: certificate.batchId,
        createdBy: certificate.createdBy
      }
    });

  } catch (error) {
    console.error('Create certificate error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while creating certificate'
    });
  }
};

// Get all certificates with filtering
const getAllCertificates = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      studentId,
      courseId,
      batchId,
      certificateType,
      academicYear,
      status,
      deliveryStatus,
      search
    } = req.query;

    // Build filter
    const filter = {};
    
    if (studentId) filter.studentId = studentId;
    if (courseId) filter.courseId = courseId;
    if (batchId) filter.batchId = batchId;
    if (certificateType) filter.certificateType = certificateType;
    if (academicYear) filter.academicYear = academicYear;
    if (status) filter.status = status;
    if (deliveryStatus) filter.deliveryStatus = deliveryStatus;
    
    if (search) {
      const students = await Student.find({
        $or: [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { studentId: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');
      
      filter.studentId = { $in: students.map(s => s._id) };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get certificates with pagination
    const certificates = await Certificate.find(filter)
      .populate('studentId', 'firstName lastName studentId email department year')
      .populate('courseId', 'title category instructor')
      .populate('batchId', 'name startDate endDate')
      .populate('createdBy', 'firstName lastName email')
      .populate('verifiedBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalCertificates = await Certificate.countDocuments(filter);

    // Get certificate summaries
    const certificateSummaries = certificates.map(cert => ({
      ...cert.getCertificateSummary(),
      student: cert.studentId,
      course: cert.courseId,
      batch: cert.batchId,
      createdBy: cert.createdBy,
      verifiedBy: cert.verifiedBy,
      description: cert.description,
      achievements: cert.achievements,
      createdAt: cert.createdAt,
      updatedAt: cert.updatedAt
    }));

    res.json({
      success: true,
      message: 'Certificates retrieved successfully',
      data: {
        certificates: certificateSummaries,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCertificates / parseInt(limit)),
          totalCertificates,
          hasNextPage: skip + certificates.length < totalCertificates,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Get all certificates error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching certificates'
    });
  }
};

// Get certificate by ID
const getCertificateById = async (req, res) => {
  try {
    const { certificateId } = req.params;

    const certificate = await Certificate.findById(certificateId)
      .populate('studentId', 'firstName lastName studentId email department year phoneNumber address')
      .populate('courseId', 'title category instructor duration')
      .populate('batchId', 'name startDate endDate maxStudents')
      .populate('createdBy', 'firstName lastName email')
      .populate('verifiedBy', 'firstName lastName email')
      .populate('lastModifiedBy', 'firstName lastName email');

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    res.json({
      success: true,
      message: 'Certificate retrieved successfully',
      data: {
        certificate: {
          ...certificate.getCertificateSummary(),
          student: certificate.studentId,
          course: certificate.courseId,
          batch: certificate.batchId,
          createdBy: certificate.createdBy,
          verifiedBy: certificate.verifiedBy,
          lastModifiedBy: certificate.lastModifiedBy,
          description: certificate.description,
          achievements: certificate.achievements,
          deliveryAddress: certificate.deliveryAddress,
          trackingNumber: certificate.trackingNumber,
          printHistory: certificate.printHistory,
          downloadHistory: certificate.downloadHistory,
          createdAt: certificate.createdAt,
          updatedAt: certificate.updatedAt
        }
      }
    });

  } catch (error) {
    console.error('Get certificate by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching certificate'
    });
  }
};

// Update certificate
const updateCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;
    const updateData = req.body;
    const adminId = req.user._id;

    // Remove fields that shouldn't be updated
    delete updateData.certificateNumber;
    delete updateData.verificationCode;
    delete updateData.createdBy;

    const certificate = await Certificate.findByIdAndUpdate(
      certificateId,
      { ...updateData, lastModifiedBy: adminId },
      { new: true, runValidators: true }
    )
      .populate('studentId', 'firstName lastName studentId email department year')
      .populate('courseId', 'title category instructor')
      .populate('batchId', 'name startDate endDate')
      .populate('createdBy', 'firstName lastName email')
      .populate('lastModifiedBy', 'firstName lastName email');

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    res.json({
      success: true,
      message: 'Certificate updated successfully',
      data: {
        certificate: {
          ...certificate.getCertificateSummary(),
          student: certificate.studentId,
          course: certificate.courseId,
          batch: certificate.batchId,
          createdBy: certificate.createdBy,
          lastModifiedBy: certificate.lastModifiedBy
        }
      }
    });

  } catch (error) {
    console.error('Update certificate error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while updating certificate'
    });
  }
};

// Verify certificate
const verifyCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;
    const adminId = req.user._id;

    const certificate = await Certificate.findById(certificateId);

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    if (certificate.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Certificate is already verified'
      });
    }

    // Verify certificate
    certificate.verifyCertificate(adminId);
    await certificate.save();

    await certificate.populate([
      { path: 'studentId', select: 'firstName lastName studentId email' },
      { path: 'verifiedBy', select: 'firstName lastName email' }
    ]);

    res.json({
      success: true,
      message: 'Certificate verified successfully',
      data: {
        certificate: {
          certificateNumber: certificate.certificateNumber,
          student: certificate.studentId,
          isVerified: certificate.isVerified,
          verifiedBy: certificate.verifiedBy,
          verifiedAt: certificate.verifiedAt,
          status: certificate.status,
          verificationCode: certificate.verificationCode
        }
      }
    });

  } catch (error) {
    console.error('Verify certificate error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while verifying certificate'
    });
  }
};

// Issue certificate
const issueCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;
    const adminId = req.user._id;

    const certificate = await Certificate.findById(certificateId);

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    if (certificate.status === 'issued') {
      return res.status(400).json({
        success: false,
        message: 'Certificate is already issued'
      });
    }

    // Issue certificate
    certificate.issueCertificate(adminId);
    await certificate.save();

    await certificate.populate([
      { path: 'studentId', select: 'firstName lastName studentId email' },
      { path: 'lastModifiedBy', select: 'firstName lastName email' }
    ]);

    res.json({
      success: true,
      message: 'Certificate issued successfully',
      data: {
        certificate: {
          certificateNumber: certificate.certificateNumber,
          student: certificate.studentId,
          status: certificate.status,
          lastModifiedBy: certificate.lastModifiedBy,
          certificateIssueDate: certificate.certificateIssueDate
        }
      }
    });

  } catch (error) {
    console.error('Issue certificate error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while issuing certificate'
    });
  }
};

// Get certificates by student
const getCertificatesByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { 
      page = 1, 
      limit = 10, 
      certificateType, 
      academicYear, 
      status, 
      deliveryStatus,
      includeDetails = false 
    } = req.query;

    // Validate student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Build filter
    const filter = { studentId };
    
    if (certificateType) filter.certificateType = certificateType;
    if (academicYear) filter.academicYear = academicYear;
    if (status) filter.status = status;
    if (deliveryStatus) filter.deliveryStatus = deliveryStatus;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get certificates with populated admin fields and marksheet
    const certificates = await Certificate.find(filter)
      .populate('courseId', 'title category instructor duration')
      .populate('batchId', 'name startDate endDate maxStudents')
      .populate('marksheetId', 'marksheetNumber academicYear semester examinationType percentage cgpa overallGrade result')
      .populate('createdBy', 'firstName lastName email')
      .populate('verifiedBy', 'firstName lastName email')
      .populate('lastModifiedBy', 'firstName lastName email')
      .sort({ certificateIssueDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalCertificates = await Certificate.countDocuments(filter);

    // Get certificate data based on includeDetails flag
    const certificateData = certificates.map(cert => {
      const baseData = {
        ...cert.getCertificateSummary(),
        course: cert.courseId,
        batch: cert.batchId,
        marksheet: cert.marksheetId ? {
          marksheetNumber: cert.marksheetId.marksheetNumber,
          academicYear: cert.marksheetId.academicYear,
          semester: cert.marksheetId.semester,
          examinationType: cert.marksheetId.examinationType,
          percentage: cert.marksheetId.percentage,
          cgpa: cert.marksheetId.cgpa,
          overallGrade: cert.marksheetId.overallGrade,
          result: cert.marksheetId.result
        } : null,
        createdBy: cert.createdBy,
        verifiedBy: cert.verifiedBy,
        lastModifiedBy: cert.lastModifiedBy,
        createdAt: cert.createdAt,
        updatedAt: cert.updatedAt
      };

      // Include detailed information if requested
      if (includeDetails === 'true') {
        baseData.description = cert.description;
        baseData.achievements = cert.achievements;
        baseData.certificateUrl = cert.certificateUrl;
        baseData.verificationCode = cert.verificationCode;
        baseData.deliveryAddress = cert.deliveryAddress;
        baseData.trackingNumber = cert.trackingNumber;
        baseData.printHistory = cert.printHistory;
        baseData.downloadHistory = cert.downloadHistory;
        baseData.digitalSignature = cert.digitalSignature;
      }

      return baseData;
    });

    // Calculate student certificate statistics
    const allCertificates = await Certificate.find({ studentId });
    const studentStats = {
      totalCertificates: allCertificates.length,
      verifiedCertificates: allCertificates.filter(cert => cert.isVerified).length,
      issuedCertificates: allCertificates.filter(cert => cert.status === 'issued').length,
      deliveredCertificates: allCertificates.filter(cert => cert.deliveryStatus === 'Delivered').length,
      averageGrade: allCertificates.length > 0 ? 
        Math.round((allCertificates.reduce((sum, cert) => sum + (cert.grade || 0), 0) / allCertificates.length) * 100) / 100 : 0,
      averagePercentage: allCertificates.length > 0 ? 
        Math.round((allCertificates.reduce((sum, cert) => sum + (cert.percentage || 0), 0) / allCertificates.length) * 100) / 100 : 0
    };

    res.json({
      success: true,
      message: 'Student certificates retrieved successfully',
      data: {
        student: {
          _id: student._id,
          firstName: student.firstName,
          lastName: student.lastName,
          fullName: `${student.firstName} ${student.lastName}`,
          studentId: student.studentId,
          email: student.email,
          department: student.department,
          year: student.year,
          phoneNumber: student.phoneNumber,
          address: student.address
        },
        statistics: studentStats,
        certificates: certificateData,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCertificates / parseInt(limit)),
          totalCertificates,
          hasNextPage: skip + certificates.length < totalCertificates,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Get certificates by student error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching student certificates'
    });
  }
};

// ==================== STATISTICS AND REPORTS ====================

// Get document statistics
const getDocumentStatistics = async (req, res) => {
  try {
    const { period = 'month', academicYear } = req.query;

    // Build date filter based on period
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // Build filter
    const filter = {
      createdAt: { $gte: startDate }
    };
    
    if (academicYear) filter.academicYear = academicYear;

    // Get marksheet statistics
    const marksheetStats = await Marksheet.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalMarksheets: { $sum: 1 },
          verifiedMarksheets: { $sum: { $cond: ['$isVerified', 1, 0] } },
          publishedMarksheets: { $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] } },
          averagePercentage: { $avg: '$percentage' },
          averageCGPA: { $avg: '$cgpa' }
        }
      }
    ]);

    // Get certificate statistics
    const certificateStats = await Certificate.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalCertificates: { $sum: 1 },
          verifiedCertificates: { $sum: { $cond: ['$isVerified', 1, 0] } },
          issuedCertificates: { $sum: { $cond: [{ $eq: ['$status', 'issued'] }, 1, 0] } },
          deliveredCertificates: { $sum: { $cond: [{ $eq: ['$deliveryStatus', 'Delivered'] }, 1, 0] } }
        }
      }
    ]);

    // Get marksheet results breakdown
    const marksheetResults = await Marksheet.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$result',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get certificate types breakdown
    const certificateTypes = await Certificate.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$certificateType',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      message: 'Document statistics retrieved successfully',
      data: {
        period,
        startDate,
        endDate: now,
        marksheets: marksheetStats[0] || {
          totalMarksheets: 0,
          verifiedMarksheets: 0,
          publishedMarksheets: 0,
          averagePercentage: 0,
          averageCGPA: 0
        },
        certificates: certificateStats[0] || {
          totalCertificates: 0,
          verifiedCertificates: 0,
          issuedCertificates: 0,
          deliveredCertificates: 0
        },
        breakdown: {
          marksheetResults,
          certificateTypes
        }
      }
    });

  } catch (error) {
    console.error('Get document statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching document statistics'
    });
  }
};

// Get student certificate data by student ID (for admin use)
const getStudentCertificateData = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { 
      page = 1, 
      limit = 10, 
      certificateType, 
      academicYear, 
      status,
      includeDetails = false 
    } = req.query;

    // Validate student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Build filter
    const filter = { studentId };
    
    if (certificateType) filter.certificateType = certificateType;
    if (academicYear) filter.academicYear = academicYear;
    if (status) filter.status = status;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get certificates with all related data
    const certificates = await Certificate.find(filter)
      .populate('courseId', 'title category instructor duration')
      .populate('batchId', 'name startDate endDate maxStudents')
      .populate('marksheetId', 'marksheetNumber academicYear semester examinationType percentage cgpa overallGrade result')
      .populate('createdBy', 'firstName lastName email')
      .populate('verifiedBy', 'firstName lastName email')
      .sort({ certificateIssueDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalCertificates = await Certificate.countDocuments(filter);

    // Format certificate data with all required information
    const certificateData = certificates.map(cert => {
      const baseData = {
        // Certificate information
        certificateNumber: cert.certificateNumber,
        certificateType: cert.certificateType,
        certificateTitle: cert.certificateTitle,
        academicYear: cert.academicYear,
        grade: cert.grade,
        percentage: cert.percentage,
        cgpa: cert.cgpa,
        status: cert.status,
        isVerified: cert.isVerified,
        verificationCode: cert.verificationCode,
        certificateIssueDate: cert.certificateIssueDate,
        
        // Student information
        student: {
          _id: student._id,
          firstName: student.firstName,
          lastName: student.lastName,
          fullName: `${student.firstName} ${student.lastName}`,
          studentId: student.studentId,
          email: student.email,
          department: student.department,
          year: student.year
        },
        
        // Course information
        course: {
          _id: cert.courseId._id,
          title: cert.courseId.title,
          category: cert.courseId.category,
          instructor: cert.courseId.instructor,
          duration: cert.courseId.duration
        },
        
        // Batch information
        batch: {
          _id: cert.batchId._id,
          name: cert.batchId.name,
          startDate: cert.batchId.startDate,
          endDate: cert.batchId.endDate,
          maxStudents: cert.batchId.maxStudents
        },
        
        // Marksheet information
        marksheet: cert.marksheetId ? {
          marksheetNumber: cert.marksheetId.marksheetNumber,
          academicYear: cert.marksheetId.academicYear,
          semester: cert.marksheetId.semester,
          examinationType: cert.marksheetId.examinationType,
          percentage: cert.marksheetId.percentage,
          cgpa: cert.marksheetId.cgpa,
          overallGrade: cert.marksheetId.overallGrade,
          result: cert.marksheetId.result
        } : null,
        
        // Admin information
        createdBy: cert.createdBy,
        verifiedBy: cert.verifiedBy,
        createdAt: cert.createdAt,
        updatedAt: cert.updatedAt
      };

      // Include detailed information if requested
      if (includeDetails === 'true') {
        baseData.description = cert.description;
        baseData.achievements = cert.achievements;
        baseData.certificateUrl = cert.certificateUrl;
        baseData.deliveryAddress = cert.deliveryAddress;
        baseData.trackingNumber = cert.trackingNumber;
        baseData.deliveryStatus = cert.deliveryStatus;
        baseData.deliveryMethod = cert.deliveryMethod;
        baseData.printHistory = cert.printHistory;
        baseData.downloadHistory = cert.downloadHistory;
      }

      return baseData;
    });

    // Calculate student certificate statistics
    const allCertificates = await Certificate.find({ studentId });
    const studentStats = {
      totalCertificates: allCertificates.length,
      verifiedCertificates: allCertificates.filter(cert => cert.isVerified).length,
      issuedCertificates: allCertificates.filter(cert => cert.status === 'issued').length,
      deliveredCertificates: allCertificates.filter(cert => cert.deliveryStatus === 'Delivered').length,
      averageGrade: allCertificates.length > 0 ? 
        Math.round((allCertificates.reduce((sum, cert) => sum + (cert.percentage || 0), 0) / allCertificates.length) * 100) / 100 : 0,
      averagePercentage: allCertificates.length > 0 ? 
        Math.round((allCertificates.reduce((sum, cert) => sum + (cert.percentage || 0), 0) / allCertificates.length) * 100) / 100 : 0
    };

    res.json({
      success: true,
      message: 'Student certificate data retrieved successfully',
      data: {
        student: {
          _id: student._id,
          firstName: student.firstName,
          lastName: student.lastName,
          fullName: `${student.firstName} ${student.lastName}`,
          studentId: student.studentId,
          email: student.email,
          department: student.department,
          year: student.year
        },
        certificates: certificateData,
        statistics: studentStats,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCertificates / parseInt(limit)),
          totalCertificates,
          hasNextPage: skip + certificates.length < totalCertificates,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Get student certificate data error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching student certificate data'
    });
  }
};

module.exports = {
  // Marksheet management
  createMarksheet,
  getAllMarksheets,
  getMarksheetById,
  updateMarksheet,
  verifyMarksheet,
  getMarksheetsByStudent,
  
  // Certificate management
  generateCertificateFromMarksheet,
  createCertificate,
  getAllCertificates,
  getCertificateById,
  updateCertificate,
  verifyCertificate,
  issueCertificate,
  getCertificatesByStudent,
  getStudentCertificateData,
  
  // Statistics
  getDocumentStatistics
};
