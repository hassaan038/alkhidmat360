import express from 'express';
import * as qurbaniModuleController from '../controllers/qurbaniModuleController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireQurbaniModuleActive } from '../middleware/qurbaniModuleMiddleware.js';
import { validateRequest } from '../middleware/validationMiddleware.js';
import { createBookingSchema } from '../validators/qurbaniModuleValidator.js';

const router = express.Router();

// All qurbani-module user routes require auth + an active module
router.use(requireAuth);
router.use(requireQurbaniModuleActive);

// Listings
router.get('/listings', qurbaniModuleController.getActiveListings);
router.get('/listings/:id', qurbaniModuleController.getListingDetail);

// Bookings
router.post(
  '/bookings',
  validateRequest(createBookingSchema),
  qurbaniModuleController.createBooking
);
router.post('/bookings/:id/mark-paid', qurbaniModuleController.markBookingPaid);
router.get('/bookings/me', qurbaniModuleController.getMyBookings);

export default router;
