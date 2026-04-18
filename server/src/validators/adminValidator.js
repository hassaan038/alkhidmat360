import { z } from 'zod';

// Validation schema for status updates
export const statusUpdateSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected', 'confirmed', 'completed', 'under_review']),
});

// Validation schema for creating admin users
export const createAdminSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  phoneNumber: z.string().min(11, 'Phone number must be at least 11 digits').max(15, 'Phone number must not exceed 15 digits'),
  cnic: z.string().length(13, 'CNIC must be exactly 13 digits').optional(),
});
