import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import * as donationService from '../services/donationService.js';

// ============================================
// QURBANI DONATION
// ============================================

export const createQurbaniDonation = asyncHandler(async (req, res) => {
  const userId = req.session.userId;
  const payload = { ...req.body };
  if (req.file) {
    payload.paymentScreenshotUrl = `/uploads/payments/${req.file.filename}`;
  }
  const donation = await donationService.createQurbaniDonation(userId, payload);

  res.status(201).json(
    new ApiResponse(201, { donation }, 'Qurbani donation submitted successfully')
  );
});

export const getQurbaniDonations = asyncHandler(async (req, res) => {
  const userId = req.session.userId;
  const donations = await donationService.getUserQurbaniDonations(userId);

  res.json(
    new ApiResponse(200, { donations }, 'Qurbani donations fetched successfully')
  );
});

// ============================================
// RATION DONATION
// ============================================

export const createRationDonation = asyncHandler(async (req, res) => {
  const userId = req.session.userId;
  const payload = { ...req.body };
  if (req.file) {
    payload.paymentScreenshotUrl = `/uploads/payments/${req.file.filename}`;
  }
  const donation = await donationService.createRationDonation(userId, payload);

  res.status(201).json(
    new ApiResponse(201, { donation }, 'Ration donation submitted successfully')
  );
});

export const getRationDonations = asyncHandler(async (req, res) => {
  const userId = req.session.userId;
  const donations = await donationService.getUserRationDonations(userId);

  res.json(
    new ApiResponse(200, { donations }, 'Ration donations fetched successfully')
  );
});

// ============================================
// SKIN COLLECTION
// ============================================

export const createSkinCollection = asyncHandler(async (req, res) => {
  const userId = req.session.userId;
  const collection = await donationService.createSkinCollection(userId, req.body);

  res.status(201).json(
    new ApiResponse(201, { collection }, 'Skin collection request submitted successfully')
  );
});

export const getSkinCollections = asyncHandler(async (req, res) => {
  const userId = req.session.userId;
  const collections = await donationService.getUserSkinCollections(userId);

  res.json(
    new ApiResponse(200, { collections }, 'Skin collections fetched successfully')
  );
});

// ============================================
// ORPHAN SPONSORSHIP
// ============================================

export const createOrphanSponsorship = asyncHandler(async (req, res) => {
  const userId = req.session.userId;
  const payload = { ...req.body };
  if (req.file) {
    payload.paymentScreenshotUrl = `/uploads/payments/${req.file.filename}`;
  }
  const sponsorship = await donationService.createOrphanSponsorship(userId, payload);

  res.status(201).json(
    new ApiResponse(201, { sponsorship }, 'Orphan sponsorship submitted successfully')
  );
});

export const getOrphanSponsorships = asyncHandler(async (req, res) => {
  const userId = req.session.userId;
  const sponsorships = await donationService.getUserOrphanSponsorships(userId);

  res.json(
    new ApiResponse(200, { sponsorships }, 'Orphan sponsorships fetched successfully')
  );
});
