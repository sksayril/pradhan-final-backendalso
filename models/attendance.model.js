const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Student ID is required']
  },
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
  attendanceDate: {
    type: Date,
    required: [true, 'Attendance date is required'],
    default: Date.now
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'excused'],
    required: [true, 'Attendance status is required'],
    default: 'present'
  },
  timeSlot: {
    startTime: {
      type: String,
      required: [true, 'Start time is required']
    },
    endTime: {
      type: String,
      required: [true, 'End time is required']
    },
    duration: {
      type: Number,
      required: [true, 'Duration is required']
    }
  },
  remarks: {
    type: String,
    trim: true,
    maxlength: [500, 'Remarks cannot exceed 500 characters']
  },
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: [true, 'Admin ID is required']
  },
  markedAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for student details
attendanceSchema.virtual('student', {
  ref: 'Student',
  localField: 'studentId',
  foreignField: '_id',
  justOne: true
});

// Virtual for course details
attendanceSchema.virtual('course', {
  ref: 'Course',
  localField: 'courseId',
  foreignField: '_id',
  justOne: true
});

// Virtual for batch details
attendanceSchema.virtual('batch', {
  ref: 'Batch',
  localField: 'batchId',
  foreignField: '_id',
  justOne: true
});

// Virtual for admin details
attendanceSchema.virtual('admin', {
  ref: 'Admin',
  localField: 'markedBy',
  foreignField: '_id',
  justOne: true
});

// Compound index for efficient querying
attendanceSchema.index({ studentId: 1, courseId: 1, batchId: 1, attendanceDate: 1 });
attendanceSchema.index({ attendanceDate: 1, status: 1 });
attendanceSchema.index({ batchId: 1, attendanceDate: 1 });

// Pre-save middleware to ensure unique attendance per student per batch per date per time slot
attendanceSchema.pre('save', async function(next) {
  if (this.isNew) {
    const existingAttendance = await this.constructor.findOne({
      studentId: this.studentId,
      batchId: this.batchId,
      attendanceDate: {
        $gte: new Date(this.attendanceDate.getFullYear(), this.attendanceDate.getMonth(), this.attendanceDate.getDate()),
        $lt: new Date(this.attendanceDate.getFullYear(), this.attendanceDate.getMonth(), this.attendanceDate.getDate() + 1)
      },
      'timeSlot.startTime': this.timeSlot.startTime,
      'timeSlot.endTime': this.timeSlot.endTime,
      isActive: true
    });

    if (existingAttendance) {
      return next(new Error('Attendance already marked for this student on this date and time slot'));
    }
  }
  next();
});

// Static method to get attendance statistics
attendanceSchema.statics.getAttendanceStats = async function(studentId, courseId, batchId, startDate, endDate) {
  const matchQuery = {
    studentId: new mongoose.Types.ObjectId(studentId),
    isActive: true
  };

  if (courseId) matchQuery.courseId = new mongoose.Types.ObjectId(courseId);
  if (batchId) matchQuery.batchId = new mongoose.Types.ObjectId(batchId);
  if (startDate && endDate) {
    matchQuery.attendanceDate = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const stats = await this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const result = {
    total: 0,
    present: 0,
    absent: 0,
    late: 0,
    excused: 0,
    attendancePercentage: 0
  };

  stats.forEach(stat => {
    result[stat._id] = stat.count;
    result.total += stat.count;
  });

  if (result.total > 0) {
    result.attendancePercentage = Math.round(((result.present + result.late) / result.total) * 100);
  }

  return result;
};

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;
