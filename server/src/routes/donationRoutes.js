import express from 'express';
import * as donationController from '../controllers/donationController.js';
import { validateRequest } from '../middleware/validationMiddleware.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';
import { uploadPaymentScreenshot } from '../middleware/uploadMiddleware.js';
import {
  qurbaniDonationSchema,
  rationDonationSchema,
  skinCollectionSchema,
  orphanSponsorshipSchema,
} from '../validators/donationValidator.js';

const router = express.Router();

// All donation routes require authentication
router.use(requireAuth);

// Qurbani Donation — multipart so an optional payment screenshot can ride along
router.post(
  '/qurbani',
  requireRole('DONOR'),
  uploadPaymentScreenshot.single('paymentScreenshot'),
  validateRequest(qurbaniDonationSchema),
  donationController.createQurbaniDonation
);
router.get('/qurbani', requireRole('DONOR'), donationController.getQurbaniDonations);

// Ration Donation — multipart with optional payment screenshot
router.post(
  '/ration',
  requireRole('DONOR'),
  uploadPaymentScreenshot.single('paymentScreenshot'),
  validateRequest(rationDonationSchema),
  donationController.createRationDonation
);
router.get('/ration', requireRole('DONOR'), donationController.getRationDonations);

// Skin Collection — NO payment, donor donates the physical skin (we collect it for free).
router.post(
  '/skin-collection',
  requireRole('DONOR'),
  validateRequest(skinCollectionSchema),
  donationController.createSkinCollection
);
router.get('/skin-collection', requireRole('DONOR'), donationController.getSkinCollections);

// Orphan Sponsorship — multipart with optional payment screenshot
router.post(
  '/orphan-sponsorship',
  requireRole('DONOR'),
  uploadPaymentScreenshot.single('paymentScreenshot'),
  validateRequest(orphanSponsorshipSchema),
  donationController.createOrphanSponsorship
);
router.get('/orphan-sponsorship', requireRole('DONOR'), donationController.getOrphanSponsorships);

export default router;
