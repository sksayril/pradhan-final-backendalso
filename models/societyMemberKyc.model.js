const mongoose = require('mongoose');

const societyMemberKycSchema = new mongoose.Schema({
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SocietyMember',
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
  panNumber: {
    type: String,
    required: [true, 'PAN number is required'],
    unique: true,
    validate: {
      validator: function(v) {
        return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(v);
      },
      message: 'PAN number must be in format: ABCDE1234F'
    }
  },
  aadharCardImage: {
    type: String,
    required: [true, 'Aadhar card image is required']
  },
  panCardImage: {
    type: String,
    required: [true, 'PAN card image is required']
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
societyMemberKycSchema.index({ memberId: 1 });
societyMemberKycSchema.index({ status: 1 });
societyMemberKycSchema.index({ aadharNumber: 1 });
societyMemberKycSchema.index({ panNumber: 1 });

module.exports = mongoose.model('SocietyMemberKyc', societyMemberKycSchema);
