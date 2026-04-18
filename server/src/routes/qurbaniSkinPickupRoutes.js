import express from 'express';
import * as qurbaniSkinPickupController from '../controllers/qurbaniSkinPickupController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validationMiddleware.js';
import { requireQurbaniModuleActive } from '../middleware/qurbaniModuleMiddleware.js';
import { createSkinPickupSchema } from '../validators/qurbaniSkinPickupValidator.js';

const router = express.Router();

router.use(requireAuth);
router.use(requireQurbaniModuleActive);

router.post(
  '/',
  validateRequest(createSkinPickupSchema),
  qurbaniSkinPickupController.createPickup
);
router.get('/me', qurbaniSkinPickupController.getMyPickups);

export default router;
