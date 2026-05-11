import { z } from 'zod';
import { fullNameSchema, pakistanPhoneSchema } from './sharedValidators.js';

// Volunteer phone and email come from the session user record. emergencyContact
// describes a different person (next-of-kin) so it stays on the form.
export const volunteerTaskSchema = z.object({
  volunteerName: fullNameSchema,
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
