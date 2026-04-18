import express from 'express';
import * as qurbaniSkinPickupController from '../controllers/qurbaniSkinPickupController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validationMiddleware.js';
import { requireQurbaniModuleActive } from '../middleware/qurbaniModuleMiddleware.js';
import { uploadSkinPickupPhoto } from '../middleware/uploadMiddleware.js';
import { createSkinPickupSchema } from '../validators/qurbaniSkinPickupValidator.js';

const router = express.Router();

router.use(requireAuth);
router.use(requireQurbaniModuleActive);

// Multipart so users can optionally attach a house photo. Multer parses
// the body BEFORE validateRequest so the Zod schema sees text fields.
router.post(
  '/',
  uploadSkinPickupPhoto.single('housePhoto'),
  validateRequest(createSkinPickupSchema),
  qurbaniSkinPickupController.createPickup
);
router.get('/me', qurbaniSkinPickupController.getMyPickups);

export default router;
