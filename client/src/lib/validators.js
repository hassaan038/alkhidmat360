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

const isPureSequential = (s) => {
  const step = ((s.charCodeAt(1) - s.charCodeAt(0)) + 10) % 10;
  if (step !== 1 && step !== 9) return false;
  for (let i = 1; i < s.length - 1; i++) {
    if (((s.charCodeAt(i + 1) - s.charCodeAt(i)) + 10) % 10 !== step) return false;
  }
  return true;
};

const isValidCnic = (v) =>
  cnicRegex.test(v) &&
  !/^(\d)\1{12}$/.test(v) &&
  v[1] !== '0' &&
  !isPureSequential(v);

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
// Only @gmail.com / @hotmail.com / @yahoo.com. Local part must start with a
// letter and be at least 3 characters long, so "1ali@gmail.com" and
// "ab@gmail.com" both fail.
export const strictEmailRegex =
  /^[A-Za-z][A-Za-z0-9._%+-]{2,}@(gmail|hotmail|yahoo)\.com$/i;
const EMAIL_INVALID_MSG =
  'Email must start with a letter, have at least 3 characters before @, and use gmail / hotmail / yahoo .com';

export const strictEmailSchema = z
  .string({ required_error: 'Email is required' })
  .trim()
  .toLowerCase()
  .email(EMAIL_INVALID_MSG)
  .regex(strictEmailRegex, EMAIL_INVALID_MSG);

export const strictEmailOptionalSchema = z
  .union([z.literal(''), strictEmailSchema])
  .optional();

// --- Person name ------------------------------------------------------------
// Letters and single internal spaces only. Trimmed length >= 3.
const NAME_INVALID_MSG =
  'Name must be at least 3 letters and contain only letters and spaces';

export const fullNameSchema = z
  .string({ required_error: 'Name is required' })
  .trim()
  .min(3, NAME_INVALID_MSG)
  .refine((v) => /^[A-Za-z]+(?: [A-Za-z]+)*$/.test(v), {
    message: NAME_INVALID_MSG,
  });

// --- Donation amount cap ----------------------------------------------------
// Single-entry cap on donor money — matches the server policy. Donors who
// want to give more should be routed to the office directly.
export const MAX_DONATION_AMOUNT = 300000; // PKR 3 lakh

export const donationAmountSchema = z.coerce
  .number({ invalid_type_error: 'Amount must be a number' })
  .positive('Amount must be greater than 0')
  .max(MAX_DONATION_AMOUNT, 'Amount cannot exceed PKR 3,00,000 (3 lakh)');

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
