const Marksheet = require('../models/marksheet.model');
const Certificate = require('../models/certificate.model');
const Student = require('../models/student.model');
const Course = require('../models/course.model');
const Batch = require('../models/batch.model');

// ==================== STUDENT MARKSHEET ACCESS ====================

// Get all marksheets for logged-in student
const getMyMarksheets = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { page = 1, limit = 10, academicYear, semester, examinationType, result } = req.query;

    // Build filter
    const filter = { studentId };
    
    if (academicYear) filter.academicYear = academicYear;
    if (semester) filter.semester = semester;
    if (examinationType) filter.examinationType = examinationType;
    if (result) filter.result = result.toUpperCase();

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get marksheets with pagination
    const marksheets = await Marksheet.find(filter)
      .sort({ academicYear: -1, semester: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalMarksheets = await Marksheet.countDocuments(filter);

    // Get marksheet summaries
    const marksheetSummaries = marksheets.map(ms => ({
      ...ms.getMarksheetSummary(),
      course: ms.courseInfo,
      batch: ms.batchInfo
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
    console.error('Get my marksheets error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching marksheets'
    });
  }
};

// Get marksheet details by ID
const getMarksheetDetails = async (req, res) => {
  try {
    const { marksheetId } = req.params;
    const studentId = req.user._id;

    const marksheet = await Marksheet.findOne({ 
      _id: marksheetId, 
      studentId 
    });

    if (!marksheet) {
      return res.status(404).json({
        success: false,
        message: 'Marksheet not found or access denied'
      });
    }

    // Record download
    marksheet.addDownloadRecord(studentId, req.ip);
    await marksheet.save();

    res.json({
      success: true,
      message: 'Marksheet details retrieved successfully',
      data: {
        marksheet: {
          ...marksheet.getMarksheetSummary(),
          course: marksheet.courseInfo,
          batch: marksheet.batchInfo,
          subjects: marksheet.subjects,
          remarks: marksheet.remarks,
          verificationCode: marksheet.verificationCode
        }
      }
    });

  } catch (error) {
    console.error('Get marksheet details error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching marksheet details'
    });
  }
};

// Get marksheet by verification code
const getMarksheetByVerificationCode = async (req, res) => {
  try {
    const { verificationCode } = req.params;

    const marksheet = await Marksheet.findByVerificationCode(verificationCode);

    if (!marksheet) {
      return res.status(404).json({
        success: false,
        message: 'Marksheet not found with this verification code'
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
          subjects: marksheet.subjects,
          isVerified: marksheet.isVerified,
          verificationCode: marksheet.verificationCode
        }
      }
    });

  } catch (error) {
    console.error('Get marksheet by verification code error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching marksheet'
    });
  }
};

// ==================== STUDENT CERTIFICATE ACCESS ====================

