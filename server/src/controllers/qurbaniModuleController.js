import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse, ApiError } from '../utils/ApiResponse.js';
import * as qurbaniModuleService from '../services/qurbaniModuleService.js';

// ============================================
// USER: LISTINGS
// ============================================

export const getActiveListings = asyncHandler(async (req, res) => {
  const listings = await qurbaniModuleService.listActiveListings();
  res.json(
    new ApiResponse(200, { listings }, 'Active qurbani listings fetched successfully')
  );
});

export const getListingDetail = asyncHandler(async (req, res) => {
  const listing = await qurbaniModuleService.getListingById(req.params.id);
  res.json(
    new ApiResponse(200, { listing }, 'Qurbani listing fetched successfully')
  );
});

// ============================================
// USER: BOOKINGS
// ============================================

export const createBooking = asyncHandler(async (req, res) => {
  const userId = req.session.userId;
  const booking = await qurbaniModuleService.createBooking(userId, req.body);

  res.status(201).json(
    new ApiResponse(201, { booking }, 'Qurbani hissa booking created successfully')
  );
});

export const markBookingPaid = asyncHandler(async (req, res) => {
  const userId = req.session.userId;
  const booking = await qurbaniModuleService.markBookingPaid(req.params.id, userId);

  res.json(
    new ApiResponse(200, { booking }, 'Payment marked successfully')
  );
});

export const getMyBookings = asyncHandler(async (req, res) => {
  const userId = req.session.userId;
  const bookings = await qurbaniModuleService.getUserBookings(userId);

  res.json(
    new ApiResponse(200, { bookings }, 'Your qurbani bookings fetched successfully')
  );
});

// ============================================
// ADMIN: LISTINGS
// ============================================

export const adminListListings = asyncHandler(async (req, res) => {
  const listings = await qurbaniModuleService.getAllListings();
  res.json(new ApiResponse(200, { listings }, 'Qurbani listings fetched successfully'));
});

/**
 * Merge validated body (already coerced) with multer file, normalizing optional fields.
 * Multer populates req.file only when a photo was uploaded.
 */
function buildListingPayloadFromRequest(req) {
  const body = { ...req.body };

  if (req.file) {
    body.photoUrl = `/uploads/qurbani/${req.file.filename}`;
  }

  return body;
}

export const adminCreateListing = asyncHandler(async (req, res) => {
  const payload = buildListingPayloadFromRequest(req);
  const listing = await qurbaniModuleService.createListing(payload);

  res.status(201).json(
    new ApiResponse(201, { listing }, 'Qurbani listing created successfully')
  );
});

export const adminUpdateListing = asyncHandler(async (req, res) => {
  const payload = buildListingPayloadFromRequest(req);
  const listing = await qurbaniModuleService.updateListing(req.params.id, payload);

  res.json(new ApiResponse(200, { listing }, 'Qurbani listing updated successfully'));
});

export const adminDeleteListing = asyncHandler(async (req, res) => {
  const result = await qurbaniModuleService.deleteListing(req.params.id);
  res.json(new ApiResponse(200, result, 'Qurbani listing deleted successfully'));
});

export const adminUpdateListingStatus = asyncHandler(async (req, res) => {
  const listing = await qurbaniModuleService.updateListingStatus(
    req.params.id,
    req.body.status
  );

  res.json(new ApiResponse(200, { listing }, 'Listing status updated successfully'));
});

// ============================================
// ADMIN: BOOKINGS
// ============================================

export const adminListBookings = asyncHandler(async (req, res) => {
  const bookings = await qurbaniModuleService.getAllBookings();
  res.json(new ApiResponse(200, { bookings }, 'Qurbani bookings fetched successfully'));
});

export const adminUpdateBookingStatus = asyncHandler(async (req, res) => {
  const booking = await qurbaniModuleService.updateBookingStatus(
    req.params.id,
    req.body.status
  );

  res.json(new ApiResponse(200, { booking }, 'Booking status updated successfully'));
});
