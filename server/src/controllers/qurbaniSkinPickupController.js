import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import * as qurbaniSkinPickupService from '../services/qurbaniSkinPickupService.js';

// ============================================
// USER ENDPOINTS
// ============================================

export const createPickup = asyncHandler(async (req, res) => {
  const userId = req.session.userId;

  const payload = { ...req.body };
  if (req.file) {
    payload.housePhotoUrl = `/uploads/skin-pickup/${req.file.filename}`;
  }

  const pickup = await qurbaniSkinPickupService.createPickup(userId, payload);

  res.status(201).json(
    new ApiResponse(201, { pickup }, 'Skin collection request submitted')
  );
});

export const getMyPickups = asyncHandler(async (req, res) => {
  const userId = req.session.userId;
  const pickups = await qurbaniSkinPickupService.getUserPickups(userId);

  res.json(new ApiResponse(200, { pickups }, 'Your skin collection requests fetched'));
});

// ============================================
// ADMIN ENDPOINTS
// ============================================

export const adminListPickups = asyncHandler(async (req, res) => {
  const pickups = await qurbaniSkinPickupService.getAllPickups();

  res.json(new ApiResponse(200, { pickups }, 'Skin collection requests fetched'));
});

export const adminUpdatePickupStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const pickup = await qurbaniSkinPickupService.updatePickupStatus(id, status);

  res.json(new ApiResponse(200, { pickup }, 'Pickup status updated'));
});
