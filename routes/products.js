import express from 'express';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts
} from '../controllers/productController.js';
import { uploadMultiple, handleMulterError } from '../middlewares/upload.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/:id', getProduct);

// Protected routes (Admin only)
router.post('/', protect, uploadMultiple, handleMulterError, createProduct);
router.put('/:id', protect, uploadMultiple, handleMulterError, updateProduct);
router.delete('/:id', protect, deleteProduct);

export default router;