import { z } from 'zod';
import {
  cnicOptionalSchema,
  pakistanPhoneSchema,
  strictEmailSchema,
} from './sharedValidators.js';

// Validation schema for status updates
export const statusUpdateSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected', 'confirmed', 'completed', 'under_review']),
});

// Validation schema for creating admin users
export const createAdminSchema = z.object({
  email: strictEmailSchema,
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  phoneNumber: pakistanPhoneSchema,
  cnic: cnicOptionalSchema,
});
