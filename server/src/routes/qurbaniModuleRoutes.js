import express from 'express';
import * as qurbaniModuleController from '../controllers/qurbaniModuleController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireQurbaniModuleActive } from '../middleware/qurbaniModuleMiddleware.js';
import { validateRequest } from '../middleware/validationMiddleware.js';
import { uploadPaymentScreenshot } from '../middleware/uploadMiddleware.js';
import { createBookingSchema } from '../validators/qurbaniModuleValidator.js';

const router = express.Router();

// All qurbani-module user routes require auth + an active module
router.use(requireAuth);
router.use(requireQurbaniModuleActive);

// Listings
router.get('/listings', qurbaniModuleController.getActiveListings);
router.get('/listings/:id', qurbaniModuleController.getListingDetail);

// Bookings — multipart so users can optionally attach a payment screenshot.
// Multer parses the body BEFORE validateRequest so the Zod schema sees the
// text fields (already coerced to numbers by the schema).
router.post(
  '/bookings',
  uploadPaymentScreenshot.single('paymentScreenshot'),
  validateRequest(createBookingSchema),
  qurbaniModuleController.createBooking
);
router.post(
  '/bookings/:id/mark-paid',
  uploadPaymentScreenshot.single('paymentScreenshot'),
  qurbaniModuleController.markBookingPaid
);
router.get('/bookings/me', qurbaniModuleController.getMyBookings);

export default router;
