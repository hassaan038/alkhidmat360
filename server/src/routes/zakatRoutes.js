import express from 'express';
import * as zakatController from '../controllers/zakatController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validationMiddleware.js';
import {
  uploadPaymentScreenshot,
  uploadZakatDoc,
} from '../middleware/uploadMiddleware.js';
import {
  createZakatPaymentSchema,
  createZakatApplicationSchema,
} from '../validators/zakatValidator.js';

const router = express.Router();

router.use(requireAuth);

// Donor — pay zakat
router.post(
  '/payments',
  requireRole('DONOR'),
  uploadPaymentScreenshot.single('paymentScreenshot'),
  validateRequest(createZakatPaymentSchema),
  zakatController.createPayment
);
router.get('/payments/me', requireRole('DONOR'), zakatController.getMyPayments);

// Beneficiary — apply for zakat
router.post(
  '/applications',
  requireRole('BENEFICIARY'),
  uploadZakatDoc.single('cnicDocument'),
  validateRequest(createZakatApplicationSchema),
  zakatController.createApplication
);
router.get(
  '/applications/me',
  requireRole('BENEFICIARY'),
  zakatController.getMyApplications
);

export default router;
