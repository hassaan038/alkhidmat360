import express from 'express';
import * as volunteerController from '../controllers/volunteerController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validationMiddleware.js';
import { volunteerTaskSchema } from '../validators/volunteerValidator.js';

const router = express.Router();

// ============================================
// VOLUNTEER TASK ROUTES
// ============================================

router.post(
  '/task',
  requireAuth,
  requireRole('VOLUNTEER'),
  validateRequest(volunteerTaskSchema),
  volunteerController.createVolunteerTask
);

router.get(
  '/task',
  requireAuth,
  requireRole('VOLUNTEER'),
  volunteerController.getVolunteerTasks
);

export default router;
