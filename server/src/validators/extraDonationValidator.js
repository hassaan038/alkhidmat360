import { z } from 'zod';
import { donationAmountSchema, fullNameSchema } from './sharedValidators.js';

// Donor phone and email come from the session user record — the form no
// longer collects them. Donor name stays editable so users can still
// attribute a gift differently if they want.

const paymentMarkedField = z
  .union([z.boolean(), z.string()])
  .optional()
  .default(false)
  .transform((v) => (typeof v === 'string' ? v === 'true' : !!v));

// ============================================
// SADQA
// ============================================

export const createSadqaSchema = z.object({
  donorName: fullNameSchema,
  amount: donationAmountSchema,
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
  donorName: fullNameSchema,
  campaignKey: z.enum(ALLOWED_CAMPAIGNS, {
    errorMap: () => ({
      message: `Campaign must be one of: ${ALLOWED_CAMPAIGNS.join(', ')}`,
    }),
  }),
  campaignLabel: z.string().min(2, 'Campaign label is required'),
  amount: donationAmountSchema,
  notes: z.string().optional(),
  paymentMarked: paymentMarkedField,
});

export const disasterDonationStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'rejected'], {
    errorMap: () => ({ message: 'Invalid status' }),
  }),
});
