import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import * as service from '../services/volunteerAssignmentService.js';

// ============================================
// ADMIN
// ============================================

export const adminListVolunteers = asyncHandler(async (_req, res) => {
  const volunteers = await service.listAssignableVolunteers();
  res.json(new ApiResponse(200, { volunteers }, 'Volunteers fetched'));
});

export const adminCreateAssignment = asyncHandler(async (req, res) => {
  const adminId = req.session.userId;
  const assignment = await service.createAssignment(adminId, req.body);
  res
    .status(201)
    .json(new ApiResponse(201, { assignment }, 'Assignment created'));
});

export const adminListAssignments = asyncHandler(async (req, res) => {
  const { status, volunteerId } = req.query;
  const assignments = await service.listAllAssignments({ status, volunteerId });
  res.json(new ApiResponse(200, { assignments }, 'Assignments fetched'));
});

export const adminUpdateAssignment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const assignment = await service.updateAssignment(id, req.body);
  res.json(new ApiResponse(200, { assignment }, 'Assignment updated'));
});

export const adminDeleteAssignment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await service.deleteAssignment(id);
  res.json(new ApiResponse(200, null, 'Assignment deleted'));
});

export const adminUpdateAssignmentStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const assignment = await service.adminUpdateStatus(id, status);
  res.json(new ApiResponse(200, { assignment }, 'Status updated'));
});

// ============================================
// VOLUNTEER (own assignments)
// ============================================

export const volunteerListAssignments = asyncHandler(async (req, res) => {
  const userId = req.session.userId;
  const { status } = req.query;
  const assignments = await service.listVolunteerAssignments(userId, { status });
  res.json(new ApiResponse(200, { assignments }, 'Assignments fetched'));
});

export const volunteerUpdateAssignmentStatus = asyncHandler(async (req, res) => {
  const userId = req.session.userId;
  const { id } = req.params;
  const { status, completionNotes } = req.body;
  const assignment = await service.volunteerUpdateStatus(
    userId,
    id,
    status,
    completionNotes
  );
  res.json(new ApiResponse(200, { assignment }, 'Status updated'));
});
