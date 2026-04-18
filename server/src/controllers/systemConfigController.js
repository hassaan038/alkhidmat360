import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import * as systemConfigService from '../services/systemConfigService.js';

const QURBANI_FLAG_KEY = 'qurbani_module_enabled';
const BANK_DETAILS_KEY = 'bank_details';

// ============================================
// QURBANI MODULE TOGGLE
// ============================================

export const getQurbaniModuleFlag = asyncHandler(async (req, res) => {
  const value = await systemConfigService.getConfig(QURBANI_FLAG_KEY, 'false');
  res.json(
    new ApiResponse(200, { enabled: value === 'true' }, 'Qurbani module flag fetched')
  );
});

export const updateQurbaniModuleFlag = asyncHandler(async (req, res) => {
  const { enabled } = req.body;
  const userId = req.session.userId;

  await systemConfigService.setConfig(
    QURBANI_FLAG_KEY,
    enabled ? 'true' : 'false',
    userId
  );

  res.json(
    new ApiResponse(200, { enabled: !!enabled }, 'Qurbani module flag updated')
  );
});

// ============================================
// BANK DETAILS
// ============================================

export const getBankDetails = asyncHandler(async (req, res) => {
  const value = await systemConfigService.getConfig(BANK_DETAILS_KEY, '');
  res.json(
    new ApiResponse(200, { bankDetails: value || '' }, 'Bank details fetched')
  );
});

export const updateBankDetails = asyncHandler(async (req, res) => {
  const { bankDetails } = req.body;
  const userId = req.session.userId;

  await systemConfigService.setConfig(BANK_DETAILS_KEY, bankDetails, userId);

  res.json(
    new ApiResponse(200, { bankDetails }, 'Bank details updated')
  );
});
