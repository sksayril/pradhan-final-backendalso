const Student = require('../models/student.model');
const SocietyMember = require('../models/societyMember.model');
const StudentKyc = require('../models/studentKyc.model');
const SocietyMemberKyc = require('../models/societyMemberKyc.model');
const { uploadKycImageToS3, uploadMultipleKycImagesToS3, deleteFileFromS3 } = require('../middleware/fileUpload');

// Student KYC submission
const submitStudentKyc = async (req, res) => {
  let aadharCardImageUrl = null;
  
  try {
    const { aadharNumber } = req.body;
    
    // Sanitize aadhar number (remove any spaces or special characters)
    const sanitizedAadharNumber = aadharNumber ? aadharNumber.replace(/\D/g, '') : '';
    const studentId = req.user._id;

    // Check if KYC already exists
    const existingKyc = await StudentKyc.findOne({ studentId });
    if (existingKyc) {
      return res.status(400).json({
        success: false,
        message: 'KYC already submitted'
      });
    }

    // Check if aadhar number already exists
    const existingAadhar = await StudentKyc.findOne({ aadharNumber: sanitizedAadharNumber });
    if (existingAadhar) {
      return res.status(400).json({
        success: false,
        message: 'Aadhar number already registered'
      });
    }

    // Check if file is uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Aadhar card image is required'
      });
    }

    // Process, compress and upload file to S3
    const uploadResult = await uploadKycImageToS3(req.file, 'student-kyc');
    aadharCardImageUrl = uploadResult.url;

    // Create KYC record
    const kycData = {
      studentId,
      aadharNumber: sanitizedAadharNumber,
      aadharCardImage: aadharCardImageUrl
    };

    const kyc = await StudentKyc.create(kycData);

    // Update student KYC status
    await Student.findByIdAndUpdate(studentId, {
      kycStatus: 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'KYC submitted successfully',
      data: {
        kyc: {
          id: kyc._id,
          aadharNumber: kyc.aadharNumber,
          status: kyc.status,
          submittedAt: kyc.submittedAt
        },
        uploadInfo: {
          originalSize: uploadResult.originalSize,
          compressedSize: uploadResult.compressedSize,
          compressionRatio: ((uploadResult.originalSize - uploadResult.compressedSize) / uploadResult.originalSize * 100).toFixed(2) + '%'
        }
      }
    });

  } catch (error) {
    console.error('Student KYC submission error:', error);
    
    // Delete uploaded file from S3 if KYC creation fails
    if (req.file && aadharCardImageUrl) {
      await deleteFileFromS3(aadharCardImageUrl);
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error during KYC submission'
    });
  }
};

// Society Member KYC submission
const submitSocietyMemberKyc = async (req, res) => {
  let aadharCardImageUrl = null;
  let panCardImageUrl = null;
  
  try {
    const { aadharNumber, panNumber } = req.body;
    
    // Sanitize aadhar number and PAN number
    const sanitizedAadharNumber = aadharNumber ? aadharNumber.replace(/\D/g, '') : '';
    const sanitizedPanNumber = panNumber ? panNumber.replace(/\s/g, '').toUpperCase() : '';
    const memberId = req.user._id;

    // Check if KYC already exists
    const existingKyc = await SocietyMemberKyc.findOne({ memberId });
    if (existingKyc) {
      return res.status(400).json({
        success: false,
        message: 'KYC already submitted'
      });
    }

    // Check if aadhar number already exists
    const existingAadhar = await SocietyMemberKyc.findOne({ aadharNumber: sanitizedAadharNumber });
    if (existingAadhar) {
      return res.status(400).json({
        success: false,
        message: 'Aadhar number already registered'
      });
    }

    // Check if PAN number already exists
    const existingPan = await SocietyMemberKyc.findOne({ panNumber: sanitizedPanNumber });
    if (existingPan) {
      return res.status(400).json({
        success: false,
        message: 'PAN number already registered'
      });
    }

    // Check if files are uploaded
    if (!req.files || !req.files.aadharCardImage || !req.files.panCardImage) {
      return res.status(400).json({
        success: false,
        message: 'Both Aadhar card and PAN card images are required'
      });
    }

    // Get aadhar and pan card images
    const aadharImage = req.files.aadharCardImage[0];
    const panImage = req.files.panCardImage[0];

    if (!aadharImage || !panImage) {
      return res.status(400).json({
        success: false,
        message: 'Both Aadhar card and PAN card images are required'
      });
    }

    // Process, compress and upload files to S3
    const uploadResults = await uploadMultipleKycImagesToS3([aadharImage, panImage], 'society-member-kyc');
    aadharCardImageUrl = uploadResults[0].url;
    panCardImageUrl = uploadResults[1].url;

    // Create KYC record
    const kycData = {
      memberId,
      aadharNumber: sanitizedAadharNumber,
      panNumber: sanitizedPanNumber,
      aadharCardImage: aadharCardImageUrl,
      panCardImage: panCardImageUrl
    };

    const kyc = await SocietyMemberKyc.create(kycData);

    // Update society member KYC status
    await SocietyMember.findByIdAndUpdate(memberId, {
      kycStatus: 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'KYC submitted successfully',
      data: {
        kyc: {
          id: kyc._id,
          aadharNumber: kyc.aadharNumber,
          panNumber: kyc.panNumber,
          status: kyc.status,
          submittedAt: kyc.submittedAt
        },
        uploadInfo: {
          aadharImage: {
            originalSize: uploadResults[0].originalSize,
            compressedSize: uploadResults[0].compressedSize,
            compressionRatio: ((uploadResults[0].originalSize - uploadResults[0].compressedSize) / uploadResults[0].originalSize * 100).toFixed(2) + '%'
          },
          panImage: {
            originalSize: uploadResults[1].originalSize,
            compressedSize: uploadResults[1].compressedSize,
            compressionRatio: ((uploadResults[1].originalSize - uploadResults[1].compressedSize) / uploadResults[1].originalSize * 100).toFixed(2) + '%'
          }
        }
      }
    });

  } catch (error) {
    console.error('Society Member KYC submission error:', error);
    
    // Delete uploaded files from S3 if KYC creation fails
    if (aadharCardImageUrl) {
      await deleteFileFromS3(aadharCardImageUrl);
    }
    if (panCardImageUrl) {
      await deleteFileFromS3(panCardImageUrl);
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error during KYC submission'
    });
  }
};

