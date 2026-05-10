import express from 'express';
import * as volunteerController from '../controllers/volunteerController.js';
import * as assignmentController from '../controllers/volunteerAssignmentController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validationMiddleware.js';
import { volunteerTaskSchema } from '../validators/volunteerValidator.js';
import { volunteerStatusSchema } from '../validators/volunteerAssignmentValidator.js';

const router = express.Router();

router.use(requireAuth);
router.use(requireRole('VOLUNTEER'));

// ============================================
// VOLUNTEER TASK ROUTES (self-registration / availability profile)
// ============================================

router.post(
  '/task',
  validateRequest(volunteerTaskSchema),
  volunteerController.createVolunteerTask
);

router.get('/task', volunteerController.getVolunteerTasks);

// ============================================
// VOLUNTEER ASSIGNMENTS (work the admin has handed out)
// ============================================

router.get('/assignments', assignmentController.volunteerListAssignments);

router.patch(
  '/assignments/:id/status',
  validateRequest(volunteerStatusSchema),
  assignmentController.volunteerUpdateAssignmentStatus
);

export default router;
