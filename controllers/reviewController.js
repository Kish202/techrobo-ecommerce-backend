import Review from '../models/Review.js';
import Product from '../models/products.js';

// @desc    Get all reviews
// @route   GET /api/reviews
// @access  Public
export const getReviews = async (req, res, next) => {
  try {
    const { product, status, page = 1, limit = 10, sort = '-createdAt' } = req.query;

    const filter = {};
    if (product) filter.product = product;
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const reviews = await Review.find(filter)
      .populate('product', 'name slug thumbnail')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await Review.countDocuments(filter);

    res.json({
      success: true,
      data: reviews,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviews for specific product
// @route   GET /api/reviews/product/:productId
// @access  Public
export const getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { status = 'approved', page = 1, limit = 10 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const reviews = await Review.find({ product: productId, status })
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await Review.countDocuments({ product: productId, status });

    res.json({
      success: true,
      data: reviews,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create review
// @route   POST /api/reviews
// @access  Public
export const createReview = async (req, res, next) => {
  try {
    const { product, name, email, rating, comment } = req.body;

    // Check if product exists
    const productExists = await Product.findById(product);
    if (!productExists) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({ product, email });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product'
      });
    }

    const review = await Review.create({
      product,
      name,
      email,
      rating,
      comment,
      status: 'pending' // Reviews need approval
    });

    res.status(201).json({
      success: true,
      data: review,
      message: 'Review submitted successfully. It will be visible after approval.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve review
// @route   PUT /api/reviews/:id/approve
// @access  Public (should be Admin only in production)
export const approveReview = async (req, res, next) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    review.status = 'approved';
    await review.save();

    res.json({
      success: true,
      data: review,
      message: 'Review approved successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject review
// @route   PUT /api/reviews/:id/reject
// @access  Public (should be Admin only in production)
export const rejectReview = async (req, res, next) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    review.status = 'rejected';
    await review.save();

    res.json({
      success: true,
      data: review,
      message: 'Review rejected'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Public (should be Admin only in production)
export const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    await review.deleteOne();

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark review as helpful
// @route   PUT /api/reviews/:id/helpful
// @access  Public
export const markHelpful = async (req, res, next) => {
  try {
    const { id } = req.params;

    const review = await Review.findByIdAndUpdate(
      id,
      { $inc: { helpful: 1 } },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.json({
      success: true,
      data: review,
      message: 'Marked as helpful'
    });
  } catch (error) {
    next(error);
  }
};