// Get student KYC status
const getStudentKycStatus = async (req, res) => {
  try {
    const studentId = req.user._id;

    const kyc = await StudentKyc.findOne({ studentId })
      .populate('reviewedBy', 'firstName lastName email');

    if (!kyc) {
      return res.json({
        success: true,
        data: {
          kycStatus: 'not_submitted',
          kyc: null
        }
      });
    }

    res.json({
      success: true,
      data: {
        kycStatus: kyc.status,
        kyc: {
          id: kyc._id,
          aadharNumber: kyc.aadharNumber,
          status: kyc.status,
          submittedAt: kyc.submittedAt,
          reviewedAt: kyc.reviewedAt,
          rejectionReason: kyc.rejectionReason,
          remarks: kyc.remarks,
          reviewedBy: kyc.reviewedBy
        }
      }
    });

  } catch (error) {
    console.error('Get student KYC status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching KYC status'
    });
  }
};

// Get society member KYC status
const getSocietyMemberKycStatus = async (req, res) => {
  try {
    const memberId = req.user._id;

    const kyc = await SocietyMemberKyc.findOne({ memberId })
      .populate('reviewedBy', 'firstName lastName email');

    if (!kyc) {
      return res.json({
        success: true,
        data: {
          kycStatus: 'not_submitted',
          kyc: null
        }
      });
    }

    res.json({
      success: true,
      data: {
        kycStatus: kyc.status,
        kyc: {
          id: kyc._id,
          aadharNumber: kyc.aadharNumber,
          panNumber: kyc.panNumber,
          status: kyc.status,
          submittedAt: kyc.submittedAt,
          reviewedAt: kyc.reviewedAt,
          rejectionReason: kyc.rejectionReason,
          remarks: kyc.remarks,
          reviewedBy: kyc.reviewedBy
        }
      }
    });

  } catch (error) {
    console.error('Get society member KYC status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching KYC status'
    });
  }
};

// Admin: Get all pending KYC requests
const getAllPendingKyc = async (req, res) => {
  try {
    const studentKyc = await StudentKyc.find({ status: 'pending' })
      .populate('studentId', 'firstName lastName email studentId department year')
      .sort({ submittedAt: -1 });

    const societyMemberKyc = await SocietyMemberKyc.find({ status: 'pending' })
      .populate('memberId', 'firstName lastName email memberId societyName position')
      .sort({ submittedAt: -1 });

    res.json({
      success: true,
      data: {
        studentKyc,
        societyMemberKyc,
        totalPending: studentKyc.length + societyMemberKyc.length
      }
    });

  } catch (error) {
    console.error('Get all pending KYC error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching pending KYC requests'
    });
  }
};

