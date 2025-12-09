import express from 'express';
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/CategoryController.js';
import { uploadSingle, handleMulterError } from '../middlewares/upload.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

// Public routes
router.get('/', getCategories);
router.get('/:id', getCategory);

// Protected routes (Admin only)
router.post('/', protect, uploadSingle, handleMulterError, createCategory);
router.put('/:id', protect, uploadSingle, handleMulterError, updateCategory);
router.delete('/:id', protect, deleteCategory);

export default router;