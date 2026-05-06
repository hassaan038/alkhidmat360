import { z } from 'zod';
import {
  cnicOptionalSchema,
  pakistanPhoneOptionalSchema,
  strictEmailSchema,
} from './sharedValidators.js';

// Update profile — all fields optional, but if provided must be valid.
// Email uniqueness is checked in the service (DB lookup); CNIC same.
export const updateProfileSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: strictEmailSchema.optional(),
  phoneNumber: pakistanPhoneOptionalSchema,
  cnic: cnicOptionalSchema,
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

export const deleteAccountSchema = z.object({
  password: z.string().min(1, 'Password is required to delete the account'),
  confirmation: z
    .string()
    .refine((v) => v === 'DELETE', { message: 'Type DELETE to confirm' }),
});
