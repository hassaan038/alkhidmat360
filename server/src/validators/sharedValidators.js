import { z } from 'zod';

// Strict, reusable Zod helpers for fields that are common across the app.
// Centralised here so phone / CNIC / email rules stay consistent between
// the auth, donor, beneficiary, volunteer, admin and qurbani validators.

// --- Pakistani phone number -------------------------------------------------
// Accepts the three formats users actually type:
//   +923001234567   (13 chars, international with leading +)
//    923001234567   (12 digits, international without +)
//    03001234567    (11 digits, local — starts with 0)
// Spaces and dashes are stripped before matching, so "+92 300-123 4567" is
// accepted. Anything else (wrong length, bogus country code, letters) fails.
export const pakistanPhoneRegex = /^(?:\+92|92|0)\d{10}$/;
const PHONE_INVALID_MSG =
  'Enter a valid phone number (e.g. 03001234567 or +923001234567)';

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
// Pakistan National Identity Card — 13 digits, no dashes. We strip dashes
// before validating so users can paste "12345-1234567-1" and we'll accept it.
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
// Zod's built-in `.email()` is permissive (accepts "a@b" with no TLD). We
// layer a stricter regex on top so the address actually has a proper domain
// and TLD (at least 2 letters after the dot).
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
