import { z } from 'zod';

const paymentMarkedField = z
  .union([z.boolean(), z.string()])
  .optional()
  .default(false)
  .transform((v) => (typeof v === 'string' ? v === 'true' : !!v));

// ============================================
// SADQA
// ============================================

export const createSadqaSchema = z.object({
  donorName: z.string().min(2, 'Name must be at least 2 characters'),
  donorPhone: z.string().min(10, 'Please enter a valid phone number').max(20),
  donorEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  purpose: z.string().max(200).optional(),
  notes: z.string().optional(),
  paymentMarked: paymentMarkedField,
});

export const sadqaStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'rejected'], {
    errorMap: () => ({ message: 'Invalid status' }),
  }),
});

// ============================================
// DISASTER DONATION
// ============================================

const ALLOWED_CAMPAIGNS = ['floods', 'earthquake', 'shelter', 'medical', 'general'];

export const createDisasterDonationSchema = z.object({
  donorName: z.string().min(2, 'Name must be at least 2 characters'),
  donorPhone: z.string().min(10, 'Please enter a valid phone number').max(20),
  donorEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  campaignKey: z.enum(ALLOWED_CAMPAIGNS, {
    errorMap: () => ({
      message: `Campaign must be one of: ${ALLOWED_CAMPAIGNS.join(', ')}`,
    }),
  }),
  campaignLabel: z.string().min(2, 'Campaign label is required'),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  notes: z.string().optional(),
  paymentMarked: paymentMarkedField,
});

export const disasterDonationStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'rejected'], {
    errorMap: () => ({ message: 'Invalid status' }),
  }),
});
