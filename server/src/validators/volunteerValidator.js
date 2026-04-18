import { z } from 'zod';

// Validation schema for Volunteer Task Registration
export const volunteerTaskSchema = z.object({
  volunteerName: z.string().min(2, 'Name must be at least 2 characters'),
  volunteerPhone: z
    .string()
    .min(11, 'Phone number must be at least 11 digits')
    .max(15, 'Phone number must not exceed 15 digits'),
  volunteerEmail: z.string().email('Invalid email address'),
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
  emergencyContact: z
    .string()
    .min(11, 'Emergency contact must be at least 11 digits')
    .max(15, 'Emergency contact must not exceed 15 digits'),
});
