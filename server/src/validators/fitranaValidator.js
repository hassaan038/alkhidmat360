import { z } from 'zod';

// Calculation bases we accept. Kept here (not as Prisma enum) so adding a
// new basis later is a code-only change. Custom is allowed but the client
// must still post a positive amountPerPerson.
const ALLOWED_BASES = ['wheat', 'barley', 'dates', 'raisins', 'alkhidmat', 'custom'];

// Coerced because the route accepts multipart (so payment screenshot can
// optionally come along) — multipart bodies arrive as strings.
export const createFitranaSchema = z.object({
  numberOfPeople: z.coerce
    .number({ invalid_type_error: 'numberOfPeople must be a number' })
    .int()
    .min(1, 'At least 1 person')
    .max(100, 'Cannot exceed 100 people in one submission'),
  calculationBasis: z.enum(ALLOWED_BASES, {
    errorMap: () => ({ message: `Basis must be one of: ${ALLOWED_BASES.join(', ')}` }),
  }),
  amountPerPerson: z.coerce
    .number({ invalid_type_error: 'amountPerPerson must be a number' })
    .positive('amountPerPerson must be greater than 0'),
  contactPhone: z.string().min(10, 'Please enter a valid phone number').max(20).optional(),
  notes: z.string().optional(),
  paymentMarked: z
    .union([z.boolean(), z.string()])
    .optional()
    .default(false)
    .transform((v) => (typeof v === 'string' ? v === 'true' : !!v)),
});

export const fitranaStatusUpdateSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'rejected'], {
    errorMap: () => ({ message: 'Invalid status' }),
  }),
});
