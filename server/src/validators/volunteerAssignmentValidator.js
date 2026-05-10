import { z } from 'zod';
import { futureOrTodayDateOptionalSchema } from './sharedValidators.js';

const TASK_CATEGORIES = [
  'DISTRIBUTION',
  'FUNDRAISING',
  'AWARENESS',
  'ADMINISTRATIVE',
  'FIELD_WORK',
  'EVENT_SUPPORT',
];

const PRIORITIES = ['low', 'normal', 'high'];

// Admin creates an assignment for a volunteer.
export const createAssignmentSchema = z.object({
  volunteerId: z.coerce.number().int().positive('Pick a volunteer'),
  title: z.string().min(3, 'Title must be at least 3 characters').max(120),
  description: z.string().min(10, 'Describe the task in at least 10 characters'),
  category: z.enum(TASK_CATEGORIES, {
    errorMap: () => ({ message: 'Pick a category' }),
  }),
  priority: z.enum(PRIORITIES).optional().default('normal'),
  location: z.string().optional().nullable(),
  dueDate: futureOrTodayDateOptionalSchema,
});

// Admin edits assignment fields. Everything optional — admin only sends
// what they want changed.
export const updateAssignmentSchema = z.object({
  title: z.string().min(3).max(120).optional(),
  description: z.string().min(10).optional(),
  category: z.enum(TASK_CATEGORIES).optional(),
  priority: z.enum(PRIORITIES).optional(),
  location: z.string().optional().nullable(),
  dueDate: futureOrTodayDateOptionalSchema,
});

// Admin status changes (cancel a task etc.).
export const adminStatusSchema = z.object({
  status: z.enum(['assigned', 'in_progress', 'completed', 'cancelled'], {
    errorMap: () => ({ message: 'Invalid status' }),
  }),
});

// Volunteer self-status updates — they can only move forward (start/finish)
// and optionally attach completion notes when wrapping up.
export const volunteerStatusSchema = z.object({
  status: z.enum(['in_progress', 'completed'], {
    errorMap: () => ({ message: 'You can only mark a task in-progress or completed' }),
  }),
  completionNotes: z.string().optional(),
});