// Get all certificates for logged-in student
const getMyCertificates = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { page = 1, limit = 10, certificateType, academicYear, status } = req.query;

    // Build filter
    const filter = { studentId };
    
    if (certificateType) filter.certificateType = certificateType;
    if (academicYear) filter.academicYear = academicYear;
    if (status) filter.status = status;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get certificates with pagination
    const certificates = await Certificate.find(filter)
      .populate('courseId', 'title category instructor')
      .populate('batchId', 'name startDate endDate')
      .populate('marksheetId', 'marksheetNumber academicYear semester examinationType percentage cgpa overallGrade result')
      .sort({ certificateIssueDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalCertificates = await Certificate.countDocuments(filter);

    // Get certificate summaries
    const certificateSummaries = certificates.map(cert => ({
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
      } : null
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
    console.error('Get my certificates error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching certificates'
    });
  }
};

// Get certificate details by ID
const getCertificateDetails = async (req, res) => {
  try {
    const { certificateId } = req.params;
    const studentId = req.user._id;

    const certificate = await Certificate.findOne({ 
      _id: certificateId, 
      studentId 
    })
      .populate('courseId', 'title category instructor duration')
      .populate('batchId', 'name startDate endDate maxStudents')
      .populate('marksheetId', 'marksheetNumber academicYear semester examinationType percentage cgpa overallGrade result');

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found or access denied'
      });
    }

    // Record download
    certificate.addDownloadRecord(studentId, req.ip);
    await certificate.save();

    res.json({
      success: true,
      message: 'Certificate details retrieved successfully',
      data: {
        certificate: {
          ...certificate.getCertificateSummary(),
          course: certificate.courseId,
          batch: certificate.batchId,
          marksheet: certificate.marksheetId ? {
            marksheetNumber: certificate.marksheetId.marksheetNumber,
            academicYear: certificate.marksheetId.academicYear,
            semester: certificate.marksheetId.semester,
            examinationType: certificate.marksheetId.examinationType,
            percentage: certificate.marksheetId.percentage,
            cgpa: certificate.marksheetId.cgpa,
            overallGrade: certificate.marksheetId.overallGrade,
            result: certificate.marksheetId.result
          } : null,
          description: certificate.description,
          achievements: certificate.achievements,
          certificateUrl: certificate.certificateUrl,
          verificationCode: certificate.verificationCode,
          deliveryStatus: certificate.deliveryStatus,
          trackingNumber: certificate.trackingNumber
        }
      }
    });

  } catch (error) {
    console.error('Get certificate details error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching certificate details'
    });
  }
};

// Get certificate by verification code
const getCertificateByVerificationCode = async (req, res) => {
  try {
    const { verificationCode } = req.params;

    const certificate = await Certificate.findByVerificationCode(verificationCode)
      .populate('studentId', 'firstName lastName studentId email department year')
      .populate('courseId', 'title category instructor')
      .populate('batchId', 'name startDate endDate');

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found with this verification code'
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
          description: certificate.description,
          achievements: certificate.achievements,
          isVerified: certificate.isVerified,
          verificationCode: certificate.verificationCode
        }
      }
    });

  } catch (error) {
    console.error('Get certificate by verification code error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching certificate'
    });
  }
};

// ==================== STUDENT DOCUMENT SUMMARY ====================

