import { z } from 'zod';

// Strict, reusable Zod helpers for common form fields.
// Mirrors server/src/validators/sharedValidators.js — keep both in sync if
// either is updated.

// --- Pakistani phone number -------------------------------------------------
// PK mobile only: +923001234567 / 923001234567 / 03001234567. The first digit
// after the country/local prefix must be 3 (PK mobile network codes start
// with 3XX). Spaces and dashes are stripped before matching.
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
// 13 digits, no dashes. First digit is NADRA's province code (1–7):
//   1 KPK · 2 FATA · 3 Punjab · 4 Sindh · 5 Balochistan · 6 ICT · 7 GB/AJK
// Anything starting with 0, 8 or 9 cannot be a real CNIC.
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
// Only @gmail.com / @hotmail.com / @yahoo.com — mirror of the server rule.
// Local part still needs a letter so "123@gmail.com" fails.
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
// Mirrors server/src/validators/sharedValidators.js. The Signup page renders
// `passwordRules` directly as a live checklist, so reordering or relabelling
// here changes the UI.
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
// Mirrors server/src/validators/sharedValidators.js. Accepts ISO date
// strings from <input type="date">; rejects anything before today.
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

// Returns YYYY-MM-DD for use as an HTML <input min={todayIso()}> attribute.
export const todayIso = () => new Date().toISOString().slice(0, 10);

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
