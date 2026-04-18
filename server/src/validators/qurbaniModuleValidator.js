import { z } from 'zod';

// ============================================
// LISTINGS (admin) — multipart bodies coerce strings to numbers
// ============================================

export const createListingSchema = z.object({
  name: z.string().optional(),
  weightKg: z.coerce
    .number()
    .positive('Weight must be a positive number')
    .optional(),
  totalHissas: z.coerce
    .number()
    .int()
    .min(1, 'At least 1 hissa')
    .max(7, 'Maximum 7 hissas (bull)')
    .default(7),
  pricePerHissa: z.coerce
    .number()
    .positive('Price per hissa must be greater than 0'),
  pickupDate: z.string().min(1, 'Pickup date is required'),
  pickupLocation: z
    .string()
    .min(5, 'Pickup location must be at least 5 characters'),
  description: z.string().optional(),
});

export const updateListingSchema = createListingSchema.partial();

export const listingStatusUpdateSchema = z.object({
  status: z.enum(['DRAFT', 'ACTIVE', 'FULL', 'CLOSED'], {
    errorMap: () => ({ message: 'Invalid listing status' }),
  }),
});

// ============================================
// BOOKINGS (user)
// ============================================

// Coerced because the route accepts multipart (so payment screenshot can
// optionally come along) — multipart bodies arrive as strings.
export const createBookingSchema = z.object({
  listingId: z.coerce
    .number({ invalid_type_error: 'listingId must be a number' })
    .int()
    .positive('listingId must be a positive integer'),
  hissaCount: z.coerce
    .number({ invalid_type_error: 'hissaCount must be a number' })
    .int()
    .min(1, 'Must book at least 1 hissa')
    .max(7, 'Cannot book more than 7 hissas'),
  paymentMarked: z
    .union([z.boolean(), z.string()])
    .optional()
    .default(false)
    .transform((v) => (typeof v === 'string' ? v === 'true' : !!v)),
  notes: z.string().optional(),
});

// ============================================
// BOOKING STATUS (admin)
// ============================================

export const bookingStatusUpdateSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'rejected'], {
    errorMap: () => ({ message: 'Invalid booking status' }),
  }),
});

// ============================================
// SYSTEM CONFIG
// ============================================

export const moduleToggleSchema = z.object({
  enabled: z.boolean({ invalid_type_error: 'enabled must be a boolean' }),
});

export const bankDetailsSchema = z.object({
  bankDetails: z.string().min(1, 'Bank details cannot be empty'),
});
