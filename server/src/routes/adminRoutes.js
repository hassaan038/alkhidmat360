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
import * as qurbaniSkinPickupController from '../controllers/qurbaniSkinPickupController.js';
import { skinPickupStatusUpdateSchema } from '../validators/qurbaniSkinPickupValidator.js';
import * as fitranaController from '../controllers/fitranaController.js';
import { fitranaStatusUpdateSchema } from '../validators/fitranaValidator.js';
import * as zakatController from '../controllers/zakatController.js';
import {
  zakatPaymentStatusSchema,
  zakatApplicationStatusSchema,
} from '../validators/zakatValidator.js';
import * as extraDonationController from '../controllers/extraDonationController.js';
import {
  sadqaStatusSchema,
  disasterDonationStatusSchema,
} from '../validators/extraDonationValidator.js';

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

// ============================================
// QURBANI MODULE — SKIN PICKUPS
// ============================================

router.get('/qurbani-skin-pickups', qurbaniSkinPickupController.adminListPickups);

router.patch(
  '/qurbani-skin-pickups/:id/status',
  validateRequest(skinPickupStatusUpdateSchema),
  qurbaniSkinPickupController.adminUpdatePickupStatus
);

// ============================================
// FITRANA
// ============================================

router.get('/fitrana', fitranaController.adminListFitranas);

router.patch(
  '/fitrana/:id/status',
  validateRequest(fitranaStatusUpdateSchema),
  fitranaController.adminUpdateFitranaStatus
);

// ============================================
// ZAKAT — PAYMENTS (donor) + APPLICATIONS (beneficiary)
// ============================================

router.get('/zakat/payments', zakatController.adminListPayments);
router.patch(
  '/zakat/payments/:id/status',
  validateRequest(zakatPaymentStatusSchema),
  zakatController.adminUpdatePaymentStatus
);

router.get('/zakat/applications', zakatController.adminListApplications);
router.patch(
  '/zakat/applications/:id/status',
  validateRequest(zakatApplicationStatusSchema),
  zakatController.adminUpdateApplicationStatus
);

// ============================================
// SADQA + DISASTER DONATIONS
// ============================================

router.get('/sadqa', extraDonationController.adminListSadqas);
router.patch(
  '/sadqa/:id/status',
  validateRequest(sadqaStatusSchema),
  extraDonationController.adminUpdateSadqaStatus
);

router.get('/disaster-donations', extraDonationController.adminListDisasterDonations);
router.patch(
  '/disaster-donations/:id/status',
  validateRequest(disasterDonationStatusSchema),
  extraDonationController.adminUpdateDisasterDonationStatus
);

export default router;
