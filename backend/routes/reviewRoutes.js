const express = require('express');
const router = express.Router();
const {
  createReview,
  getPropertyReviews,
  replyToReview,
  toggleLikeReview,
  reportReview,
} = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/property/:propertyId', getPropertyReviews);

router.post('/', protect, createReview);
router.post('/:id/reply', protect, authorize('agent', 'admin'), replyToReview);
router.post('/:id/like', protect, toggleLikeReview);
router.post('/:id/report', protect, reportReview);

module.exports = router;
