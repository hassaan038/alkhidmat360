import * as applicationService from '../services/applicationService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// ============================================
// LOAN APPLICATION CONTROLLERS
// ============================================

export const createLoanApplication = asyncHandler(async (req, res) => {
  const userId = req.session.userId;
  const application = await applicationService.createLoanApplication(userId, req.body);

  res.status(201).json({
    success: true,
    message: 'Loan application submitted successfully',
    data: application,
  });
});

export const getLoanApplications = asyncHandler(async (req, res) => {
  const userId = req.session.userId;
  const applications = await applicationService.getUserLoanApplications(userId);

  res.status(200).json({
    success: true,
    data: applications,
  });
});

// ============================================
// RAMADAN RATION CONTROLLERS
// ============================================

export const createRamadanRationApplication = asyncHandler(async (req, res) => {
  const userId = req.session.userId;
  const application = await applicationService.createRamadanRationApplication(userId, req.body);

  res.status(201).json({
    success: true,
    message: 'Ramadan ration application submitted successfully',
    data: application,
  });
});

export const getRamadanRationApplications = asyncHandler(async (req, res) => {
  const userId = req.session.userId;
  const applications = await applicationService.getUserRamadanRationApplications(userId);

  res.status(200).json({
    success: true,
    data: applications,
  });
});

// ============================================
// ORPHAN REGISTRATION CONTROLLERS
// ============================================

export const createOrphanRegistration = asyncHandler(async (req, res) => {
  const userId = req.session.userId;
  const registration = await applicationService.createOrphanRegistration(userId, req.body);

  res.status(201).json({
    success: true,
    message: 'Orphan registration submitted successfully',
    data: registration,
  });
});

export const getOrphanRegistrations = asyncHandler(async (req, res) => {
  const userId = req.session.userId;
  const registrations = await applicationService.getUserOrphanRegistrations(userId);

  res.status(200).json({
    success: true,
    data: registrations,
  });
});
