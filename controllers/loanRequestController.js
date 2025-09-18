const LoanRequest = require('../models/loanRequest.model');
const EMIRecord = require('../models/emiRecord.model');
const SocietyMember = require('../models/societyMember.model');
const { uploadToS3, deleteFromS3 } = require('../config/aws');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

// Create loan request
const createLoanRequest = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const memberId = req.user.id;
    const {
      loanAmount,
      loanPurpose,
      loanDescription,
      tenureMonths,
      emiAmount,
      interestRate
    } = req.body;

    // Verify member exists and is active
    const member = await SocietyMember.findById(memberId);
    if (!member || !member.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Member not found or inactive'
      });
    }

    // Check if member has any pending loan requests
    const pendingRequest = await LoanRequest.findOne({
      memberId: new mongoose.Types.ObjectId(memberId),
      status: { $in: ['pending', 'approved'] }
    });

    if (pendingRequest) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending or approved loan request'
      });
    }

    // Create loan request
    const loanRequest = new LoanRequest({
      memberId: new mongoose.Types.ObjectId(memberId),
      loanAmount,
      loanPurpose,
      loanDescription,
      emiOptions: {
        tenureMonths,
        emiAmount,
        interestRate
      },
      createdBy: new mongoose.Types.ObjectId(memberId)
    });

    await loanRequest.save();

    res.status(201).json({
      success: true,
      message: 'Loan request created successfully',
      data: {
        requestId: loanRequest.requestId,
        loanAmount: loanRequest.loanAmount,
        loanPurpose: loanRequest.loanPurpose,
        status: loanRequest.status,
        createdAt: loanRequest.createdAt
      }
    });

  } catch (error) {
    console.error('Error creating loan request:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get member's loan requests
const getMemberLoanRequests = async (req, res) => {
  try {
    const memberId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;

    const options = {};
    if (status) options.status = status;

    const loanRequests = await LoanRequest.getLoanRequestsByMember(
      new mongoose.Types.ObjectId(memberId),
      options
    )
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalRequests = await LoanRequest.countDocuments({
      memberId: new mongoose.Types.ObjectId(memberId)
    });

    res.status(200).json({
      success: true,
      message: 'Loan requests retrieved successfully',
      data: {
        loanRequests,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalRequests / limit),
          totalRequests,
          hasNext: page * limit < totalRequests,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error getting loan requests:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get loan request details
const getLoanRequestDetails = async (req, res) => {
  try {
    const { requestId } = req.params;
    const memberId = req.user.id;

    const loanRequest = await LoanRequest.findOne({
      requestId: requestId,
      memberId: new mongoose.Types.ObjectId(memberId)
    })
      .populate('approvedBy', 'firstName lastName email')
      .populate('emiRecords')
      .populate('paymentRecords');

    if (!loanRequest) {
      return res.status(404).json({
        success: false,
        message: 'Loan request not found or access denied'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Loan request details retrieved successfully',
      data: loanRequest
    });

  } catch (error) {
    console.error('Error getting loan request details:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Upload loan documents
const uploadLoanDocuments = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { documentType, documentName } = req.body;
    const memberId = req.user.id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Document file is required'
      });
    }

    // Verify loan request exists and belongs to member
    const loanRequest = await LoanRequest.findOne({
      requestId: requestId,
      memberId: new mongoose.Types.ObjectId(memberId)
    });

    if (!loanRequest) {
      return res.status(404).json({
        success: false,
        message: 'Loan request not found or access denied'
      });
    }

    // Upload document to S3
    const uploadResult = await uploadToS3(req.file, 'loan-documents');
    
    // Add document to loan request
    loanRequest.documents.push({
      documentType,
      documentName: documentName || req.file.originalname,
      documentUrl: uploadResult.Location
    });

    await loanRequest.save();

    res.status(200).json({
      success: true,
      message: 'Document uploaded successfully',
      data: {
        documentType,
        documentName: documentName || req.file.originalname,
        documentUrl: uploadResult.Location
      }
    });

  } catch (error) {
    console.error('Error uploading loan document:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete loan document
const deleteLoanDocument = async (req, res) => {
  try {
    const { requestId, documentId } = req.params;
    const memberId = req.user.id;

    const loanRequest = await LoanRequest.findOne({
      requestId: requestId,
      memberId: new mongoose.Types.ObjectId(memberId)
    });

    if (!loanRequest) {
      return res.status(404).json({
        success: false,
        message: 'Loan request not found or access denied'
      });
    }

    const document = loanRequest.documents.id(documentId);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Delete from S3
    await deleteFromS3(document.documentUrl);

    // Remove from array
    document.remove();
    await loanRequest.save();

    res.status(200).json({
      success: true,
      message: 'Document deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting loan document:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update loan request
const updateLoanRequest = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { requestId } = req.params;
    const memberId = req.user.id;
    const {
      loanAmount,
      loanPurpose,
      loanDescription,
      tenureMonths,
      emiAmount,
      interestRate
    } = req.body;

    const loanRequest = await LoanRequest.findOne({
      requestId: requestId,
      memberId: new mongoose.Types.ObjectId(memberId),
      status: 'pending' // Only allow updates for pending requests
    });

    if (!loanRequest) {
      return res.status(404).json({
        success: false,
        message: 'Loan request not found, access denied, or cannot be updated'
      });
    }

    // Update fields
    if (loanAmount) loanRequest.loanAmount = loanAmount;
    if (loanPurpose) loanRequest.loanPurpose = loanPurpose;
    if (loanDescription) loanRequest.loanDescription = loanDescription;
    if (tenureMonths) loanRequest.emiOptions.tenureMonths = tenureMonths;
    if (emiAmount) loanRequest.emiOptions.emiAmount = emiAmount;
    if (interestRate) loanRequest.emiOptions.interestRate = interestRate;

    loanRequest.updatedAt = new Date();
    await loanRequest.save();

    res.status(200).json({
      success: true,
      message: 'Loan request updated successfully',
      data: loanRequest
    });

  } catch (error) {
    console.error('Error updating loan request:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Cancel loan request
const cancelLoanRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const memberId = req.user.id;

    const loanRequest = await LoanRequest.findOne({
      requestId: requestId,
      memberId: new mongoose.Types.ObjectId(memberId),
      status: 'pending' // Only allow cancellation of pending requests
    });

    if (!loanRequest) {
      return res.status(404).json({
        success: false,
        message: 'Loan request not found, access denied, or cannot be cancelled'
      });
    }

    // Delete all uploaded documents from S3
    for (const doc of loanRequest.documents) {
      try {
        await deleteFromS3(doc.documentUrl);
      } catch (error) {
        console.error('Error deleting document from S3:', error);
      }
    }

    // Delete the loan request
    await LoanRequest.findByIdAndDelete(loanRequest._id);

    res.status(200).json({
      success: true,
      message: 'Loan request cancelled successfully'
    });

  } catch (error) {
    console.error('Error cancelling loan request:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  createLoanRequest,
  getMemberLoanRequests,
  getLoanRequestDetails,
  uploadLoanDocuments,
  deleteLoanDocument,
  updateLoanRequest,
  cancelLoanRequest
};
