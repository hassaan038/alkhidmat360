import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import * as extraDonationService from '../services/extraDonationService.js';

const attachScreenshot = (req, payload) => {
  if (req.file) {
    payload.paymentScreenshotUrl = `/uploads/payments/${req.file.filename}`;
  }
  return payload;
};

// ============================================
// SADQA
// ============================================

export const createSadqa = asyncHandler(async (req, res) => {
  const userId = req.session.userId;
  const payload = attachScreenshot(req, { ...req.body });
  const sadqa = await extraDonationService.createSadqa(userId, payload);

  res.status(201).json(new ApiResponse(201, { sadqa }, 'Sadqa donation recorded'));
});

export const getMySadqas = asyncHandler(async (req, res) => {
  const userId = req.session.userId;
  const sadqas = await extraDonationService.getUserSadqas(userId);

  res.json(new ApiResponse(200, { sadqas }, 'Your sadqa donations fetched'));
});

export const adminListSadqas = asyncHandler(async (req, res) => {
  const sadqas = await extraDonationService.getAllSadqas();
  res.json(new ApiResponse(200, { sadqas }, 'Sadqa donations fetched'));
});

export const adminUpdateSadqaStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const sadqa = await extraDonationService.updateSadqaStatus(id, status);
  res.json(new ApiResponse(200, { sadqa }, 'Sadqa status updated'));
});

// ============================================
// DISASTER DONATION
// ============================================

export const createDisasterDonation = asyncHandler(async (req, res) => {
  const userId = req.session.userId;
  const payload = attachScreenshot(req, { ...req.body });
  const donation = await extraDonationService.createDisasterDonation(userId, payload);

  res.status(201).json(
    new ApiResponse(201, { donation }, 'Disaster relief donation recorded')
  );
});

export const getMyDisasterDonations = asyncHandler(async (req, res) => {
  const userId = req.session.userId;
  const donations = await extraDonationService.getUserDisasterDonations(userId);

  res.json(new ApiResponse(200, { donations }, 'Your disaster donations fetched'));
});

export const adminListDisasterDonations = asyncHandler(async (req, res) => {
  const donations = await extraDonationService.getAllDisasterDonations();
  res.json(new ApiResponse(200, { donations }, 'Disaster donations fetched'));
});

export const adminUpdateDisasterDonationStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const donation = await extraDonationService.updateDisasterDonationStatus(id, status);
  res.json(new ApiResponse(200, { donation }, 'Disaster donation status updated'));
});
