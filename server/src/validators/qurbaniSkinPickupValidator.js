import { z } from 'zod';

export const createSkinPickupSchema = z.object({
  contactPhone: z.string().min(10, 'Please enter a valid phone number').max(20),
  address: z.string().min(5, 'Please provide a complete address'),
  latitude: z.coerce
    .number()
    .min(-90, 'Latitude out of range')
    .max(90, 'Latitude out of range')
    .optional()
    .nullable(),
  longitude: z.coerce
    .number()
    .min(-180, 'Longitude out of range')
    .max(180, 'Longitude out of range')
    .optional()
    .nullable(),
  numberOfSkins: z.coerce.number().int().min(1, 'At least 1 skin').max(50).default(1),
  preferredDate: z.string().optional().nullable(),
  additionalDetails: z.string().optional().nullable(),
});

export const skinPickupStatusUpdateSchema = z.object({
  status: z.enum(['pending', 'scheduled', 'collected', 'cancelled'], {
    errorMap: () => ({ message: 'Invalid status' }),
  }),
});
