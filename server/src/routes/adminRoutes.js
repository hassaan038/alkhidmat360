import express from 'express';
import * as adminController from '../controllers/adminController.js';
import * as qurbaniModuleController from '../controllers/qurbaniModuleController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validationMiddleware.js';
import { uploadQurbaniPhoto } from '../middleware/uploadMiddleware.js';
import { statusUpdateSchema, createAdminSchema } from '../validators/adminValidator.js';
import {
  createListingSchema,
  updateListingSchema,
  listingStatusUpdateSchema,
  bookingStatusUpdateSchema,
} from '../validators/qurbaniModuleValidator.js';

const router = express.Router();

// All admin routes require authentication and ADMIN role
router.use(requireAuth);
router.use(requireRole('ADMIN'));

// ============================================
// DASHBOARD STATISTICS
// ============================================

router.get('/stats', adminController.getDashboardStats);

// ============================================
// DONATION MANAGEMENT ROUTES
// ============================================

// Get all donations
router.get('/donations/qurbani', adminController.getQurbaniDonations);
router.get('/donations/ration', adminController.getRationDonations);
router.get('/donations/skin-collection', adminController.getSkinCollections);
router.get('/donations/orphan-sponsorship', adminController.getOrphanSponsorships);

// Update donation status
router.patch(
  '/donations/qurbani/:id/status',
  validateRequest(statusUpdateSchema),
  adminController.updateQurbaniDonationStatus
);
router.patch(
  '/donations/ration/:id/status',
  validateRequest(statusUpdateSchema),
  adminController.updateRationDonationStatus
);
router.patch(
  '/donations/skin-collection/:id/status',
  validateRequest(statusUpdateSchema),
  adminController.updateSkinCollectionStatus
);
router.patch(
  '/donations/orphan-sponsorship/:id/status',
  validateRequest(statusUpdateSchema),
  adminController.updateOrphanSponsorshipStatus
);

// ============================================
// APPLICATION MANAGEMENT ROUTES
// ============================================

// Get all applications
router.get('/applications/loan', adminController.getLoanApplications);
router.get('/applications/ramadan-ration', adminController.getRamadanRationApplications);
router.get('/applications/orphan', adminController.getOrphanRegistrations);

// Update application status
router.patch(
  '/applications/loan/:id/status',
  validateRequest(statusUpdateSchema),
  adminController.updateLoanApplicationStatus
);
router.patch(
  '/applications/ramadan-ration/:id/status',
  validateRequest(statusUpdateSchema),
  adminController.updateRamadanRationApplicationStatus
);
router.patch(
  '/applications/orphan/:id/status',
  validateRequest(statusUpdateSchema),
  adminController.updateOrphanRegistrationStatus
);

// ============================================
// VOLUNTEER MANAGEMENT ROUTES
// ============================================

// Get all volunteer tasks
router.get('/volunteers/tasks', adminController.getVolunteerTasks);

// Get all volunteers (users with VOLUNTEER role)
router.get('/volunteers', adminController.getVolunteers);

// Update volunteer task status
router.patch(
  '/volunteers/tasks/:id/status',
  validateRequest(statusUpdateSchema),
  adminController.updateVolunteerTaskStatus
);

// ============================================
// USER MANAGEMENT ROUTES
// ============================================

router.get('/users', adminController.getUsers);

// ============================================
// ADMIN USER MANAGEMENT ROUTES
// ============================================

// Create new admin user
router.post(
  '/create-admin',
  validateRequest(createAdminSchema),
  adminController.createAdmin
);

// ============================================
// QURBANI MODULE — LISTINGS
// ============================================

router.get('/qurbani-listings', qurbaniModuleController.adminListListings);

router.post(
  '/qurbani-listings',
  uploadQurbaniPhoto.single('photo'),
  validateRequest(createListingSchema),
  qurbaniModuleController.adminCreateListing
);

router.patch(
  '/qurbani-listings/:id',
  uploadQurbaniPhoto.single('photo'),
  validateRequest(updateListingSchema),
  qurbaniModuleController.adminUpdateListing
);

router.delete(
  '/qurbani-listings/:id',
  qurbaniModuleController.adminDeleteListing
);

router.patch(
  '/qurbani-listings/:id/status',
  validateRequest(listingStatusUpdateSchema),
  qurbaniModuleController.adminUpdateListingStatus
);

// ============================================
// QURBANI MODULE — BOOKINGS
// ============================================

router.get('/qurbani-bookings', qurbaniModuleController.adminListBookings);

router.patch(
  '/qurbani-bookings/:id/status',
  validateRequest(bookingStatusUpdateSchema),
  qurbaniModuleController.adminUpdateBookingStatus
);

export default router;
