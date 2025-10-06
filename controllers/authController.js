const Admin = require('../models/admin.model');
const Student = require('../models/student.model');
const SocietyMember = require('../models/societyMember.model');
const { generateToken } = require('../middleware/auth');
const { generateMemberId } = require('../utilities/memberIdGenerator');
const { uploadStudentProfilePictureToS3, uploadProfilePictureToS3 } = require('../middleware/fileUpload');

// Admin Authentication
const adminSignup = async (req, res) => {
  try {
    const { email, password, firstName, lastName, role, permissions } = req.body;
    
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Admin with this email already exists'
      });
    }
    
    // Create new admin
    const admin = await Admin.create({
      email,
      password,
      originalPassword: password, // Store original password as requested
      firstName,
      lastName,
      role,
      permissions
    });
    
    // Generate token
    const token = generateToken({
      id: admin._id,
      email: admin.email,
      userType: 'admin',
      role: admin.role
    });
    
    // Set cookie
    res.cookie('token', token, {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    
    res.status(201).json({
      success: true,
      message: 'Admin registered successfully',
      data: {
        admin: {
          id: admin._id,
          email: admin.email,
          firstName: admin.firstName,
          lastName: admin.lastName,
          role: admin.role,
          permissions: admin.permissions,
          isActive: admin.isActive
        },
        token
      }
    });
    
  } catch (error) {
    console.error('Admin signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during admin registration'
    });
  }
};

const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find admin with password
    const admin = await Admin.findOne({ email }).select('+password');
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    // Check if admin is active
    if (!admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact system administrator.'
      });
    }
    
    // Compare password
    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    // Update last login
    admin.lastLogin = new Date();
    await admin.save({ validateBeforeSave: false });
    
    // Generate token
    const token = generateToken({
      id: admin._id,
      email: admin.email,
      userType: 'admin',
      role: admin.role
    });
    
    // Set cookie
    res.cookie('token', token, {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    
    res.json({
      success: true,
      message: 'Admin login successful',
      data: {
        admin: {
          id: admin._id,
          email: admin.email,
          firstName: admin.firstName,
          lastName: admin.lastName,
          role: admin.role,
          permissions: admin.permissions,
          lastLogin: admin.lastLogin
        },
        token
      }
    });
    
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during admin login'
    });
  }
};

// Student Authentication
const studentSignup = async (req, res) => {
  try {
    const { email, password, firstName, lastName, department, year, phoneNumber, dateOfBirth, address, interests } = req.body;
    
    // Check if student already exists
    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: 'Student with this email already exists'
      });
    }
    
    let profilePictureUrl = null;
    
    // Handle profile picture upload if provided
    if (req.file) {
      try {
        const uploadResult = await uploadStudentProfilePictureToS3(req.file);
        profilePictureUrl = uploadResult.url;
        console.log('Profile picture uploaded to S3:', profilePictureUrl);
      } catch (uploadError) {
        console.error('Error uploading profile picture:', uploadError);
        return res.status(500).json({
          success: false,
          message: 'Error uploading profile picture. Please try again.'
        });
      }
    }
    
    // Create new student (studentId will be auto-generated)
    const student = await Student.create({
      email,
      password,
      originalPassword: password, // Store original password as requested
      firstName,
      lastName,
      department,
      year,
      phoneNumber,
      dateOfBirth,
      address,
      profilePicture: profilePictureUrl,
      interests
    });
    
    // Generate token
    const token = generateToken({
      id: student._id,
      email: student.email,
      userType: 'student',
      studentId: student.studentId
    });
    
    // Set cookie
    res.cookie('token', token, {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    
    res.status(201).json({
      success: true,
      message: 'Student registered successfully',
      data: {
        student: {
          id: student._id,
          email: student.email,
          firstName: student.firstName,
          lastName: student.lastName,
          studentId: student.studentId,
          department: student.department,
          year: student.year,
          profilePicture: student.profilePicture,
          isActive: student.isActive,
          isVerified: student.isVerified
        },
        token
      }
    });
    
  } catch (error) {
    console.error('Student signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during student registration'
    });
  }
};

