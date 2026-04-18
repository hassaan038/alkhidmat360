import * as volunteerService from '../services/volunteerService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// ============================================
// VOLUNTEER TASK CONTROLLERS
// ============================================

export const createVolunteerTask = asyncHandler(async (req, res) => {
  const userId = req.session.userId;

  const task = await volunteerService.createVolunteerTask(userId, req.body);

  res.status(201).json({
    success: true,
    message: 'Volunteer task registration submitted successfully',
    data: task,
  });
});

export const getVolunteerTasks = asyncHandler(async (req, res) => {
  const userId = req.session.userId;

  const tasks = await volunteerService.getUserVolunteerTasks(userId);

  res.status(200).json({
    success: true,
    data: tasks,
  });
});