// Get student document summary
const getMyDocumentSummary = async (req, res) => {
  try {
    const studentId = req.user._id;

    // Get student information
    const student = await Student.findById(studentId)
      .select('firstName lastName studentId email department year');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Get marksheet statistics
    const marksheetStats = await Marksheet.aggregate([
      { $match: { studentId: studentId } },
      {
        $group: {
          _id: null,
          totalMarksheets: { $sum: 1 },
          verifiedMarksheets: { $sum: { $cond: ['$isVerified', 1, 0] } },
          averagePercentage: { $avg: '$percentage' },
          averageCGPA: { $avg: '$cgpa' },
          passCount: { $sum: { $cond: [{ $eq: ['$result', 'PASS'] }, 1, 0] } },
          failCount: { $sum: { $cond: [{ $eq: ['$result', 'FAIL'] }, 1, 0] } }
        }
      }
    ]);

    // Get certificate statistics
    const certificateStats = await Certificate.aggregate([
      { $match: { studentId: studentId } },
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

    // Get recent marksheets (last 5)
    const recentMarksheets = await Marksheet.find({ studentId })
      .populate('courseId', 'title category')
      .populate('batchId', 'name')
      .sort({ academicYear: -1, semester: -1 })
      .limit(5)
      .select('marksheetNumber academicYear semester examinationType percentage cgpa result status isVerified courseId batchId');

    // Get recent certificates (last 5)
    const recentCertificates = await Certificate.find({ studentId })
      .populate('courseId', 'title category')
      .populate('batchId', 'name')
      .sort({ certificateIssueDate: -1 })
      .limit(5)
      .select('certificateNumber certificateType certificateTitle academicYear grade status isVerified courseId batchId');

    res.json({
      success: true,
      message: 'Document summary retrieved successfully',
      data: {
        student: {
          firstName: student.firstName,
          lastName: student.lastName,
          studentId: student.studentId,
          email: student.email,
          department: student.department,
          year: student.year
        },
        statistics: {
          marksheets: marksheetStats[0] || {
            totalMarksheets: 0,
            verifiedMarksheets: 0,
            averagePercentage: 0,
            averageCGPA: 0,
            passCount: 0,
            failCount: 0
          },
          certificates: certificateStats[0] || {
            totalCertificates: 0,
            verifiedCertificates: 0,
            issuedCertificates: 0,
            deliveredCertificates: 0
          }
        },
        recent: {
          marksheets: recentMarksheets,
          certificates: recentCertificates
        }
      }
    });

  } catch (error) {
    console.error('Get document summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching document summary'
    });
  }
};

// ==================== PUBLIC VERIFICATION ====================

// Public marksheet verification (no authentication required)
const verifyMarksheetPublic = async (req, res) => {
  try {
    const { verificationCode } = req.params;

    const marksheet = await Marksheet.findByVerificationCode(verificationCode);

    if (!marksheet) {
      return res.status(404).json({
        success: false,
        message: 'Marksheet not found with this verification code'
      });
    }

    res.json({
      success: true,
      message: 'Marksheet verification successful',
      data: {
        verification: {
          isValid: true,
          isVerified: marksheet.isVerified,
          verificationCode: marksheet.verificationCode
        },
        marksheet: {
          marksheetNumber: marksheet.marksheetNumber,
          student: marksheet.studentInfo,
          course: marksheet.courseInfo,
          batch: marksheet.batchInfo,
          academicYear: marksheet.academicYear,
          semester: marksheet.semester,
          examinationType: marksheet.examinationType,
          totalMarks: marksheet.totalMarks,
          maxTotalMarks: marksheet.maxTotalMarks,
          percentage: marksheet.percentage,
          cgpa: marksheet.cgpa,
          overallGrade: marksheet.overallGrade,
          result: marksheet.result,
          examinationDate: marksheet.examinationDate,
          resultDate: marksheet.resultDate
        }
      }
    });

  } catch (error) {
    console.error('Public marksheet verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while verifying marksheet'
    });
  }
};

// Public certificate verification (no authentication required)
const verifyCertificatePublic = async (req, res) => {
  try {
    const { verificationCode } = req.params;

    const certificate = await Certificate.findByVerificationCode(verificationCode)
      .populate('studentId', 'firstName lastName studentId department year')
      .populate('courseId', 'title category')
      .populate('batchId', 'name');

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found with this verification code'
      });
    }

    res.json({
      success: true,
      message: 'Certificate verification successful',
      data: {
        verification: {
          isValid: true,
          isVerified: certificate.isVerified,
          verificationCode: certificate.verificationCode
        },
        certificate: {
          certificateNumber: certificate.certificateNumber,
          student: certificate.studentId,
          course: certificate.courseId,
          batch: certificate.batchId,
          certificateType: certificate.certificateType,
          certificateTitle: certificate.certificateTitle,
          academicYear: certificate.academicYear,
          grade: certificate.grade,
          percentage: certificate.percentage,
          cgpa: certificate.cgpa,
          courseStartDate: certificate.courseStartDate,
          courseEndDate: certificate.courseEndDate,
          certificateIssueDate: certificate.certificateIssueDate
        }
      }
    });

  } catch (error) {
    console.error('Public certificate verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while verifying certificate'
    });
  }
};

module.exports = {
  // Student marksheet access
  getMyMarksheets,
  getMarksheetDetails,
  getMarksheetByVerificationCode,
  
  // Student certificate access
  getMyCertificates,
  getCertificateDetails,
  getCertificateByVerificationCode,
  
  // Document summary
  getMyDocumentSummary,
  
  // Public verification
  verifyMarksheetPublic,
  verifyCertificatePublic
};
