import { z } from 'zod';
import {
  cnicOptionalSchema,
  cnicRegex,
  pakistanPhoneSchema,
  strictEmailSchema,
} from './sharedValidators.js';

// Beneficiaries fill applications (loan, ramadan ration, zakat, orphan) that
// always require a CNIC. Capturing it once at signup means the form pages can
// stop asking for it on every submission.
export const signupSchema = z
  .object({
    email: strictEmailSchema,
    password: z.string().min(6, 'Password must be at least 6 characters'),
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    phoneNumber: pakistanPhoneSchema,
    cnic: cnicOptionalSchema,
    userType: z.enum(['DONOR', 'BENEFICIARY', 'VOLUNTEER'], {
      errorMap: () => ({ message: 'Invalid user type' }),
    }),
  })
  .superRefine((data, ctx) => {
    if (data.userType === 'BENEFICIARY') {
      const cleaned = (data.cnic || '').replace(/[\s-]/g, '');
      if (!cnicRegex.test(cleaned)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['cnic'],
          message: 'CNIC is required for beneficiary accounts (13 digits)',
        });
      }
    }
  });

export const loginSchema = z.object({
  email: strictEmailSchema,
  password: z.string().min(1, 'Password is required'),
});
