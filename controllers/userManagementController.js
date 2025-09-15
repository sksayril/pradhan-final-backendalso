const Student = require('../models/student.model');
const SocietyMember = require('../models/societyMember.model');
const Admin = require('../models/admin.model');
const StudentKyc = require('../models/studentKyc.model');
const SocietyMemberKyc = require('../models/societyMemberKyc.model');
const Enrollment = require('../models/enrollment.model');

// Get all students with pagination and filtering
const getAllStudents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = {};
    
    // Search by name, email, or student ID
    if (req.query.search) {
      filter.$or = [
        { firstName: { $regex: req.query.search, $options: 'i' } },
        { lastName: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
        { studentId: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    // Filter by department
    if (req.query.department) {
      filter.department = { $regex: req.query.department, $options: 'i' };
    }
    
    // Filter by year
    if (req.query.year) {
      filter.year = req.query.year;
    }
    
    // Filter by KYC status
    if (req.query.kycStatus) {
      filter.kycStatus = req.query.kycStatus;
    }
    
    // Filter by active status
    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true';
    }
    
    // Filter by verification status
    if (req.query.isVerified !== undefined) {
      filter.isVerified = req.query.isVerified === 'true';
    }

    // Get students with pagination
    const students = await Student.find(filter)
      .select('-password -originalPassword') // Exclude passwords
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const totalStudents = await Student.countDocuments(filter);
    const totalPages = Math.ceil(totalStudents / limit);

    res.json({
      success: true,
      message: 'Students retrieved successfully',
      data: {
        students,
        pagination: {
          currentPage: page,
          totalPages,
          totalStudents,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error getting students:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve students',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get all society members with pagination and filtering
const getAllSocietyMembers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = {};
    
    // Search by name, email, or member ID
    if (req.query.search) {
      filter.$or = [
        { firstName: { $regex: req.query.search, $options: 'i' } },
        { lastName: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
        { memberId: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    // Filter by society name
    if (req.query.societyName) {
      filter.societyName = { $regex: req.query.societyName, $options: 'i' };
    }
    
    // Filter by position
    if (req.query.position) {
      filter.position = { $regex: req.query.position, $options: 'i' };
    }
    
    // Filter by KYC status
    if (req.query.kycStatus) {
      filter.kycStatus = req.query.kycStatus;
    }
    
    // Filter by active status
    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true';
    }
    
    // Filter by verification status
    if (req.query.isVerified !== undefined) {
      filter.isVerified = req.query.isVerified === 'true';
    }

    // Get society members with pagination
    const societyMembers = await SocietyMember.find(filter)
      .select('-password -originalPassword') // Exclude passwords
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const totalMembers = await SocietyMember.countDocuments(filter);
    const totalPages = Math.ceil(totalMembers / limit);

    res.json({
      success: true,
      message: 'Society members retrieved successfully',
      data: {
        societyMembers,
        pagination: {
          currentPage: page,
          totalPages,
          totalMembers,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error getting society members:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve society members',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get all admins with pagination and filtering
const getAllAdmins = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = {};
    
    // Search by name or email
    if (req.query.search) {
      filter.$or = [
        { firstName: { $regex: req.query.search, $options: 'i' } },
        { lastName: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    // Filter by role
    if (req.query.role) {
      filter.role = req.query.role;
    }
    
    // Filter by active status
    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true';
    }
    
    // Filter by verification status
    if (req.query.isVerified !== undefined) {
      filter.isVerified = req.query.isVerified === 'true';
    }

    // Get admins with pagination
    const admins = await Admin.find(filter)
      .select('-password -originalPassword') // Exclude passwords
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const totalAdmins = await Admin.countDocuments(filter);
    const totalPages = Math.ceil(totalAdmins / limit);

    res.json({
      success: true,
      message: 'Admins retrieved successfully',
      data: {
        admins,
        pagination: {
          currentPage: page,
          totalPages,
          totalAdmins,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error getting admins:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve admins',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get user statistics
const getUserStatistics = async (req, res) => {
  try {
    const [
      totalStudents,
      totalSocietyMembers,
      totalAdmins,
      activeStudents,
      activeSocietyMembers,
      activeAdmins,
      verifiedStudents,
      verifiedSocietyMembers,
      verifiedAdmins,
      studentsWithKyc,
      societyMembersWithKyc
    ] = await Promise.all([
      Student.countDocuments(),
      SocietyMember.countDocuments(),
      Admin.countDocuments(),
      Student.countDocuments({ isActive: true }),
      SocietyMember.countDocuments({ isActive: true }),
      Admin.countDocuments({ isActive: true }),
      Student.countDocuments({ isVerified: true }),
      SocietyMember.countDocuments({ isVerified: true }),
      Admin.countDocuments({ isVerified: true }),
      Student.countDocuments({ kycStatus: { $in: ['pending', 'approved'] } }),
      SocietyMember.countDocuments({ kycStatus: { $in: ['pending', 'approved'] } })
    ]);

    res.json({
      success: true,
      message: 'User statistics retrieved successfully',
      data: {
        totals: {
          students: totalStudents,
          societyMembers: totalSocietyMembers,
          admins: totalAdmins,
          total: totalStudents + totalSocietyMembers + totalAdmins
        },
        active: {
          students: activeStudents,
          societyMembers: activeSocietyMembers,
          admins: activeAdmins
        },
        verified: {
          students: verifiedStudents,
          societyMembers: verifiedSocietyMembers,
          admins: verifiedAdmins
        },
        kyc: {
          students: studentsWithKyc,
          societyMembers: societyMembersWithKyc
        }
      }
    });

  } catch (error) {
    console.error('Error getting user statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get specific student by ID with KYC information
const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID format'
      });
    }

    // Get student data (include originalPassword for admin access)
    const student = await Student.findById(id)
      .select('-password +originalPassword'); // Exclude hashed password but include originalPassword

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Get KYC information
    const kycInfo = await StudentKyc.findOne({ studentId: id })
      .populate('reviewedBy', 'firstName lastName email');

    // Combine student data with KYC information
    const studentData = {
      ...student.toObject(),
      kyc: kycInfo ? {
        status: kycInfo.status,
        submittedAt: kycInfo.submittedAt,
        reviewedAt: kycInfo.reviewedAt,
        reviewedBy: kycInfo.reviewedBy,
        rejectionReason: kycInfo.rejectionReason,
        remarks: kycInfo.remarks,
        aadharNumber: kycInfo.aadharNumber,
        aadharCardImage: kycInfo.aadharCardImage
      } : {
        status: 'not_submitted',
        submittedAt: null,
        reviewedAt: null,
        reviewedBy: null,
        rejectionReason: null,
        remarks: null,
        aadharNumber: null,
        aadharCardImage: null
      }
    };

    res.json({
      success: true,
      message: 'Student retrieved successfully',
      data: {
        student: studentData
      }
    });

  } catch (error) {
    console.error('Error getting student by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve student',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get specific society member by ID with KYC information
const getSocietyMemberById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid society member ID format'
      });
    }

    // Get society member data
    const societyMember = await SocietyMember.findById(id)
      .select('-password -originalPassword'); // Exclude passwords

    if (!societyMember) {
      return res.status(404).json({
        success: false,
        message: 'Society member not found'
      });
    }

    // Get KYC information
    const kycInfo = await SocietyMemberKyc.findOne({ memberId: id })
      .populate('reviewedBy', 'firstName lastName email');

    // Combine society member data with KYC information
    const memberData = {
      ...societyMember.toObject(),
      kyc: kycInfo ? {
        status: kycInfo.status,
        submittedAt: kycInfo.submittedAt,
        reviewedAt: kycInfo.reviewedAt,
        reviewedBy: kycInfo.reviewedBy,
        rejectionReason: kycInfo.rejectionReason,
        remarks: kycInfo.remarks,
        aadharNumber: kycInfo.aadharNumber,
        panNumber: kycInfo.panNumber,
        aadharCardImage: kycInfo.aadharCardImage,
        panCardImage: kycInfo.panCardImage
      } : {
        status: 'not_submitted',
        submittedAt: null,
        reviewedAt: null,
        reviewedBy: null,
        rejectionReason: null,
        remarks: null,
        aadharNumber: null,
        panNumber: null,
        aadharCardImage: null,
        panCardImage: null
      }
    };

    res.json({
      success: true,
      message: 'Society member retrieved successfully',
      data: {
        societyMember: memberData
      }
    });

  } catch (error) {
    console.error('Error getting society member by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve society member',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get specific admin by ID
const getAdminById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid admin ID format'
      });
    }

    // Get admin data
    const admin = await Admin.findById(id)
      .select('-password -originalPassword'); // Exclude passwords

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    res.json({
      success: true,
      message: 'Admin retrieved successfully',
      data: {
        admin
      }
    });

  } catch (error) {
    console.error('Error getting admin by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve admin',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get student by student ID (not MongoDB ObjectId)
const getStudentByStudentId = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: 'Student ID is required'
      });
    }

    // Get student data by studentId (include originalPassword for admin access)
    const student = await Student.findOne({ studentId: studentId.toUpperCase() })
      .select('-password +originalPassword'); // Exclude hashed password but include originalPassword

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Get KYC information
    const kycInfo = await StudentKyc.findOne({ studentId: student._id })
      .populate('reviewedBy', 'firstName lastName email');

    // Combine student data with KYC information
    const studentData = {
      ...student.toObject(),
      kyc: kycInfo ? {
        status: kycInfo.status,
        submittedAt: kycInfo.submittedAt,
        reviewedAt: kycInfo.reviewedAt,
        reviewedBy: kycInfo.reviewedBy,
        rejectionReason: kycInfo.rejectionReason,
        remarks: kycInfo.remarks,
        aadharNumber: kycInfo.aadharNumber,
        aadharCardImage: kycInfo.aadharCardImage
      } : {
        status: 'not_submitted',
        submittedAt: null,
        reviewedAt: null,
        reviewedBy: null,
        rejectionReason: null,
        remarks: null,
        aadharNumber: null,
        aadharCardImage: null
      }
    };

    res.json({
      success: true,
      message: 'Student retrieved successfully',
      data: {
        student: studentData
      }
    });

  } catch (error) {
    console.error('Error getting student by student ID:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve student',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get society member by member ID (not MongoDB ObjectId)
const getSocietyMemberByMemberId = async (req, res) => {
  try {
    const { memberId } = req.params;
    
    if (!memberId) {
      return res.status(400).json({
        success: false,
        message: 'Member ID is required'
      });
    }

    // Get society member data by memberId
    const societyMember = await SocietyMember.findOne({ memberId: memberId.toUpperCase() })
      .select('-password -originalPassword'); // Exclude passwords

    if (!societyMember) {
      return res.status(404).json({
        success: false,
        message: 'Society member not found'
      });
    }

    // Get KYC information
    const kycInfo = await SocietyMemberKyc.findOne({ memberId: societyMember._id })
      .populate('reviewedBy', 'firstName lastName email');

    // Combine society member data with KYC information
    const memberData = {
      ...societyMember.toObject(),
      kyc: kycInfo ? {
        status: kycInfo.status,
        submittedAt: kycInfo.submittedAt,
        reviewedAt: kycInfo.reviewedAt,
        reviewedBy: kycInfo.reviewedBy,
        rejectionReason: kycInfo.rejectionReason,
        remarks: kycInfo.remarks,
        aadharNumber: kycInfo.aadharNumber,
        panNumber: kycInfo.panNumber,
        aadharCardImage: kycInfo.aadharCardImage,
        panCardImage: kycInfo.panCardImage
      } : {
        status: 'not_submitted',
        submittedAt: null,
        reviewedAt: null,
        reviewedBy: null,
        rejectionReason: null,
        remarks: null,
        aadharNumber: null,
        panNumber: null,
        aadharCardImage: null,
        panCardImage: null
      }
    };

    res.json({
      success: true,
      message: 'Society member retrieved successfully',
      data: {
        societyMember: memberData
      }
    });

  } catch (error) {
    console.error('Error getting society member by member ID:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve society member',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get all approved KYC students
const getAllApprovedKycStudents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = {};
    
    // Search by name, email, or student ID
    if (req.query.search) {
      filter.$or = [
        { firstName: { $regex: req.query.search, $options: 'i' } },
        { lastName: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
        { studentId: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    // Filter by department
    if (req.query.department) {
      filter.department = { $regex: req.query.department, $options: 'i' };
    }
    
    // Filter by year
    if (req.query.year) {
      filter.year = req.query.year;
    }
    
    // Only get students with approved KYC
    filter.kycStatus = 'approved';

    // Get students with approved KYC and pagination
    const students = await Student.find(filter)
      .select('-password -originalPassword') // Exclude passwords
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get KYC information for each student
    const studentsWithKyc = await Promise.all(
      students.map(async (student) => {
        const kycInfo = await StudentKyc.findOne({ studentId: student._id })
          .populate('reviewedBy', 'firstName lastName email');
        
        return {
          ...student.toObject(),
          kyc: kycInfo ? {
            status: kycInfo.status,
            submittedAt: kycInfo.submittedAt,
            reviewedAt: kycInfo.reviewedAt,
            reviewedBy: kycInfo.reviewedBy,
            rejectionReason: kycInfo.rejectionReason,
            remarks: kycInfo.remarks,
            aadharNumber: kycInfo.aadharNumber,
            aadharCardImage: kycInfo.aadharCardImage
          } : null
        };
      })
    );

    // Get total count for pagination
    const totalStudents = await Student.countDocuments(filter);
    const totalPages = Math.ceil(totalStudents / limit);

    res.json({
      success: true,
      message: 'Approved KYC students retrieved successfully',
      data: {
        students: studentsWithKyc,
        pagination: {
          currentPage: page,
          totalPages,
          totalStudents,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error getting approved KYC students:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve approved KYC students',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get all approved KYC society members
const getAllApprovedKycSocietyMembers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = {};
    
    // Search by name, email, or member ID
    if (req.query.search) {
      filter.$or = [
        { firstName: { $regex: req.query.search, $options: 'i' } },
        { lastName: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
        { memberId: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    // Filter by society name
    if (req.query.societyName) {
      filter.societyName = { $regex: req.query.societyName, $options: 'i' };
    }
    
    // Filter by position
    if (req.query.position) {
      filter.position = { $regex: req.query.position, $options: 'i' };
    }
    
    // Only get society members with approved KYC
    filter.kycStatus = 'approved';

    // Get society members with approved KYC and pagination
    const societyMembers = await SocietyMember.find(filter)
      .select('-password -originalPassword') // Exclude passwords
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get KYC information for each society member
    const membersWithKyc = await Promise.all(
      societyMembers.map(async (member) => {
        const kycInfo = await SocietyMemberKyc.findOne({ memberId: member._id })
          .populate('reviewedBy', 'firstName lastName email');
        
        return {
          ...member.toObject(),
          kyc: kycInfo ? {
            status: kycInfo.status,
            submittedAt: kycInfo.submittedAt,
            reviewedAt: kycInfo.reviewedAt,
            reviewedBy: kycInfo.reviewedBy,
            rejectionReason: kycInfo.rejectionReason,
            remarks: kycInfo.remarks,
            aadharNumber: kycInfo.aadharNumber,
            panNumber: kycInfo.panNumber,
            aadharCardImage: kycInfo.aadharCardImage,
            panCardImage: kycInfo.panCardImage
          } : null
        };
      })
    );

    // Get total count for pagination
    const totalMembers = await SocietyMember.countDocuments(filter);
    const totalPages = Math.ceil(totalMembers / limit);

    res.json({
      success: true,
      message: 'Approved KYC society members retrieved successfully',
      data: {
        societyMembers: membersWithKyc,
        pagination: {
          currentPage: page,
          totalPages,
          totalMembers,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error getting approved KYC society members:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve approved KYC society members',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get all enrollments for admin
const getAllEnrollments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object - more filters can be added as needed
    const filter = {};
    
    // Build sort object
    const sortBy = req.query.sortBy || 'enrollmentDate';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    const sort = { [sortBy]: sortOrder };

    const enrollments = await Enrollment.find(filter)
      .populate({
        path: 'studentId',
        select: 'firstName lastName email studentId'
      })
      .populate({
        path: 'courseId',
        select: 'title category type'
      })
      .populate({
        path: 'batchId',
        select: 'name startDate endDate'
      })
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const totalEnrollments = await Enrollment.countDocuments(filter);
    const totalPages = Math.ceil(totalEnrollments / limit);

    res.json({
      success: true,
      message: 'Enrollments retrieved successfully',
      data: {
        enrollments,
        pagination: {
          currentPage: page,
          totalPages,
          totalEnrollments,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Error getting all enrollments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve enrollments'
    });
  }
};

// Get all enrollments for a specific student (Admin)
const getEnrollmentsByStudentId = async (req, res) => {
  try {
    const { studentId } = req.params;

    const enrollments = await Enrollment.find({ studentId })
      .populate({
        path: 'courseId',
        select: 'title category type'
      })
      .populate({
        path: 'batchId',
        select: 'name startDate endDate'
      })
      .sort({ enrollmentDate: -1 });

    if (!enrollments || enrollments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No enrollments found for this student.'
      });
    }

    res.json({
      success: true,
      message: `Enrollments retrieved successfully for student ${studentId}`,
      data: {
        enrollments
      }
    });
  } catch (error) {
    console.error('Error getting enrollments by student ID:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve enrollments'
    });
  }
};

// Get all students with their complete enrollment data (Admin)
const getAllStudentsWithEnrollments = async (req, res) => {
  try {
    // Get all students
    const students = await Student.find({})
      .select('firstName lastName email studentId phoneNumber dateOfBirth address kycStatus createdAt')
      .sort({ createdAt: -1 });

    if (!students || students.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No students found'
      });
    }

    // Get all enrollments for all students
    const allEnrollments = await Enrollment.find({})
      .populate({
        path: 'studentId',
        select: 'studentId firstName lastName email'
      })
      .populate({
        path: 'courseId',
        select: 'title category type price currency duration durationUnit instructor'
      })
      .populate({
        path: 'batchId',
        select: 'name startDate endDate maxStudents price currency timeSlots'
      })
      .sort({ enrollmentDate: -1 });

    // Group enrollments by student
    const enrollmentsByStudent = {};
    allEnrollments.forEach(enrollment => {
      const studentId = enrollment.studentId._id.toString();
      if (!enrollmentsByStudent[studentId]) {
        enrollmentsByStudent[studentId] = [];
      }
      enrollmentsByStudent[studentId].push({
        enrollmentId: enrollment._id,
        enrollmentDate: enrollment.enrollmentDate,
        status: enrollment.status,
        paymentStatus: enrollment.paymentStatus,
        progress: enrollment.progress,
        course: {
          id: enrollment.courseId._id,
          title: enrollment.courseId.title,
          category: enrollment.courseId.category,
          type: enrollment.courseId.type,
          price: enrollment.courseId.price,
          currency: enrollment.courseId.currency,
          duration: enrollment.courseId.duration,
          durationUnit: enrollment.courseId.durationUnit,
          instructor: enrollment.courseId.instructor
        },
        batch: {
          id: enrollment.batchId._id,
          name: enrollment.batchId.name,
          startDate: enrollment.batchId.startDate,
          endDate: enrollment.batchId.endDate,
          maxStudents: enrollment.batchId.maxStudents,
          price: enrollment.batchId.price,
          currency: enrollment.batchId.currency,
          timeSlots: enrollment.batchId.timeSlots
        }
      });
    });

    // Combine student data with their enrollments
    const studentsWithEnrollments = students.map(student => {
      const studentId = student._id.toString();
      const enrollments = enrollmentsByStudent[studentId] || [];
      
      // Calculate enrollment statistics
      const enrollmentStats = {
        totalEnrollments: enrollments.length,
        activeEnrollments: enrollments.filter(e => e.status === 'enrolled').length,
        completedEnrollments: enrollments.filter(e => e.status === 'completed').length,
        totalCourses: [...new Set(enrollments.map(e => e.course.id))].length,
        totalBatches: [...new Set(enrollments.map(e => e.batch.id))].length
      };

      return {
        studentId: student._id,
        studentDetails: {
          firstName: student.firstName,
          lastName: student.lastName,
          fullName: `${student.firstName} ${student.lastName}`,
          email: student.email,
          studentId: student.studentId,
          phoneNumber: student.phoneNumber,
          dateOfBirth: student.dateOfBirth,
          address: student.address,
          kycStatus: student.kycStatus,
          createdAt: student.createdAt
        },
        enrollmentStats,
        enrollments
      };
    });

    // Calculate overall statistics
    const overallStats = {
      totalStudents: students.length,
      totalEnrollments: allEnrollments.length,
      studentsWithEnrollments: studentsWithEnrollments.filter(s => s.enrollments.length > 0).length,
      studentsWithoutEnrollments: studentsWithEnrollments.filter(s => s.enrollments.length === 0).length,
      totalCourses: [...new Set(allEnrollments.map(e => e.courseId._id.toString()))].length,
      totalBatches: [...new Set(allEnrollments.map(e => e.batchId._id.toString()))].length
    };

    res.json({
      success: true,
      message: 'All students with enrollment data retrieved successfully',
      data: {
        overallStats,
        students: studentsWithEnrollments
      }
    });

  } catch (error) {
    console.error('Error getting all students with enrollments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve students with enrollment data'
    });
  }
};

module.exports = {
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
};
