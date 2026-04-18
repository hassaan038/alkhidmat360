import express from 'express';
import * as fitranaController from '../controllers/fitranaController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validationMiddleware.js';
import { requireQurbaniModuleActive } from '../middleware/qurbaniModuleMiddleware.js';
import { uploadPaymentScreenshot } from '../middleware/uploadMiddleware.js';
import { createFitranaSchema } from '../validators/fitranaValidator.js';

const router = express.Router();

router.use(requireAuth);
router.use(requireQurbaniModuleActive);

// Multipart so users can optionally attach a payment screenshot.
router.post(
  '/',
  uploadPaymentScreenshot.single('paymentScreenshot'),
  validateRequest(createFitranaSchema),
  fitranaController.createFitrana
);
router.get('/me', fitranaController.getMyFitranas);

export default router;
