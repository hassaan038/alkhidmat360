import express from 'express';
import * as applicationController from '../controllers/applicationController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validationMiddleware.js';
import {
  loanApplicationSchema,
  ramadanRationSchema,
  orphanRegistrationSchema,
} from '../validators/applicationValidator.js';

const router = express.Router();

// ============================================
// LOAN APPLICATION ROUTES
// ============================================

router.post(
  '/loan',
  requireAuth,
  requireRole('BENEFICIARY'),
  validateRequest(loanApplicationSchema),
  applicationController.createLoanApplication
);

router.get(
  '/loan',
  requireAuth,
  requireRole('BENEFICIARY'),
  applicationController.getLoanApplications
);

// ============================================
// RAMADAN RATION ROUTES
// ============================================

router.post(
  '/ramadan-ration',
  requireAuth,
  requireRole('BENEFICIARY'),
  validateRequest(ramadanRationSchema),
  applicationController.createRamadanRationApplication
);

router.get(
  '/ramadan-ration',
  requireAuth,
  requireRole('BENEFICIARY'),
  applicationController.getRamadanRationApplications
);

// ============================================
// ORPHAN REGISTRATION ROUTES
// ============================================

router.post(
  '/orphan',
  requireAuth,
  requireRole('BENEFICIARY'),
  validateRequest(orphanRegistrationSchema),
  applicationController.createOrphanRegistration
);

router.get(
  '/orphan',
  requireAuth,
  requireRole('BENEFICIARY'),
  applicationController.getOrphanRegistrations
);

export default router;