const studentLogin = async (req, res) => {
  try {
    const { email, studentId, password } = req.body;
    
    // Validate that either email or studentId is provided
    if (!email && !studentId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide either email or student ID'
      });
    }
    
    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required'
      });
    }
    
    let student;
    
    // Find student by email or studentId
    if (email) {
      student = await Student.findOne({ email }).select('+password');
    } else if (studentId) {
      student = await Student.findOne({ studentId: studentId.toUpperCase() }).select('+password');
    }
    
    if (!student) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Check if student is active
    if (!student.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact administrator.'
      });
    }
    
    // Compare password
    const isPasswordValid = await student.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Update last login
    student.lastLogin = new Date();
    await student.save({ validateBeforeSave: false });
    
    // Generate token
    const token = generateToken({
      id: student._id,
      email: student.email,
      userType: 'student',
      studentId: student.studentId
    });
    
    // Set cookie
    res.cookie('token', token, {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    
    res.json({
      success: true,
      message: 'Student login successful',
      data: {
        student: {
          id: student._id,
          email: student.email,
          firstName: student.firstName,
          lastName: student.lastName,
          studentId: student.studentId,
          department: student.department,
          year: student.year,
          isVerified: student.isVerified,
          lastLogin: student.lastLogin
        },
        token
      }
    });
    
  } catch (error) {
    console.error('Student login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during student login'
    });
  }
};

// Society Member Authentication
const societyMemberSignup = async (req, res) => {
  try {
    const { email, password, firstName, lastName, societyName, position, department, phoneNumber, dateOfBirth, address, skills, responsibilities } = req.body;
    
    // Check if society member already exists by email
    const existingMember = await SocietyMember.findOne({ email });
    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: 'Society member with this email already exists'
      });
    }
    
    // Generate unique member ID
    const memberId = await generateMemberId();
    
    // Handle profile picture upload if provided
    let profilePictureUrl = null;
    if (req.file) {
      try {
        const uploadResult = await uploadProfilePictureToS3(req.file);
        profilePictureUrl = uploadResult.url;
        console.log('Profile picture uploaded successfully:', profilePictureUrl);
      } catch (uploadError) {
        console.error('Profile picture upload failed:', uploadError);
        return res.status(500).json({
          success: false,
          message: 'Failed to upload profile picture. Please try again.'
        });
      }
    }
    
    // Create new society member
    const member = await SocietyMember.create({
      email,
      password,
      originalPassword: password, // Store original password as requested
      firstName,
      lastName,
      memberId, // Auto-generated member ID
      societyName,
      position,
      department,
      phoneNumber,
      dateOfBirth,
      address,
      profilePicture: profilePictureUrl,
      skills,
      responsibilities
    });
    
    // Generate token
    const token = generateToken({
      id: member._id,
      email: member.email,
      userType: 'societyMember',
      memberId: member.memberId
    });
    
    // Set cookie
    res.cookie('token', token, {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    
    res.status(201).json({
      success: true,
      message: 'Society member registered successfully',
      data: {
        member: {
          id: member._id,
          email: member.email,
          firstName: member.firstName,
          lastName: member.lastName,
          memberId: member.memberId,
          societyName: member.societyName,
          position: member.position,
          department: member.department,
          profilePicture: member.profilePicture,
          isActive: member.isActive,
          isVerified: member.isVerified,
          kycStatus: member.kycStatus,
          joiningDate: member.joiningDate
        },
        token
      }
    });
    
  } catch (error) {
    console.error('Society member signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during society member registration'
    });
  }
};

const societyMemberLogin = async (req, res) => {
  try {
    const { email, memberId, password } = req.body;
    
    // Validate that either email or memberId is provided
    if (!email && !memberId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide either email or member ID'
      });
    }
    
    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required'
      });
    }
    
    let member;
    
    // Find society member by email or memberId
    if (email) {
      member = await SocietyMember.findOne({ email }).select('+password');
    } else if (memberId) {
      member = await SocietyMember.findOne({ memberId: memberId.toUpperCase() }).select('+password');
    }
    
    if (!member) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Check if member is active
    if (!member.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact administrator.'
      });
    }
    
    // Compare password
    const isPasswordValid = await member.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Update last login
    member.lastLogin = new Date();
    await member.save({ validateBeforeSave: false });
    
    // Generate token
    const token = generateToken({
      id: member._id,
      email: member.email,
      userType: 'societyMember',
      memberId: member.memberId
    });
    
    // Set cookie
    res.cookie('token', token, {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    
    res.json({
      success: true,
      message: 'Society member login successful',
      data: {
        member: {
          id: member._id,
          email: member.email,
          firstName: member.firstName,
          lastName: member.lastName,
          memberId: member.memberId,
          societyName: member.societyName,
          position: member.position,
          isVerified: member.isVerified,
          lastLogin: member.lastLogin
        },
        token
      }
    });
    
  } catch (error) {
    console.error('Society member login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during society member login'
    });
  }
};

// Logout function
const logout = (req, res) => {
  res.clearCookie('token');
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const user = req.user;
    const userType = req.userType;
    
    res.json({
      success: true,
      data: {
        user,
        userType
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching profile'
    });
  }
};

module.exports = {
  adminSignup,
  adminLogin,
  studentSignup,
  studentLogin,
  societyMemberSignup,
  societyMemberLogin,
  logout,
  getProfile
};
