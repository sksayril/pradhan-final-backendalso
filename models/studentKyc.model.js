const mongoose = require('mongoose');

const studentKycSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
    unique: true
  },
  aadharNumber: {
    type: String,
    required: [true, 'Aadhar number is required'],
    unique: true,
    validate: {
      validator: function(v) {
        return /^\d{12}$/.test(v);
      },
      message: 'Aadhar number must be exactly 12 digits'
    }
  },
  aadharCardImage: {
    type: String,
    required: [true, 'Aadhar card image is required']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  reviewedAt: {
    type: Date
  },
  rejectionReason: {
    type: String
  },
  remarks: {
    type: String
  }
}, {
  timestamps: true
});

// Index for better query performance
studentKycSchema.index({ studentId: 1 });
studentKycSchema.index({ status: 1 });
studentKycSchema.index({ aadharNumber: 1 });

module.exports = mongoose.model('StudentKyc', studentKycSchema);
