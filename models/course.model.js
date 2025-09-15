const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true,
    maxlength: [200, 'Course title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Course description is required'],
    trim: true,
    maxlength: [2000, 'Course description cannot exceed 2000 characters']
  },
  type: {
    type: String,
    required: [true, 'Course type is required'],
    enum: ['online', 'offline'],
    default: 'online'
  },
  category: {
    type: String,
    required: [true, 'Course category is required'],
    trim: true,
    maxlength: [100, 'Category cannot exceed 100 characters']
  },
  instructor: {
    name: {
      type: String,
      required: [true, 'Instructor name is required'],
      trim: true,
      maxlength: [100, 'Instructor name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Instructor email is required'],
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      trim: true
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [500, 'Instructor bio cannot exceed 500 characters']
    }
  },
  price: {
    type: Number,
    required: [true, 'Course price is required'],
    min: [0, 'Price cannot be negative']
  },
  currency: {
    type: String,
    default: 'INR',
    enum: ['INR', 'USD', 'EUR']
  },
  duration: {
    type: Number,
    required: [true, 'Course duration is required'],
    min: [1, 'Duration must be at least 1 hour']
  },
  durationUnit: {
    type: String,
    default: 'hours',
    enum: ['hours', 'days', 'weeks', 'months']
  },
  thumbnail: {
    type: String, // URL to S3
    required: [true, 'Course thumbnail is required']
  },
  // Online course specific fields
  coursePdf: {
    type: String, // URL to S3 - only for online courses
    required: function() {
      return this.type === 'online';
    }
  },
  videoUrl: {
    type: String, // For online courses - can be YouTube, Vimeo, or direct video URL
    validate: {
      validator: function(v) {
        if (this.type === 'online' && v) {
          // Basic URL validation
          return /^https?:\/\/.+/.test(v);
        }
        return true;
      },
      message: 'Video URL must be a valid URL'
    }
  },
  // Offline course specific fields
  venue: {
    type: String,
    required: function() {
      return this.type === 'offline';
    },
    trim: true,
    maxlength: [200, 'Venue cannot exceed 200 characters']
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: {
      type: String,
      default: 'India'
    }
  },
  maxStudents: {
    type: Number,
    required: function() {
      return this.type === 'offline';
    },
    min: [1, 'Maximum students must be at least 1']
  },
  // Course status and metadata
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [String],
  prerequisites: [String],
  learningObjectives: [String],
  // Admin who created the course
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  // Course statistics
  enrollmentCount: {
    type: Number,
    default: 0
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
courseSchema.index({ title: 1 });
courseSchema.index({ type: 1 });
courseSchema.index({ category: 1 });
courseSchema.index({ status: 1 });
courseSchema.index({ isActive: 1 });
courseSchema.index({ createdBy: 1 });
courseSchema.index({ price: 1 });

// Virtual for course URL slug
courseSchema.virtual('slug').get(function() {
  return this.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
});

// Ensure virtual fields are serialized
courseSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Course', courseSchema);
