import express from 'express';
import {
  getMessages,
  getMessage,
  createMessage,
  markAsRead,
  markAsReplied,
  archiveMessage,
  deleteMessage,
  updatePriority
} from '../controllers/messageController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

// Public routes
router.post('/', createMessage);

// Protected routes (Admin only)
router.get('/', protect, getMessages);
router.get('/:id', protect, getMessage);
router.put('/:id/read', protect, markAsRead);
router.put('/:id/reply', protect, markAsReplied);
router.put('/:id/archive', protect, archiveMessage);
router.put('/:id/priority', protect, updatePriority);
router.delete('/:id', protect, deleteMessage);

export default router;