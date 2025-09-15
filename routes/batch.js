const express = require('express');
const router = express.Router();
const {
  createBatch,
  getAllBatches,
  getBatchById,
  updateBatch,
  deleteBatch,
  getBatchesByCourse,
  getBatchStatistics
} = require('../controllers/batchController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

// All routes require authentication and admin authorization
router.use(authenticate);
router.use(authorizeAdmin);

// Batch CRUD operations
router.post('/create', createBatch);

router.get('/', getAllBatches);
router.get('/statistics', getBatchStatistics);
router.get('/course/:courseId', getBatchesByCourse);
router.get('/:id', getBatchById);

router.put('/:id', updateBatch);
router.delete('/:id', deleteBatch);

module.exports = router;
