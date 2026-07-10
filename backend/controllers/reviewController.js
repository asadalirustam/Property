const Review = require('../models/Review');
const Property = require('../models/Property');

// @desc    Add a review rating
// @route   POST /api/reviews
// @access  Private (Customer)
exports.createReview = async (req, res) => {
  try {
    const { propertyId, rating, comment } = req.body;

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property listing not found' });
    }

    const review = await Review.create({
      property: propertyId,
      user: req.user.id,
      rating: Number(rating),
      comment,
    });

    const populatedReview = await Review.findById(review._id).populate('user', 'name avatar role');

    res.status(201).json({
      success: true,
      message: 'Review posted successfully!',
      review: populatedReview,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this property listing' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all reviews for a property
// @route   GET /api/reviews/property/:propertyId
// @access  Public
exports.getPropertyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ property: req.params.propertyId })
      .populate('user', 'name avatar role')
      .populate('replies.user', 'name avatar role')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reply to review
// @route   POST /api/reviews/:id/reply
// @access  Private (Agent/Admin)
exports.replyToReview = async (req, res) => {
  try {
    const { text } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    review.replies.push({
      user: req.user.id,
      text,
    });

    await review.save();
    
    const updatedReview = await Review.findById(req.params.id)
      .populate('user', 'name avatar role')
      .populate('replies.user', 'name avatar role');

    res.status(200).json({
      success: true,
      message: 'Reply added successfully!',
      review: updatedReview,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Like/Unlike review
// @route   POST /api/reviews/:id/like
// @access  Private
exports.toggleLikeReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    const index = review.likes.indexOf(req.user.id);
    if (index === -1) {
      review.likes.push(req.user.id);
    } else {
      review.likes.splice(index, 1);
    }

    await review.save();
    res.status(200).json({ success: true, likes: review.likes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Report abuse on review
// @route   POST /api/reviews/:id/report
// @access  Private
exports.reportReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (!review.reports.includes(req.user.id)) {
      review.reports.push(req.user.id);
      await review.save();
    }

    res.status(200).json({ success: true, message: 'Review has been reported to administration.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
