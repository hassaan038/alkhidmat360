import express from 'express';
import * as donationController from '../controllers/donationController.js';
import { validateRequest } from '../middleware/validationMiddleware.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';
import {
  qurbaniDonationSchema,
  rationDonationSchema,
  skinCollectionSchema,
  orphanSponsorshipSchema,
} from '../validators/donationValidator.js';

const router = express.Router();

// All donation routes require authentication
router.use(requireAuth);

// Qurbani Donation Routes
router.post(
  '/qurbani',
  requireRole('DONOR'),
  validateRequest(qurbaniDonationSchema),
  donationController.createQurbaniDonation
);
router.get('/qurbani', requireRole('DONOR'), donationController.getQurbaniDonations);

// Ration Donation Routes
router.post(
  '/ration',
  requireRole('DONOR'),
  validateRequest(rationDonationSchema),
  donationController.createRationDonation
);
router.get('/ration', requireRole('DONOR'), donationController.getRationDonations);

// Skin Collection Routes
router.post(
  '/skin-collection',
  requireRole('DONOR'),
  validateRequest(skinCollectionSchema),
  donationController.createSkinCollection
);
router.get('/skin-collection', requireRole('DONOR'), donationController.getSkinCollections);

// Orphan Sponsorship Routes
router.post(
  '/orphan-sponsorship',
  requireRole('DONOR'),
  validateRequest(orphanSponsorshipSchema),
  donationController.createOrphanSponsorship
);
router.get('/orphan-sponsorship', requireRole('DONOR'), donationController.getOrphanSponsorships);

export default router;
