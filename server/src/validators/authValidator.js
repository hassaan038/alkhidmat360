import { z } from 'zod';

export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  phoneNumber: z.string().min(10, 'Invalid phone number'),
  cnic: z.string().optional(),
  userType: z.enum(['DONOR', 'BENEFICIARY', 'VOLUNTEER'], {
    errorMap: () => ({ message: 'Invalid user type' }),
  }),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});
