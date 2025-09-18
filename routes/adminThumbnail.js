const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { uploadMultiple } = require('../middleware/fileUpload');
const {
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
} = require('../controllers/adminThumbnailController');
const {
  validateThumbnailUpload,
  validateThumbnailUpdate,
  validateThumbnailId,
  validateDisplayOrder,
  validateBulkDelete
} = require('../middleware/validation');

// Upload multiple thumbnails
router.post('/upload',
  auth.authenticate,
  auth.authorize('admin'),
  uploadMultiple('images', 10), // Allow up to 10 images
  validateThumbnailUpload,
  uploadThumbnails
);

// Get all thumbnails with pagination and filters
router.get('/',
  auth.authenticate,
  auth.authorize('admin'),
  getAllThumbnails
);

// Get thumbnail by ID
router.get('/:thumbnailId',
  auth.authenticate,
  auth.authorize('admin'),
  validateThumbnailId,
  getThumbnailById
);

// Update thumbnail
router.put('/:thumbnailId',
  auth.authenticate,
  auth.authorize('admin'),
  validateThumbnailId,
  validateThumbnailUpdate,
  updateThumbnail
);

// Delete thumbnail
router.delete('/:thumbnailId',
  auth.authenticate,
  auth.authorize('admin'),
  validateThumbnailId,
  deleteThumbnail
);

// Bulk delete thumbnails
router.delete('/bulk/delete',
  auth.authenticate,
  auth.authorize('admin'),
  validateBulkDelete,
  bulkDeleteThumbnails
);

// Update display order
router.patch('/:thumbnailId/display-order',
  auth.authenticate,
  auth.authorize('admin'),
  validateThumbnailId,
  validateDisplayOrder,
  updateDisplayOrder
);

// Toggle featured status
router.patch('/:thumbnailId/featured',
  auth.authenticate,
  auth.authorize('admin'),
  validateThumbnailId,
  toggleFeatured
);

// Get thumbnail statistics
router.get('/statistics/overview',
  auth.authenticate,
  auth.authorize('admin'),
  getThumbnailStatistics
);

// Get categories
router.get('/categories/list',
  auth.authenticate,
  auth.authorize('admin'),
  getCategories
);

module.exports = router;
