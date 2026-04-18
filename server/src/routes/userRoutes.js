import express from 'express';
import * as userController from '../controllers/userController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validationMiddleware.js';
import {
  updateProfileSchema,
  changePasswordSchema,
  deleteAccountSchema,
} from '../validators/userValidator.js';

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// Get dashboard statistics
router.get('/dashboard/stats', userController.getDashboardStats);

// Get recent activities
router.get('/dashboard/activities', userController.getRecentActivities);

// ============================================
// PROFILE / SETTINGS
// ============================================

router.get('/me/profile', userController.getMyProfile);
router.patch(
  '/me/profile',
  validateRequest(updateProfileSchema),
  userController.updateMyProfile
);
router.post(
  '/me/change-password',
  validateRequest(changePasswordSchema),
  userController.changeMyPassword
);
router.delete(
  '/me',
  validateRequest(deleteAccountSchema),
  userController.deleteMyAccount
);

export default router;
