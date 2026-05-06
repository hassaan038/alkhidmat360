import { z } from 'zod';
import { pakistanPhoneSchema, strictEmailSchema } from './sharedValidators.js';

// Validation schema for Volunteer Task Registration
export const volunteerTaskSchema = z.object({
  volunteerName: z.string().min(2, 'Name must be at least 2 characters'),
  volunteerPhone: pakistanPhoneSchema,
  volunteerEmail: strictEmailSchema,
  volunteerAddress: z.string().min(10, 'Please provide a complete address'),
  taskCategory: z.enum([
    'DISTRIBUTION',
    'FUNDRAISING',
    'AWARENESS',
    'ADMINISTRATIVE',
    'FIELD_WORK',
    'EVENT_SUPPORT',
  ]),
  availability: z.string().min(1, 'Please specify your availability'), // JSON string
  skills: z.string().optional(),
  experience: z.string().optional(),
  preferredLocation: z.string().optional(),
  emergencyContact: pakistanPhoneSchema,
});
