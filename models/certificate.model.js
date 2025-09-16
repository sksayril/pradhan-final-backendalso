const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  // Auto-generated certificate number
  certificateNumber: {
    type: String,
    unique: true,
    uppercase: true
  },
  // Student information
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Student ID is required']
  },
  // Course and batch information
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course ID is required']
  },
  batchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
    required: [true, 'Batch ID is required']
  },
  // Marksheet reference
  marksheetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Marksheet'
  },
  // Certificate details
  certificateType: {
    type: String,
    required: [true, 'Certificate type is required'],
    enum: ['Completion', 'Participation', 'Achievement', 'Excellence', 'Merit', 'Distinction', 'Honor']
  },
  certificateTitle: {
    type: String,
    required: [true, 'Certificate title is required'],
    trim: true,
    maxlength: [200, 'Certificate title cannot exceed 200 characters']
  },
  // Academic information
  academicYear: {
    type: String,
    required: [true, 'Academic year is required'],
    trim: true
  },
  duration: {
    type: String,
    required: [true, 'Duration is required'],
    trim: true
  },
  // Performance details
  grade: {
    type: String,
    enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F', 'P', 'NP', 'Distinction', 'First Class', 'Second Class', 'Pass'],
    uppercase: true
  },
  percentage: {
    type: Number,
    min: [0, 'Percentage cannot be negative'],
    max: [100, 'Percentage cannot exceed 100']
  },
  cgpa: {
    type: Number,
    min: [0, 'CGPA cannot be negative'],
    max: [10, 'CGPA cannot exceed 10']
  },
  // Certificate dates
  courseStartDate: {
    type: Date,
    required: [true, 'Course start date is required']
  },
  courseEndDate: {
    type: Date,
    required: [true, 'Course end date is required']
  },
  certificateIssueDate: {
    type: Date,
    required: [true, 'Certificate issue date is required']
  },
  // Document information
  certificateUrl: {
    type: String
  },
  // Status and verification
  status: {
    type: String,
    enum: ['draft', 'issued', 'delivered', 'archived', 'cancelled'],
    default: 'draft'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  verifiedAt: {
    type: Date
  },
  // Admin management
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: [true, 'Created by admin is required']
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  // Additional information
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  achievements: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    date: {
      type: Date
    }
  }],
  // Digital signature and verification
  digitalSignature: {
    type: String
  },
  verificationCode: {
    type: String,
    unique: true
  },
  // Delivery information
  deliveryMethod: {
    type: String,
    enum: ['Digital', 'Physical', 'Both'],
    default: 'Digital'
  },
  deliveryAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: {
      type: String,
      default: 'India'
    }
  },
  deliveryStatus: {
    type: String,
    enum: ['Pending', 'In Transit', 'Delivered', 'Failed', 'Returned'],
    default: 'Pending'
  },
  deliveryDate: {
    type: Date
  },
  trackingNumber: {
    type: String,
    trim: true
  },
  // Print and download tracking
  printHistory: [{
    printedAt: {
      type: Date,
      default: Date.now
    },
    printedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    },
    printReason: {
      type: String,
      trim: true
    }
  }],
  downloadHistory: [{
    downloadedAt: {
      type: Date,
      default: Date.now
    },
    downloadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student'
    },
    ipAddress: {
      type: String
    }
  }],
  // Certificate template information
  templateId: {
    type: String,
    trim: true
  },
  templateVersion: {
    type: String,
    trim: true
  },
  // QR Code for verification
  qrCodeUrl: {
    type: String
  },
  // Blockchain verification (future enhancement)
  blockchainHash: {
    type: String
  },
  blockchainTransactionId: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for better query performance
certificateSchema.index({ certificateNumber: 1 });
certificateSchema.index({ studentId: 1 });
certificateSchema.index({ courseId: 1 });
certificateSchema.index({ batchId: 1 });
certificateSchema.index({ marksheetId: 1 });
certificateSchema.index({ certificateType: 1 });
certificateSchema.index({ academicYear: 1 });
certificateSchema.index({ status: 1 });
certificateSchema.index({ createdBy: 1 });
certificateSchema.index({ verificationCode: 1 });
certificateSchema.index({ deliveryStatus: 1 });

