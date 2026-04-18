import express from 'express';
import * as userController from '../controllers/userController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// Get dashboard statistics
router.get('/dashboard/stats', userController.getDashboardStats);

// Get recent activities
router.get('/dashboard/activities', userController.getRecentActivities);

export default router;
