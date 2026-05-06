import { z } from 'zod';

// Strict, reusable Zod helpers for common form fields.
// Mirrors server/src/validators/sharedValidators.js — keep both in sync if
// either is updated.

// --- Pakistani phone number -------------------------------------------------
// Accepts: +923001234567, 923001234567, 03001234567 (mobile or landline).
// Spaces and dashes are stripped before matching.
export const pakistanPhoneRegex = /^(?:\+92|92|0)\d{10}$/;
const PHONE_INVALID_MSG =
  'Enter a valid Pakistani phone number (e.g. 03001234567 or +923001234567)';

export const pakistanPhoneSchema = z
  .string({ required_error: 'Phone number is required' })
  .trim()
  .transform((v) => v.replace(/[\s-]/g, ''))
  .refine((v) => pakistanPhoneRegex.test(v), { message: PHONE_INVALID_MSG });

export const pakistanPhoneOptionalSchema = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s-]/g, ''))
  .refine((v) => v === '' || pakistanPhoneRegex.test(v), {
    message: PHONE_INVALID_MSG,
  })
  .optional()
  .or(z.literal(''));

// --- CNIC -------------------------------------------------------------------
// 13 digits, no dashes. Dashes are stripped so users can paste 12345-1234567-1.
export const cnicRegex = /^\d{13}$/;
const CNIC_INVALID_MSG = 'CNIC must be exactly 13 digits (e.g. 1234512345671)';

export const cnicSchema = z
  .string({ required_error: 'CNIC is required' })
  .trim()
  .transform((v) => v.replace(/[\s-]/g, ''))
  .refine((v) => cnicRegex.test(v), { message: CNIC_INVALID_MSG });

export const cnicOptionalSchema = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s-]/g, ''))
  .refine((v) => v === '' || cnicRegex.test(v), { message: CNIC_INVALID_MSG })
  .optional()
  .or(z.literal(''));

// --- Email ------------------------------------------------------------------
// Stricter than Zod's `.email()` — requires a real TLD (>= 2 chars after dot).
export const strictEmailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const EMAIL_INVALID_MSG = 'Please enter a valid email address (e.g. you@example.com)';

export const strictEmailSchema = z
  .string({ required_error: 'Email is required' })
  .trim()
  .toLowerCase()
  .email(EMAIL_INVALID_MSG)
  .regex(strictEmailRegex, EMAIL_INVALID_MSG);

export const strictEmailOptionalSchema = z
  .union([z.literal(''), strictEmailSchema])
  .optional();
