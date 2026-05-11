import { z } from 'zod';
import {
  cnicOptionalSchema,
  fullNameSchema,
  pakistanPhoneSchema,
  strictEmailSchema,
  strongPasswordSchema,
} from './sharedValidators.js';

// Validation schema for status updates
export const statusUpdateSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected', 'confirmed', 'completed', 'under_review']),
});

// Validation schema for creating admin users
export const createAdminSchema = z.object({
  email: strictEmailSchema,
  password: strongPasswordSchema,
  fullName: fullNameSchema,
  phoneNumber: pakistanPhoneSchema,
  cnic: cnicOptionalSchema,
});
