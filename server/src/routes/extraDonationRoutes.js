import express from 'express';
import * as extraDonationController from '../controllers/extraDonationController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validationMiddleware.js';
import { uploadPaymentScreenshot } from '../middleware/uploadMiddleware.js';
import {
  createSadqaSchema,
  createDisasterDonationSchema,
} from '../validators/extraDonationValidator.js';

const sadqaRouter = express.Router();
sadqaRouter.use(requireAuth, requireRole('DONOR'));

sadqaRouter.post(
  '/',
  uploadPaymentScreenshot.single('paymentScreenshot'),
  validateRequest(createSadqaSchema),
  extraDonationController.createSadqa
);
sadqaRouter.get('/me', extraDonationController.getMySadqas);

const disasterRouter = express.Router();
disasterRouter.use(requireAuth, requireRole('DONOR'));

disasterRouter.post(
  '/',
  uploadPaymentScreenshot.single('paymentScreenshot'),
  validateRequest(createDisasterDonationSchema),
  extraDonationController.createDisasterDonation
);
disasterRouter.get('/me', extraDonationController.getMyDisasterDonations);

export { sadqaRouter, disasterRouter };
