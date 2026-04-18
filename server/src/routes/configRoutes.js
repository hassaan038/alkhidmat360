import express from 'express';
import * as systemConfigController from '../controllers/systemConfigController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validationMiddleware.js';
import {
  moduleToggleSchema,
  bankDetailsSchema,
} from '../validators/qurbaniModuleValidator.js';

const router = express.Router();

router.use(requireAuth);

// Qurbani module toggle
router.get('/qurbani-module', systemConfigController.getQurbaniModuleFlag);
router.patch(
  '/qurbani-module',
  requireRole('ADMIN'),
  validateRequest(moduleToggleSchema),
  systemConfigController.updateQurbaniModuleFlag
);

// Bank details
router.get('/bank-details', systemConfigController.getBankDetails);
router.patch(
  '/bank-details',
  requireRole('ADMIN'),
  validateRequest(bankDetailsSchema),
  systemConfigController.updateBankDetails
);

export default router;
