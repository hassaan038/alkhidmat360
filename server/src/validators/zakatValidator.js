import { z } from 'zod';

// Multipart-aware: every numeric field uses z.coerce so the schema works
// for both JSON and FormData callers.

const decimalString = z.coerce.number().nonnegative();
const positiveDecimal = z.coerce.number().positive();

export const createZakatPaymentSchema = z.object({
  cashSavings: decimalString.default(0),
  goldGrams: decimalString.default(0),
  goldValue: decimalString.default(0),
  silverGrams: decimalString.default(0),
  silverValue: decimalString.default(0),
  investments: decimalString.default(0),
  businessAssets: decimalString.default(0),
  otherAssets: decimalString.default(0),
  liabilities: decimalString.default(0),
  nisabBasis: z.enum(['gold', 'silver'], {
    errorMap: () => ({ message: 'nisabBasis must be "gold" or "silver"' }),
  }),
  nisabThreshold: positiveDecimal,
  totalWealth: decimalString,
  zakatAmount: decimalString,
  contactPhone: z.string().min(10).max(20).optional(),
  notes: z.string().optional(),
  paymentMarked: z
    .union([z.boolean(), z.string()])
    .optional()
    .default(false)
    .transform((v) => (typeof v === 'string' ? v === 'true' : !!v)),
});

export const zakatPaymentStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'rejected'], {
    errorMap: () => ({ message: 'Invalid status' }),
  }),
});

export const createZakatApplicationSchema = z.object({
  applicantName: z.string().min(2, 'Name must be at least 2 characters'),
  applicantPhone: z.string().min(10, 'Phone must be at least 10 digits').max(20),
  applicantCNIC: z
    .string()
    .regex(/^\d{13}$/, 'CNIC must be exactly 13 digits (no dashes)'),
  applicantAddress: z.string().min(10, 'Address must be at least 10 characters'),

  familyMembers: z.coerce.number().int().min(1, 'At least 1 family member').max(50),
  monthlyIncome: z.coerce.number().nonnegative('Monthly income must be 0 or more'),
  employmentStatus: z.enum(
    ['employed', 'self-employed', 'unemployed', 'student', 'retired', 'other'],
    { errorMap: () => ({ message: 'Invalid employment status' }) }
  ),
  housingStatus: z.enum(['own', 'rent', 'family', 'other'], {
    errorMap: () => ({ message: 'Invalid housing status' }),
  }),
  hasDisabledMembers: z
    .union([z.boolean(), z.string()])
    .transform((v) => (typeof v === 'string' ? v === 'true' : !!v)),
  disabilityDetails: z.string().optional(),

  reasonForApplication: z.string().min(20, 'Please describe your situation in at least 20 characters'),
  amountRequested: z.coerce.number().nonnegative().optional(),
  additionalNotes: z.string().optional(),
});

export const zakatApplicationStatusSchema = z.object({
  status: z.enum(['pending', 'under_review', 'approved', 'rejected'], {
    errorMap: () => ({ message: 'Invalid status' }),
  }),
});
