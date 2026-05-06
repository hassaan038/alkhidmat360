import { z } from 'zod';
import {
  cnicOptionalSchema,
  pakistanPhoneSchema,
  strictEmailSchema,
} from './sharedValidators.js';

export const signupSchema = z.object({
  email: strictEmailSchema,
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  phoneNumber: pakistanPhoneSchema,
  cnic: cnicOptionalSchema,
  userType: z.enum(['DONOR', 'BENEFICIARY', 'VOLUNTEER'], {
    errorMap: () => ({ message: 'Invalid user type' }),
  }),
});

export const loginSchema = z.object({
  email: strictEmailSchema,
  password: z.string().min(1, 'Password is required'),
});
