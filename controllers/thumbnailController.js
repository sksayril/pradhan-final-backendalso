const Thumbnail = require('../models/thumbnail.model');

// Get public thumbnails
const getPublicThumbnails = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      isFeatured,
      tags,
      search
    } = req.query;

    let query = {
      isPublic: true,
      status: 'active'
    };

    // Apply filters
    if (category) query.category = category;
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
      .select('thumbnailId title description thumbnailUrl originalImageUrl category tags isFeatured displayOrder createdAt')
      .sort({ displayOrder: 1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalThumbnails = await Thumbnail.countDocuments(query);

    res.status(200).json({
      success: true,
      message: 'Public thumbnails retrieved successfully',
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
    console.error('Error getting public thumbnails:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get featured thumbnails
const getFeaturedThumbnails = async (req, res) => {
  try {
    const { category, limit = 6 } = req.query;

    let query = {
      isPublic: true,
      status: 'active',
      isFeatured: true
    };

    if (category) query.category = category;

    const thumbnails = await Thumbnail.find(query)
      .select('thumbnailId title description thumbnailUrl originalImageUrl category tags displayOrder createdAt')
      .sort({ displayOrder: 1, createdAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      message: 'Featured thumbnails retrieved successfully',
      data: thumbnails
    });

  } catch (error) {
    console.error('Error getting featured thumbnails:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get thumbnails by category
const getThumbnailsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 12, isFeatured } = req.query;

    let query = {
      category,
      isPublic: true,
      status: 'active'
    };

    if (isFeatured !== undefined) query.isFeatured = isFeatured === 'true';

    const thumbnails = await Thumbnail.find(query)
      .select('thumbnailId title description thumbnailUrl originalImageUrl category tags isFeatured displayOrder createdAt')
      .sort({ displayOrder: 1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalThumbnails = await Thumbnail.countDocuments(query);

    res.status(200).json({
      success: true,
      message: `Thumbnails for category '${category}' retrieved successfully`,
      data: {
        category,
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
    console.error('Error getting thumbnails by category:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get thumbnail details
const getThumbnailDetails = async (req, res) => {
  try {
    const { thumbnailId } = req.params;

    const thumbnail = await Thumbnail.findOne({
      thumbnailId,
      isPublic: true,
      status: 'active'
    }).select('-uploadedBy -__v');

    if (!thumbnail) {
      return res.status(404).json({
        success: false,
        message: 'Thumbnail not found or not accessible'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Thumbnail details retrieved successfully',
      data: thumbnail
    });

  } catch (error) {
    console.error('Error getting thumbnail details:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get available categories
const getAvailableCategories = async (req, res) => {
  try {
    const categories = await Thumbnail.aggregate([
      {
        $match: {
          isPublic: true,
          status: 'active'
        }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          featuredCount: {
            $sum: { $cond: [{ $eq: ['$isFeatured', true] }, 1, 0] }
          }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.status(200).json({
      success: true,
      message: 'Available categories retrieved successfully',
      data: categories
    });

  } catch (error) {
    console.error('Error getting available categories:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get popular tags
const getPopularTags = async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const tags = await Thumbnail.aggregate([
      {
        $match: {
          isPublic: true,
          status: 'active',
          tags: { $exists: true, $ne: [] }
        }
      },
      { $unwind: '$tags' },
      {
        $group: {
          _id: '$tags',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: parseInt(limit) }
    ]);

    res.status(200).json({
      success: true,
      message: 'Popular tags retrieved successfully',
      data: tags
    });

  } catch (error) {
    console.error('Error getting popular tags:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Search thumbnails
const searchThumbnails = async (req, res) => {
  try {
    const { q, page = 1, limit = 12, category } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const searchResults = await Thumbnail.search(q, {
      category,
      isPublic: true,
      status: 'active'
    })
      .select('thumbnailId title description thumbnailUrl originalImageUrl category tags isFeatured displayOrder createdAt')
      .sort({ displayOrder: 1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalResults = await Thumbnail.countDocuments({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } },
        { altText: { $regex: q, $options: 'i' } }
      ],
      isPublic: true,
      status: 'active'
    });

    res.status(200).json({
      success: true,
      message: 'Search results retrieved successfully',
      data: {
        query: q,
        results: searchResults,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalResults / limit),
          totalResults,
          hasNext: page * limit < totalResults,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error searching thumbnails:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  getPublicThumbnails,
  getFeaturedThumbnails,
  getThumbnailsByCategory,
  getThumbnailDetails,
  getAvailableCategories,
  getPopularTags,
  searchThumbnails
};