// Admin: Approve student KYC
const approveStudentKyc = async (req, res) => {
  try {
    const { kycId, remarks } = req.body;
    const adminId = req.user._id;

    const kyc = await StudentKyc.findById(kycId);
    if (!kyc) {
      return res.status(404).json({
        success: false,
        message: 'KYC not found'
      });
    }

    if (kyc.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'KYC is not in pending status'
      });
    }

    // Update KYC status
    kyc.status = 'approved';
    kyc.reviewedBy = adminId;
    kyc.reviewedAt = new Date();
    kyc.remarks = remarks;
    await kyc.save();

    // Update student KYC status
    await Student.findByIdAndUpdate(kyc.studentId, {
      kycStatus: 'approved',
      isVerified: true
    });

    res.json({
      success: true,
      message: 'Student KYC approved successfully',
      data: {
        kyc: {
          id: kyc._id,
          status: kyc.status,
          reviewedAt: kyc.reviewedAt,
          remarks: kyc.remarks
        }
      }
    });

  } catch (error) {
    console.error('Approve student KYC error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while approving KYC'
    });
  }
};

// Admin: Reject student KYC
const rejectStudentKyc = async (req, res) => {
  try {
    const { kycId, rejectionReason, remarks } = req.body;
    const adminId = req.user._id;

    const kyc = await StudentKyc.findById(kycId);
    if (!kyc) {
      return res.status(404).json({
        success: false,
        message: 'KYC not found'
      });
    }

    if (kyc.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'KYC is not in pending status'
      });
    }

    // Update KYC status
    kyc.status = 'rejected';
    kyc.reviewedBy = adminId;
    kyc.reviewedAt = new Date();
    kyc.rejectionReason = rejectionReason;
    kyc.remarks = remarks;
    await kyc.save();

    // Update student KYC status
    await Student.findByIdAndUpdate(kyc.studentId, {
      kycStatus: 'rejected'
    });

    res.json({
      success: true,
      message: 'Student KYC rejected',
      data: {
        kyc: {
          id: kyc._id,
          status: kyc.status,
          reviewedAt: kyc.reviewedAt,
          rejectionReason: kyc.rejectionReason,
          remarks: kyc.remarks
        }
      }
    });

  } catch (error) {
    console.error('Reject student KYC error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while rejecting KYC'
    });
  }
};

// Admin: Approve society member KYC
const approveSocietyMemberKyc = async (req, res) => {
  try {
    const { kycId, remarks } = req.body;
    const adminId = req.user._id;

    const kyc = await SocietyMemberKyc.findById(kycId);
    if (!kyc) {
      return res.status(404).json({
        success: false,
        message: 'KYC not found'
      });
    }

    if (kyc.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'KYC is not in pending status'
      });
    }

    // Update KYC status
    kyc.status = 'approved';
    kyc.reviewedBy = adminId;
    kyc.reviewedAt = new Date();
    kyc.remarks = remarks;
    await kyc.save();

    // Update society member KYC status
    await SocietyMember.findByIdAndUpdate(kyc.memberId, {
      kycStatus: 'approved',
      isVerified: true
    });

    res.json({
      success: true,
      message: 'Society member KYC approved successfully',
      data: {
        kyc: {
          id: kyc._id,
          status: kyc.status,
          reviewedAt: kyc.reviewedAt,
          remarks: kyc.remarks
        }
      }
    });

  } catch (error) {
    console.error('Approve society member KYC error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while approving KYC'
    });
  }
};

// Admin: Reject society member KYC
const rejectSocietyMemberKyc = async (req, res) => {
  try {
    const { kycId, rejectionReason, remarks } = req.body;
    const adminId = req.user._id;

    const kyc = await SocietyMemberKyc.findById(kycId);
    if (!kyc) {
      return res.status(404).json({
        success: false,
        message: 'KYC not found'
      });
    }

    if (kyc.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'KYC is not in pending status'
      });
    }

    // Update KYC status
    kyc.status = 'rejected';
    kyc.reviewedBy = adminId;
    kyc.reviewedAt = new Date();
    kyc.rejectionReason = rejectionReason;
    kyc.remarks = remarks;
    await kyc.save();

    // Update society member KYC status
    await SocietyMember.findByIdAndUpdate(kyc.memberId, {
      kycStatus: 'rejected'
    });

    res.json({
      success: true,
      message: 'Society member KYC rejected',
      data: {
        kyc: {
          id: kyc._id,
          status: kyc.status,
          reviewedAt: kyc.reviewedAt,
          rejectionReason: kyc.rejectionReason,
          remarks: kyc.remarks
        }
      }
    });

  } catch (error) {
    console.error('Reject society member KYC error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while rejecting KYC'
    });
  }
};

module.exports = {
  submitStudentKyc,
  submitSocietyMemberKyc,
  getStudentKycStatus,
  getSocietyMemberKycStatus,
  getAllPendingKyc,
  approveStudentKyc,
  rejectStudentKyc,
  approveSocietyMemberKyc,
  rejectSocietyMemberKyc
};
