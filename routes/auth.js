import express from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  getAllAdmins,
  deactivateAdmin,
  activateAdmin
} from '../controllers/authControllers.js';
import { protect, superAdminOnly } from '../middlewares/auth.js';

const router = express.Router();

// Public routes
router.post('/register', register);  // Should be protected in production
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

// Superadmin only routes
router.get('/admins', protect, superAdminOnly, getAllAdmins);
router.put('/admins/:id/deactivate', protect, superAdminOnly, deactivateAdmin);
router.put('/admins/:id/activate', protect, superAdminOnly, activateAdmin);

export default router;