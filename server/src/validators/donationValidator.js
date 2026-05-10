import { z } from 'zod';

// Multipart-aware: forms that accept payment screenshots send multipart,
// so numeric/boolean fields are coerced from strings.
//
// Donor contact info (phone, email) is no longer collected on these forms —
// the service injects it from the session user record. Donor name is still
// editable since donors sometimes want to attribute a gift differently.

const paymentMarkedField = z
  .union([z.boolean(), z.string()])
  .optional()
  .default(false)
  .transform((v) => (typeof v === 'string' ? v === 'true' : !!v));

// Qurbani Donation Validator
export const qurbaniDonationSchema = z.object({
  animalType: z.enum(['GOAT', 'CAMEL', 'COW'], {
    errorMap: () => ({ message: 'Please select a valid animal type' }),
  }),
  quantity: z.coerce
    .number()
    .int()
    .min(1, 'Quantity must be at least 1')
    .max(100, 'Quantity cannot exceed 100 animals in one submission'),
  totalAmount: z.coerce.number().positive('Amount must be greater than 0'),
  donorName: z.string().min(2, 'Name must be at least 2 characters'),
  donorAddress: z.string().min(10, 'Address must be at least 10 characters'),
  deliveryDate: z.string().optional(),
  notes: z.string().optional(),
  paymentMarked: paymentMarkedField,
});

// Ration Donation Validator
export const rationDonationSchema = z.object({
  donorName: z.string().min(2, 'Name must be at least 2 characters'),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  rationItems: z.string().optional(),
  notes: z.string().optional(),
  paymentMarked: paymentMarkedField,
});

// Skin Collection Validator — NO payment fields. Donor donates the
// physical skin and we collect it for free.
export const skinCollectionSchema = z.object({
  donorName: z.string().min(2, 'Name must be at least 2 characters'),
  collectionAddress: z.string().min(10, 'Address must be at least 10 characters'),
  numberOfSkins: z.coerce
    .number()
    .int()
    .min(1, 'Number of skins must be at least 1')
    .max(50, 'Number of skins cannot exceed 50 in one submission'),
  animalType: z.string().min(2, 'Please specify the animal type'),
  preferredDate: z.string().min(1, 'Please select a preferred date'),
  notes: z.string().optional(),
});

// Orphan Sponsorship Validator
export const orphanSponsorshipSchema = z.object({
  sponsorName: z.string().min(2, 'Name must be at least 2 characters'),
  monthlyAmount: z.coerce.number().positive('Monthly amount must be greater than 0'),
  duration: z.coerce
    .number()
    .int()
    .min(1, 'Duration must be at least 1 month')
    .max(36, 'Duration cannot exceed 36 months (3 years)'),
  orphanAge: z.string().optional(),
  orphanGender: z.string().optional(),
  startDate: z.string().optional(),
  notes: z.string().optional(),
  paymentMarked: paymentMarkedField,
});
