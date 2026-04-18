import { z } from 'zod';

// Update profile — all fields optional, but if provided must be valid.
// Email uniqueness is checked in the service (DB lookup); CNIC same.
export const updateProfileSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email').optional(),
  phoneNumber: z
    .string()
    .min(10, 'Phone must be at least 10 digits')
    .max(20, 'Phone is too long')
    .optional(),
  cnic: z
    .string()
    .min(13, 'CNIC must be at least 13 digits')
    .max(15, 'CNIC is too long')
    .optional()
    .or(z.literal('')),
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
