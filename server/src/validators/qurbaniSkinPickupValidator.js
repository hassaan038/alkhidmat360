import { z } from 'zod';
import { pakistanPhoneSchema } from './sharedValidators.js';

export const createSkinPickupSchema = z
  .object({
    contactPhone: pakistanPhoneSchema,
    address: z.string().optional().nullable(),
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
  })
  .superRefine((data, ctx) => {
    const hasCoords = data.latitude != null && data.longitude != null;
    const trimmedAddress = (data.address || '').trim();

    if (!hasCoords && trimmedAddress.length < 5) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['address'],
        message:
          'Please provide a complete address (or use the "Use My Location" button to capture coordinates)',
      });
    }
  });

export const skinPickupStatusUpdateSchema = z.object({
  status: z.enum(['pending', 'scheduled', 'collected', 'cancelled'], {
    errorMap: () => ({ message: 'Invalid status' }),
  }),
});
