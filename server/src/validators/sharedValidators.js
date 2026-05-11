import { z } from 'zod';

// Strict, reusable Zod helpers for fields that are common across the app.
// Centralised here so phone / CNIC / email rules stay consistent between
// the auth, donor, beneficiary, volunteer, admin and qurbani validators.

// --- Pakistani phone number -------------------------------------------------
// Accepts only PK mobile numbers (the only contact format we collect):
//   +923001234567   (13 chars, international with leading +)
//    923001234567   (12 digits, international without +)
//    03001234567    (11 digits, local — starts with 0)
// The first digit after the country/local prefix must be 3 (PK mobile network
// codes start with 3XX). Spaces and dashes are stripped before matching, so
// "+92 300-123 4567" is accepted. Garbage like 01111111111 fails because it
// doesn't start with 03.
export const pakistanPhoneRegex = /^(?:\+92|92|0)3\d{9}$/;
const PHONE_INVALID_MSG =
  'Enter a valid mobile number (e.g. 03001234567 or +923001234567)';

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
//
// NADRA assigns the first digit by province / region:
//   1 = Khyber Pakhtunkhwa     5 = Balochistan
//   2 = FATA                   6 = Islamabad Capital Territory
//   3 = Punjab                 7 = Gilgit-Baltistan / AJK
//   4 = Sindh
//
// Anything starting with 0, 8 or 9 cannot be a real CNIC, so we reject those
// as a lightweight sanity check (catches the obvious "1111111111111" /
// "0000000000000" garbage without needing the full NADRA tehsil database).
export const cnicRegex = /^[1-7]\d{12}$/;
const CNIC_INVALID_MSG =
  'CNIC must be 13 digits and start with a valid province code 1–7 (e.g. 35202-1234567-1)';

const isValidCnic = (v) => cnicRegex.test(v) && !/^(\d)\1{12}$/.test(v);

export const cnicSchema = z
  .string({ required_error: 'CNIC is required' })
  .trim()
  .transform((v) => v.replace(/[\s-]/g, ''))
  .refine(isValidCnic, { message: CNIC_INVALID_MSG });

export const cnicOptionalSchema = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s-]/g, ''))
  .refine((v) => v === '' || isValidCnic(v), { message: CNIC_INVALID_MSG })
  .optional()
  .or(z.literal(''));

// --- Email ------------------------------------------------------------------
// Only @gmail.com / @hotmail.com / @yahoo.com are accepted (matches policy
// agreed with ops — they don't want to chase typos on custom domains). The
// local part still needs at least one letter so "123@gmail.com" fails.
export const strictEmailRegex =
  /^(?=[^@]*[A-Za-z])[A-Za-z0-9._%+-]+@(gmail|hotmail|yahoo)\.com$/i;
const EMAIL_INVALID_MSG =
  'Please use a Gmail, Hotmail or Yahoo email (e.g. you@gmail.com)';

export const strictEmailSchema = z
  .string({ required_error: 'Email is required' })
  .trim()
  .toLowerCase()
  .email(EMAIL_INVALID_MSG)
  .regex(strictEmailRegex, EMAIL_INVALID_MSG);

export const strictEmailOptionalSchema = z
  .union([z.literal(''), strictEmailSchema])
  .optional();

// --- Password strength ------------------------------------------------------
// Rules mirrored on the client so the live hint UI stays in sync. Keep
// passwordRules and strongPasswordSchema together — adding a rule here
// without updating the client list will silently let the form submit.
export const passwordRules = [
  { key: 'length', label: 'At least 8 characters', test: (v) => v.length >= 8 },
  { key: 'upper', label: 'One uppercase letter (A–Z)', test: (v) => /[A-Z]/.test(v) },
  { key: 'lower', label: 'One lowercase letter (a–z)', test: (v) => /[a-z]/.test(v) },
  { key: 'digit', label: 'One number (0–9)', test: (v) => /\d/.test(v) },
  {
    key: 'special',
    label: 'One special character (e.g. ! @ # $ %)',
    test: (v) => /[^A-Za-z0-9]/.test(v),
  },
];

// --- Date (no past dates) ---------------------------------------------------
// Accepts ISO date strings ("YYYY-MM-DD") from <input type="date"> and ISO
// datetimes from <input type="datetime-local">. Rejects anything that
// resolves to a calendar day before today (host time). Use the optional
// variant for fields that can be left blank.
const PAST_DATE_MSG = 'Date cannot be in the past';

const isPastDate = (value) => {
  if (!value) return false;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return true;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  parsed.setHours(0, 0, 0, 0);
  return parsed < today;
};

export const futureOrTodayDateSchema = z
  .string({ required_error: 'Date is required' })
  .min(1, 'Date is required')
  .refine((v) => !isPastDate(v), { message: PAST_DATE_MSG });

export const futureOrTodayDateOptionalSchema = z
  .string()
  .optional()
  .nullable()
  .refine((v) => !v || !isPastDate(v), { message: PAST_DATE_MSG });

export const strongPasswordSchema = z
  .string({ required_error: 'Password is required' })
  .superRefine((value, ctx) => {
    for (const rule of passwordRules) {
      if (!rule.test(value)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Password must include: ${rule.label.toLowerCase()}`,
        });
      }
    }
  });
