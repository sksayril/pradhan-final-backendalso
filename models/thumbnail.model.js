const mongoose = require('mongoose');

const thumbnailSchema = new mongoose.Schema({
  // Thumbnail identification
  thumbnailId: {
    type: String,
    required: false, // Will be auto-generated in pre-save middleware
    unique: true,
    uppercase: true
  },
  
  // Image information
  title: {
    type: String,
    required: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  
  // Image URLs
  originalImageUrl: {
    type: String,
    required: true
  },
  
  thumbnailUrl: {
    type: String,
    required: true
  },
  
  // Image metadata
  fileName: {
    type: String,
    required: true
  },
  
  fileSize: {
    type: Number,
    required: true
  },
  
  mimeType: {
    type: String,
    required: true
  },
  
  dimensions: {
    width: {
      type: Number,
      required: true
    },
    height: {
      type: Number,
      required: true
    }
  },
  
  // Categorization
  category: {
    type: String,
    enum: ['gallery', 'banner', 'slider', 'event', 'announcement', 'society_photo', 'other'],
    default: 'gallery'
  },
  
  tags: [{
    type: String,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }],
  
  // Status and visibility
  status: {
    type: String,
    enum: ['active', 'inactive', 'archived'],
    default: 'active'
  },
  
  isPublic: {
    type: Boolean,
    default: true
  },
  
  // Display settings
  displayOrder: {
    type: Number,
    default: 0
  },
  
  isFeatured: {
    type: Boolean,
    default: false
  },
  
  // SEO and accessibility
  altText: {
    type: String,
    maxlength: [200, 'Alt text cannot exceed 200 characters']
  },
  
  // Admin information
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
thumbnailSchema.index({ thumbnailId: 1 });
thumbnailSchema.index({ category: 1, status: 1 });
thumbnailSchema.index({ isPublic: 1, status: 1 });
thumbnailSchema.index({ isFeatured: 1, status: 1 });
thumbnailSchema.index({ displayOrder: 1 });
thumbnailSchema.index({ uploadedBy: 1 });
thumbnailSchema.index({ createdAt: -1 });
thumbnailSchema.index({ tags: 1 });

// Pre-save middleware to generate thumbnail ID
thumbnailSchema.pre('save', async function(next) {
  if (!this.thumbnailId) {
    try {
      const count = await this.constructor.countDocuments();
      const timestamp = new Date().getFullYear().toString().slice(-2);
      const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
      const sequence = (count + 1).toString().padStart(3, '0');
      this.thumbnailId = `THUMB${timestamp}${month}${sequence}`;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Method to update display order
thumbnailSchema.methods.updateDisplayOrder = function(newOrder) {
  this.displayOrder = newOrder;
  this.updatedAt = new Date();
};

// Method to toggle featured status
thumbnailSchema.methods.toggleFeatured = function() {
  this.isFeatured = !this.isFeatured;
  this.updatedAt = new Date();
};

// Method to update status
thumbnailSchema.methods.updateStatus = function(newStatus) {
  this.status = newStatus;
  this.updatedAt = new Date();
};

// Static method to get thumbnails by category
thumbnailSchema.statics.getByCategory = function(category, options = {}) {
  const query = { category, status: 'active' };
  
  if (options.isPublic !== undefined) query.isPublic = options.isPublic;
  if (options.isFeatured !== undefined) query.isFeatured = options.isFeatured;
  
  return this.find(query)
    .populate('uploadedBy', 'firstName lastName email')
    .sort({ displayOrder: 1, createdAt: -1 });
};

// Static method to get featured thumbnails
thumbnailSchema.statics.getFeatured = function(options = {}) {
  const query = { isFeatured: true, status: 'active' };
  
  if (options.category) query.category = options.category;
  if (options.isPublic !== undefined) query.isPublic = options.isPublic;
  
  return this.find(query)
    .populate('uploadedBy', 'firstName lastName email')
    .sort({ displayOrder: 1, createdAt: -1 });
};

// Static method to get thumbnails with pagination
thumbnailSchema.statics.getPaginated = function(options = {}) {
  const query = {};
  
  if (options.category) query.category = options.category;
  if (options.status) query.status = options.status;
  if (options.isPublic !== undefined) query.isPublic = options.isPublic;
  if (options.isFeatured !== undefined) query.isFeatured = options.isFeatured;
  if (options.tags && options.tags.length > 0) {
    query.tags = { $in: options.tags };
  }
  
  const page = parseInt(options.page) || 1;
  const limit = parseInt(options.limit) || 10;
  const skip = (page - 1) * limit;
  
  return this.find(query)
    .populate('uploadedBy', 'firstName lastName email')
    .sort({ displayOrder: 1, createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to get thumbnail statistics
thumbnailSchema.statics.getStatistics = function(options = {}) {
  const matchStage = {};
  
  if (options.startDate && options.endDate) {
    matchStage.createdAt = {
      $gte: new Date(options.startDate),
      $lte: new Date(options.endDate)
    };
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          category: '$category',
          status: '$status'
        },
        count: { $sum: 1 },
        totalSize: { $sum: '$fileSize' }
      }
    },
    {
      $group: {
        _id: null,
        categoryBreakdown: {
          $push: {
            category: '$_id.category',
            status: '$_id.status',
            count: '$count',
            totalSize: '$totalSize'
          }
        },
        totalThumbnails: { $sum: '$count' },
        totalSize: { $sum: '$totalSize' }
      }
    }
  ]);
};

// Static method to search thumbnails
thumbnailSchema.statics.search = function(searchTerm, options = {}) {
  const query = {
    $or: [
      { title: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } },
      { tags: { $in: [new RegExp(searchTerm, 'i')] } },
      { altText: { $regex: searchTerm, $options: 'i' } }
    ]
  };
  
  if (options.category) query.category = options.category;
  if (options.status) query.status = options.status;
  if (options.isPublic !== undefined) query.isPublic = options.isPublic;
  
  return this.find(query)
    .populate('uploadedBy', 'firstName lastName email')
    .sort({ createdAt: -1 });
};

module.exports = mongoose.model('Thumbnail', thumbnailSchema);
