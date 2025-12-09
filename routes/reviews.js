import express from 'express';
import {
  getReviews,
  getProductReviews,
  createReview,
  approveReview,
  rejectReview,
  deleteReview,
  markHelpful
} from '../controllers/reviewController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

// Public routes
router.get('/', getReviews);
router.get('/product/:productId', getProductReviews);
router.post('/', createReview);
router.put('/:id/helpful', markHelpful);

// Protected routes (Admin only)
router.put('/:id/approve', protect, approveReview);
router.put('/:id/reject', protect, rejectReview);
router.delete('/:id', protect, deleteReview);

export default router;