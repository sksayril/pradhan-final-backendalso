const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  subjectName: {
    type: String,
    required: [true, 'Subject name is required'],
    trim: true
  },
  subjectCode: {
    type: String,
    required: [true, 'Subject code is required'],
    trim: true,
    uppercase: true
  },
  credits: {
    type: Number,
    required: [true, 'Credits are required'],
    min: [1, 'Credits must be at least 1'],
    max: [10, 'Credits cannot exceed 10']
  },
  marksObtained: {
    type: Number,
    required: [true, 'Marks obtained are required'],
    min: [0, 'Marks cannot be negative'],
    max: [100, 'Marks cannot exceed 100']
  },
  maxMarks: {
    type: Number,
    required: [true, 'Maximum marks are required'],
    default: 100,
    min: [1, 'Maximum marks must be at least 1']
  },
  grade: {
    type: String,
    required: [true, 'Grade is required'],
    enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F', 'P', 'NP'],
    uppercase: true
  },
  gradePoints: {
    type: Number,
    required: [true, 'Grade points are required'],
    min: [0, 'Grade points cannot be negative'],
    max: [10, 'Grade points cannot exceed 10']
  }
});

const marksheetSchema = new mongoose.Schema({
  // Auto-generated marksheet number
  marksheetNumber: {
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
  studentInfo: {
    studentId: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    department: { type: String },
    year: { type: String },
    phoneNumber: { type: String },
    address: { type: String }
  },
  // Course and batch information
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course ID is required']
  },
  courseInfo: {
    courseId: { type: String, required: true },
    title: { type: String, required: true },
    category: { type: String },
    instructor: { type: String },
    duration: { type: String }
  },
  batchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
    required: [true, 'Batch ID is required']
  },
  batchInfo: {
    batchId: { type: String, required: true },
    name: { type: String, required: true },
    startDate: { type: Date },
    endDate: { type: Date },
    maxStudents: { type: Number }
  },
  // Academic information
  academicYear: {
    type: String,
    required: [true, 'Academic year is required'],
    trim: true
  },
  semester: {
    type: String,
    required: [true, 'Semester is required'],
    enum: ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', 'Annual']
  },
  examinationType: {
    type: String,
    required: [true, 'Examination type is required'],
    enum: ['Regular', 'Supplementary', 'Improvement', 'Revaluation', 'Backlog']
  },
  // Subject-wise marks
  subjects: [subjectSchema],
  // Overall results
  totalMarks: {
    type: Number,
    required: true
  },
  maxTotalMarks: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number,
    required: true,
    min: [0, 'Percentage cannot be negative'],
    max: [100, 'Percentage cannot exceed 100']
  },
  cgpa: {
    type: Number,
    required: true,
    min: [0, 'CGPA cannot be negative'],
    max: [10, 'CGPA cannot exceed 10']
  },
  overallGrade: {
    type: String,
    required: true,
    enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F', 'P', 'NP'],
    uppercase: true
  },
  result: {
    type: String,
    required: true,
    enum: ['PASS', 'FAIL', 'PROMOTED', 'DETAINED'],
    uppercase: true
  },
  // Examination details
  examinationDate: {
    type: Date,
    required: [true, 'Examination date is required']
  },
  resultDate: {
    type: Date,
    required: [true, 'Result date is required']
  },
  // Document information (removed marksheetUrl as it will be generated from frontend)
  // Status and verification
  status: {
    type: String,
    enum: ['draft', 'published', 'archived', 'cancelled'],
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
  remarks: {
    type: String,
    trim: true,
    maxlength: [500, 'Remarks cannot exceed 500 characters']
  },
  // Digital signature and verification
  digitalSignature: {
    type: String
  },
  verificationCode: {
    type: String,
    unique: true
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
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
marksheetSchema.index({ marksheetNumber: 1 });
marksheetSchema.index({ studentId: 1 });
marksheetSchema.index({ courseId: 1 });
marksheetSchema.index({ batchId: 1 });
marksheetSchema.index({ academicYear: 1 });
marksheetSchema.index({ semester: 1 });
marksheetSchema.index({ examinationType: 1 });
marksheetSchema.index({ result: 1 });
marksheetSchema.index({ status: 1 });
marksheetSchema.index({ createdBy: 1 });
marksheetSchema.index({ verificationCode: 1 });

// Pre-save middleware to generate marksheet number
marksheetSchema.pre('save', async function(next) {
  if (!this.marksheetNumber) {
    try {
      const count = await this.constructor.countDocuments();
      const year = new Date().getFullYear().toString().slice(-2);
      const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
      const sequence = (count + 1).toString().padStart(4, '0');
      this.marksheetNumber = `MS${year}${month}${sequence}`;
    } catch (error) {
      return next(error);
    }
  }
  
  // Generate verification code if not exists
  if (!this.verificationCode) {
    const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.verificationCode = `VERIFY${randomCode}`;
  }
  
  next();
});

// Pre-save middleware to calculate totals
marksheetSchema.pre('save', function(next) {
  if (this.subjects && this.subjects.length > 0) {
    // Calculate total marks
    this.totalMarks = this.subjects.reduce((sum, subject) => sum + subject.marksObtained, 0);
    this.maxTotalMarks = this.subjects.reduce((sum, subject) => sum + subject.maxMarks, 0);
    
    // Calculate percentage
    this.percentage = Math.round((this.totalMarks / this.maxTotalMarks) * 100 * 100) / 100;
    
    // Calculate CGPA
    const totalGradePoints = this.subjects.reduce((sum, subject) => sum + (subject.gradePoints * subject.credits), 0);
    const totalCredits = this.subjects.reduce((sum, subject) => sum + subject.credits, 0);
    this.cgpa = totalCredits > 0 ? Math.round((totalGradePoints / totalCredits) * 100) / 100 : 0;
    
    // Determine overall grade and result
    this.overallGrade = this.calculateOverallGrade(this.percentage);
    this.result = this.calculateResult();
  }
  
  next();
});

// Method to calculate overall grade based on percentage
marksheetSchema.methods.calculateOverallGrade = function(percentage) {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C+';
  if (percentage >= 40) return 'C';
  if (percentage >= 35) return 'D';
  return 'F';
};

// Method to calculate result
marksheetSchema.methods.calculateResult = function() {
  const hasFailedSubjects = this.subjects.some(subject => subject.grade === 'F' || subject.grade === 'NP');
  if (hasFailedSubjects) {
    return 'FAIL';
  }
  if (this.percentage >= 40) {
    return 'PASS';
  }
  return 'FAIL';
};

// Method to get marksheet summary
marksheetSchema.methods.getMarksheetSummary = function() {
  return {
    marksheetNumber: this.marksheetNumber,
    studentId: this.studentId,
    studentInfo: this.studentInfo,
    courseId: this.courseId,
    courseInfo: this.courseInfo,
    batchId: this.batchId,
    batchInfo: this.batchInfo,
    academicYear: this.academicYear,
    semester: this.semester,
    examinationType: this.examinationType,
    totalMarks: this.totalMarks,
    maxTotalMarks: this.maxTotalMarks,
    percentage: this.percentage,
    cgpa: this.cgpa,
    overallGrade: this.overallGrade,
    result: this.result,
    status: this.status,
    isVerified: this.isVerified,
    examinationDate: this.examinationDate,
    resultDate: this.resultDate,
    verificationCode: this.verificationCode
  };
};

// Method to verify marksheet
marksheetSchema.methods.verifyMarksheet = function(adminId) {
  this.isVerified = true;
  this.verifiedBy = adminId;
  this.verifiedAt = new Date();
  this.status = 'published';
};

// Method to add print record
marksheetSchema.methods.addPrintRecord = function(adminId, reason) {
  this.printHistory.push({
    printedBy: adminId,
    printReason: reason
  });
};

// Method to add download record
marksheetSchema.methods.addDownloadRecord = function(studentId, ipAddress) {
  this.downloadHistory.push({
    downloadedBy: studentId,
    ipAddress: ipAddress
  });
};

// Static method to get marksheet by verification code
marksheetSchema.statics.findByVerificationCode = function(code) {
  return this.findOne({ verificationCode: code.toUpperCase() });
};

// Static method to get student marksheets
marksheetSchema.statics.findByStudentId = function(studentId) {
  return this.find({ studentId }).sort({ academicYear: -1, semester: -1 });
};

// Static method to get marksheets by course and batch
marksheetSchema.statics.findByCourseAndBatch = function(courseId, batchId) {
  return this.find({ courseId, batchId }).sort({ totalMarks: -1 });
};

module.exports = mongoose.model('Marksheet', marksheetSchema);
