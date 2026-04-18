import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import * as fitranaService from '../services/fitranaService.js';

// ============================================
// USER
// ============================================

export const createFitrana = asyncHandler(async (req, res) => {
  const userId = req.session.userId;
  const payload = { ...req.body };
  if (req.file) {
    payload.paymentScreenshotUrl = `/uploads/payments/${req.file.filename}`;
  }
  const fitrana = await fitranaService.createFitrana(userId, payload);

  res.status(201).json(
    new ApiResponse(201, { fitrana }, 'Fitrana submission saved')
  );
});

export const getMyFitranas = asyncHandler(async (req, res) => {
  const userId = req.session.userId;
  const fitranas = await fitranaService.getUserFitranas(userId);

  res.json(new ApiResponse(200, { fitranas }, 'Your fitrana submissions fetched'));
});

// ============================================
// ADMIN
// ============================================

export const adminListFitranas = asyncHandler(async (req, res) => {
  const fitranas = await fitranaService.getAllFitranas();

  res.json(new ApiResponse(200, { fitranas }, 'Fitrana submissions fetched'));
});

export const adminUpdateFitranaStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const fitrana = await fitranaService.updateFitranaStatus(id, status);

  res.json(new ApiResponse(200, { fitrana }, 'Fitrana status updated'));
});