// Pre-save middleware to generate certificate number
certificateSchema.pre('save', async function(next) {
  if (!this.certificateNumber) {
    try {
      const count = await this.constructor.countDocuments();
      const year = new Date().getFullYear().toString().slice(-2);
      const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
      const sequence = (count + 1).toString().padStart(4, '0');
      this.certificateNumber = `CERT${year}${month}${sequence}`;
    } catch (error) {
      return next(error);
    }
  }
  
  // Generate verification code if not exists
  if (!this.verificationCode) {
    const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.verificationCode = `CERT${randomCode}`;
  }
  
  next();
});

// Pre-save middleware to validate dates
certificateSchema.pre('save', function(next) {
  // Validate that course end date is after start date
  if (this.courseEndDate <= this.courseStartDate) {
    return next(new Error('Course end date must be after start date'));
  }
  
  // Validate that certificate issue date is after course end date
  if (this.certificateIssueDate < this.courseEndDate) {
    return next(new Error('Certificate issue date must be after or on course end date'));
  }
  
  next();
});

// Method to get certificate summary
certificateSchema.methods.getCertificateSummary = function() {
  return {
    certificateNumber: this.certificateNumber,
    studentId: this.studentId,
    courseId: this.courseId,
    batchId: this.batchId,
    certificateType: this.certificateType,
    certificateTitle: this.certificateTitle,
    academicYear: this.academicYear,
    grade: this.grade,
    percentage: this.percentage,
    cgpa: this.cgpa,
    status: this.status,
    isVerified: this.isVerified,
    courseStartDate: this.courseStartDate,
    courseEndDate: this.courseEndDate,
    certificateIssueDate: this.certificateIssueDate,
    verificationCode: this.verificationCode,
    deliveryStatus: this.deliveryStatus
  };
};

// Method to verify certificate
certificateSchema.methods.verifyCertificate = function(adminId) {
  this.isVerified = true;
  this.verifiedBy = adminId;
  this.verifiedAt = new Date();
  this.status = 'issued';
};

// Method to issue certificate
certificateSchema.methods.issueCertificate = function(adminId) {
  this.status = 'issued';
  this.lastModifiedBy = adminId;
};

// Method to mark as delivered
certificateSchema.methods.markAsDelivered = function(trackingNumber) {
  this.deliveryStatus = 'Delivered';
  this.deliveryDate = new Date();
  if (trackingNumber) {
    this.trackingNumber = trackingNumber;
  }
};

// Method to add print record
certificateSchema.methods.addPrintRecord = function(adminId, reason) {
  this.printHistory.push({
    printedBy: adminId,
    printReason: reason
  });
};

// Method to add download record
certificateSchema.methods.addDownloadRecord = function(studentId, ipAddress) {
  this.downloadHistory.push({
    downloadedBy: studentId,
    ipAddress: ipAddress
  });
};

// Static method to get certificate by verification code
certificateSchema.statics.findByVerificationCode = function(code) {
  return this.findOne({ verificationCode: code.toUpperCase() });
};

// Static method to get student certificates
certificateSchema.statics.findByStudentId = function(studentId) {
  return this.find({ studentId }).sort({ certificateIssueDate: -1 });
};

// Static method to get certificates by course and batch
certificateSchema.statics.findByCourseAndBatch = function(courseId, batchId) {
  return this.find({ courseId, batchId }).sort({ certificateIssueDate: -1 });
};

// Static method to get certificates by type
certificateSchema.statics.findByType = function(type) {
  return this.find({ certificateType: type }).sort({ certificateIssueDate: -1 });
};

// Static method to get pending delivery certificates
certificateSchema.statics.findPendingDelivery = function() {
  return this.find({ 
    deliveryMethod: { $in: ['Physical', 'Both'] },
    deliveryStatus: { $in: ['Pending', 'In Transit'] }
  }).sort({ certificateIssueDate: -1 });
};

module.exports = mongoose.model('Certificate', certificateSchema);
