const express = require('express');
const router = express.Router();
const {
  getPublicThumbnails,
  getFeaturedThumbnails,
  getThumbnailsByCategory,
  getThumbnailDetails,
  getAvailableCategories,
  getPopularTags,
  searchThumbnails
} = require('../controllers/thumbnailController');
const { validateThumbnailId } = require('../middleware/validation');

// Get public thumbnails
router.get('/',
  getPublicThumbnails
);

// Get featured thumbnails
router.get('/featured',
  getFeaturedThumbnails
);

// Get thumbnails by category
router.get('/category/:category',
  getThumbnailsByCategory
);

// Get thumbnail details
router.get('/:thumbnailId',
  validateThumbnailId,
  getThumbnailDetails
);

// Get available categories
router.get('/categories/available',
  getAvailableCategories
);

// Get popular tags
router.get('/tags/popular',
  getPopularTags
);

// Search thumbnails
router.get('/search/query',
  searchThumbnails
);

module.exports = router;
