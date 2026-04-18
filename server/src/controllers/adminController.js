import * as adminService from '../services/adminService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';

// ============================================
// DASHBOARD STATISTICS
// ============================================

export const getDashboardStats = asyncHandler(async (req, res) => {
  const stats = await adminService.getDashboardStats();

  res.status(200).json({
    success: true,
    data: stats,
  });
});

// ============================================
// DONATION MANAGEMENT
// ============================================

export const getQurbaniDonations = asyncHandler(async (req, res) => {
  const donations = await adminService.getAllQurbaniDonations();

  res.status(200).json({
    success: true,
    data: donations,
  });
});

export const getRationDonations = asyncHandler(async (req, res) => {
  const donations = await adminService.getAllRationDonations();

  res.status(200).json({
    success: true,
    data: donations,
  });
});

export const getSkinCollections = asyncHandler(async (req, res) => {
  const collections = await adminService.getAllSkinCollections();

  res.status(200).json({
    success: true,
    data: collections,
  });
});

export const getOrphanSponsorships = asyncHandler(async (req, res) => {
  const sponsorships = await adminService.getAllOrphanSponsorships();

  res.status(200).json({
    success: true,
    data: sponsorships,
  });
});

// ============================================
// APPLICATION MANAGEMENT
// ============================================

export const getLoanApplications = asyncHandler(async (req, res) => {
  const applications = await adminService.getAllLoanApplications();

  res.status(200).json({
    success: true,
    data: applications,
  });
});

export const getRamadanRationApplications = asyncHandler(async (req, res) => {
  const applications = await adminService.getAllRamadanRationApplications();

  res.status(200).json({
    success: true,
    data: applications,
  });
});

export const getOrphanRegistrations = asyncHandler(async (req, res) => {
  const registrations = await adminService.getAllOrphanRegistrations();

  res.status(200).json({
    success: true,
    data: registrations,
  });
});

// ============================================
// VOLUNTEER MANAGEMENT
// ============================================

export const getVolunteerTasks = asyncHandler(async (req, res) => {
  const tasks = await adminService.getAllVolunteerTasks();

  res.status(200).json({
    success: true,
    data: tasks,
  });
});

export const getVolunteers = asyncHandler(async (req, res) => {
  const volunteers = await adminService.getAllVolunteers();

  res.status(200).json({
    success: true,
    data: volunteers,
  });
});

// ============================================
// STATUS UPDATE CONTROLLERS
// ============================================

export const updateQurbaniDonationStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const updated = await adminService.updateQurbaniDonationStatus(id, status);

  res.status(200).json({
    success: true,
    message: 'Status updated successfully',
    data: updated,
  });
});

export const updateRationDonationStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const updated = await adminService.updateRationDonationStatus(id, status);

  res.status(200).json({
    success: true,
    message: 'Status updated successfully',
    data: updated,
  });
});

export const updateSkinCollectionStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const updated = await adminService.updateSkinCollectionStatus(id, status);

  res.status(200).json({
    success: true,
    message: 'Status updated successfully',
    data: updated,
  });
});

export const updateOrphanSponsorshipStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const updated = await adminService.updateOrphanSponsorshipStatus(id, status);

  res.status(200).json({
    success: true,
    message: 'Status updated successfully',
    data: updated,
  });
});

export const updateLoanApplicationStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const updated = await adminService.updateLoanApplicationStatus(id, status);

  res.status(200).json({
    success: true,
    message: 'Status updated successfully',
    data: updated,
  });
});

export const updateRamadanRationApplicationStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const updated = await adminService.updateRamadanRationApplicationStatus(id, status);

  res.status(200).json({
    success: true,
    message: 'Status updated successfully',
    data: updated,
  });
});

export const updateOrphanRegistrationStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const updated = await adminService.updateOrphanRegistrationStatus(id, status);

  res.status(200).json({
    success: true,
    message: 'Status updated successfully',
    data: updated,
  });
});

export const updateVolunteerTaskStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const updated = await adminService.updateVolunteerTaskStatus(id, status);

  res.status(200).json({
    success: true,
    message: 'Status updated successfully',
    data: updated,
  });
});

// ============================================
// ADMIN USER MANAGEMENT
// ============================================

export const createAdmin = asyncHandler(async (req, res) => {
  const admin = await adminService.createAdminUser(req.body);

  res.status(201).json(
    new ApiResponse(201, { admin }, 'Admin user created successfully')
  );
});
