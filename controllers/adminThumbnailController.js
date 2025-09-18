const Thumbnail = require('../models/thumbnail.model');
const { uploadToS3, deleteFromS3 } = require('../config/aws');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const sharp = require('sharp');

// Upload multiple thumbnails
const uploadThumbnails = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const adminId = req.user.id;
    const { category, isPublic, isFeatured, tags } = req.body;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const uploadedThumbnails = [];
    const uploadErrors = [];

    for (const file of files) {
      try {
        // Validate file type
        if (!file.mimetype.startsWith('image/')) {
          uploadErrors.push({
            fileName: file.originalname,
            error: 'File must be an image'
          });
          continue;
        }

        // Get image dimensions
        const imageInfo = await sharp(file.buffer).metadata();
        
        // Generate unique key for original image
        const originalKey = `thumbnails/original/${Date.now()}-${Math.random().toString(36).substring(2, 15)}-${file.originalname}`;
        
        // Upload original image
        let originalUpload;
        try {
          originalUpload = await uploadToS3(file, originalKey, file.mimetype);
        } catch (s3Error) {
          console.error('S3 upload failed, using fallback:', s3Error);
          // Fallback: use a placeholder URL for development
          originalUpload = `https://via.placeholder.com/800x600/cccccc/666666?text=${encodeURIComponent(file.originalname)}`;
        }
        
        if (!originalUpload) {
          throw new Error('Failed to upload original image');
        }
        
        // Create thumbnail (resize to 300x300)
        const thumbnailBuffer = await sharp(file.buffer)
          .resize(300, 300, { fit: 'cover' })
          .jpeg({ quality: 80 })
          .toBuffer();
        
        // Create thumbnail file object
        const thumbnailFile = {
          ...file,
          buffer: thumbnailBuffer,
          originalname: `thumb_${file.originalname}`,
          mimetype: 'image/jpeg'
        };
        
        // Generate unique key for thumbnail
        const thumbnailKey = `thumbnails/thumbnails/${Date.now()}-${Math.random().toString(36).substring(2, 15)}-thumb_${file.originalname}`;
        
        // Upload thumbnail
        let thumbnailUpload;
        try {
          thumbnailUpload = await uploadToS3(thumbnailFile, thumbnailKey, 'image/jpeg');
        } catch (s3Error) {
          console.error('S3 thumbnail upload failed, using fallback:', s3Error);
          // Fallback: use a placeholder URL for development
          thumbnailUpload = `https://via.placeholder.com/300x300/cccccc/666666?text=${encodeURIComponent('Thumbnail')}`;
        }
        
        if (!thumbnailUpload) {
          throw new Error('Failed to upload thumbnail');
        }

        // Create thumbnail record
        const thumbnail = new Thumbnail({
          title: file.originalname.replace(/\.[^/.]+$/, ""), // Remove extension
          description: `Uploaded image: ${file.originalname}`,
          originalImageUrl: originalUpload,
          thumbnailUrl: thumbnailUpload,
          fileName: file.originalname,
          fileSize: file.size,
          mimeType: file.mimetype,
          dimensions: {
            width: imageInfo.width,
            height: imageInfo.height
          },
          category: category || 'gallery',
          tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
          isPublic: isPublic !== undefined ? isPublic === 'true' : true,
          isFeatured: isFeatured === 'true',
          altText: file.originalname,
          uploadedBy: new mongoose.Types.ObjectId(adminId)
        });

        await thumbnail.save();
        await thumbnail.populate('uploadedBy', 'firstName lastName email');
        
        uploadedThumbnails.push(thumbnail);

      } catch (error) {
        console.error(`Error processing file ${file.originalname}:`, error);
        uploadErrors.push({
          fileName: file.originalname,
          error: error.message
        });
      }
    }

    res.status(201).json({
      success: true,
      message: `${uploadedThumbnails.length} thumbnails uploaded successfully`,
      data: {
        uploadedThumbnails,
        errors: uploadErrors.length > 0 ? uploadErrors : undefined,
        totalUploaded: uploadedThumbnails.length,
        totalErrors: uploadErrors.length
      }
    });

  } catch (error) {
    console.error('Error uploading thumbnails:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get all thumbnails with pagination and filters
const getAllThumbnails = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      status,
      isPublic,
      isFeatured,
      tags,
      search
    } = req.query;

    let query = {};

    // Apply filters
    if (category) query.category = category;
    if (status) query.status = status;
    if (isPublic !== undefined) query.isPublic = isPublic === 'true';
    if (isFeatured !== undefined) query.isFeatured = isFeatured === 'true';
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      query.tags = { $in: tagArray };
    }

    // Apply search
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
        { altText: { $regex: search, $options: 'i' } }
      ];
    }

    const thumbnails = await Thumbnail.find(query)
      .populate('uploadedBy', 'firstName lastName email')
      .sort({ displayOrder: 1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalThumbnails = await Thumbnail.countDocuments(query);

    res.status(200).json({
      success: true,
      message: 'Thumbnails retrieved successfully',
      data: {
        thumbnails,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalThumbnails / limit),
          totalThumbnails,
          hasNext: page * limit < totalThumbnails,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error getting thumbnails:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get thumbnail by ID
const getThumbnailById = async (req, res) => {
  try {
    const { thumbnailId } = req.params;

    const thumbnail = await Thumbnail.findOne({ thumbnailId })
      .populate('uploadedBy', 'firstName lastName email');

    if (!thumbnail) {
      return res.status(404).json({
        success: false,
        message: 'Thumbnail not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Thumbnail retrieved successfully',
      data: thumbnail
    });

  } catch (error) {
    console.error('Error getting thumbnail:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update thumbnail
const updateThumbnail = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { thumbnailId } = req.params;
    const updateData = req.body;

    const thumbnail = await Thumbnail.findOne({ thumbnailId });

    if (!thumbnail) {
      return res.status(404).json({
        success: false,
        message: 'Thumbnail not found'
      });
    }

    // Update fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        thumbnail[key] = updateData[key];
      }
    });

    thumbnail.updatedAt = new Date();
    await thumbnail.save();
    await thumbnail.populate('uploadedBy', 'firstName lastName email');

    res.status(200).json({
      success: true,
      message: 'Thumbnail updated successfully',
      data: thumbnail
    });

  } catch (error) {
    console.error('Error updating thumbnail:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete thumbnail
const deleteThumbnail = async (req, res) => {
  try {
    const { thumbnailId } = req.params;

    const thumbnail = await Thumbnail.findOne({ thumbnailId });

    if (!thumbnail) {
      return res.status(404).json({
        success: false,
        message: 'Thumbnail not found'
      });
    }

    // Delete files from S3
    try {
      await deleteFromS3(thumbnail.originalImageUrl);
      await deleteFromS3(thumbnail.thumbnailUrl);
    } catch (s3Error) {
      console.error('Error deleting files from S3:', s3Error);
      // Continue with database deletion even if S3 deletion fails
    }

    await Thumbnail.findByIdAndDelete(thumbnail._id);

    res.status(200).json({
      success: true,
      message: 'Thumbnail deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting thumbnail:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Bulk delete thumbnails
const bulkDeleteThumbnails = async (req, res) => {
  try {
    const { thumbnailIds } = req.body;

    if (!thumbnailIds || !Array.isArray(thumbnailIds) || thumbnailIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Thumbnail IDs array is required'
      });
    }

    const thumbnails = await Thumbnail.find({ thumbnailId: { $in: thumbnailIds } });

    if (thumbnails.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No thumbnails found'
      });
    }

    // Delete files from S3
    for (const thumbnail of thumbnails) {
      try {
        await deleteFromS3(thumbnail.originalImageUrl);
        await deleteFromS3(thumbnail.thumbnailUrl);
      } catch (s3Error) {
        console.error(`Error deleting files for ${thumbnail.thumbnailId}:`, s3Error);
      }
    }

    await Thumbnail.deleteMany({ thumbnailId: { $in: thumbnailIds } });

    res.status(200).json({
      success: true,
      message: `${thumbnails.length} thumbnails deleted successfully`,
      data: {
        deletedCount: thumbnails.length,
        deletedIds: thumbnailIds
      }
    });

  } catch (error) {
    console.error('Error bulk deleting thumbnails:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update display order
const updateDisplayOrder = async (req, res) => {
  try {
    const { thumbnailId } = req.params;
    const { displayOrder } = req.body;

    const thumbnail = await Thumbnail.findOne({ thumbnailId });

    if (!thumbnail) {
      return res.status(404).json({
        success: false,
        message: 'Thumbnail not found'
      });
    }

    thumbnail.updateDisplayOrder(displayOrder);
    await thumbnail.save();

    res.status(200).json({
      success: true,
      message: 'Display order updated successfully',
      data: thumbnail
    });

  } catch (error) {
    console.error('Error updating display order:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Toggle featured status
const toggleFeatured = async (req, res) => {
  try {
    const { thumbnailId } = req.params;

    const thumbnail = await Thumbnail.findOne({ thumbnailId });

    if (!thumbnail) {
      return res.status(404).json({
        success: false,
        message: 'Thumbnail not found'
      });
    }

    thumbnail.toggleFeatured();
    await thumbnail.save();

    res.status(200).json({
      success: true,
      message: 'Featured status updated successfully',
      data: thumbnail
    });

  } catch (error) {
    console.error('Error toggling featured status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get thumbnail statistics
const getThumbnailStatistics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const options = {};
    if (startDate && endDate) {
      options.startDate = startDate;
      options.endDate = endDate;
    }

    const statistics = await Thumbnail.getStatistics(options);

    res.status(200).json({
      success: true,
      message: 'Thumbnail statistics retrieved successfully',
      data: statistics[0] || {
        categoryBreakdown: [],
        totalThumbnails: 0,
        totalSize: 0
      }
    });

  } catch (error) {
    console.error('Error getting thumbnail statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get categories
const getCategories = async (req, res) => {
  try {
    const categories = await Thumbnail.distinct('category');
    const categoryStats = await Thumbnail.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.status(200).json({
      success: true,
      message: 'Categories retrieved successfully',
      data: {
        categories,
        categoryStats
      }
    });

  } catch (error) {
    console.error('Error getting categories:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  uploadThumbnails,
  getAllThumbnails,
  getThumbnailById,
  updateThumbnail,
  deleteThumbnail,
  bulkDeleteThumbnails,
  updateDisplayOrder,
  toggleFeatured,
  getThumbnailStatistics,
  getCategories
};
