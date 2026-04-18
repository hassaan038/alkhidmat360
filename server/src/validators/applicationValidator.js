import { z } from 'zod';

// ============================================
// LOAN APPLICATION VALIDATOR
// ============================================

export const loanApplicationSchema = z.object({
  loanType: z.enum(['BUSINESS', 'EDUCATION', 'MEDICAL', 'HOUSING', 'MARRIAGE', 'OTHER'], {
    required_error: 'Loan type is required',
  }),
  requestedAmount: z.number().positive('Requested amount must be positive'),
  monthlyIncome: z.number().nonnegative('Monthly income must be non-negative'),
  familyMembers: z.number().int().min(1, 'Must have at least 1 family member'),
  employmentStatus: z.string().min(2).max(50),
  purposeDescription: z.string().min(10, 'Purpose description must be at least 10 characters'),
  applicantName: z.string().min(2),
  applicantPhone: z.string().min(11).max(15),
  applicantCNIC: z.string().length(13, 'CNIC must be exactly 13 digits'),
  applicantAddress: z.string().min(10),
  guarantorName: z.union([z.string().min(2), z.literal('')]).optional(),
  guarantorPhone: z.union([z.string().min(11).max(15), z.literal('')]).optional(),
  guarantorCNIC: z.union([z.string().length(13), z.literal('')]).optional(),
  guarantorAddress: z.union([z.string().min(10), z.literal('')]).optional(),
  additionalNotes: z.string().optional(),
});

// ============================================
// RAMADAN RATION APPLICATION VALIDATOR
// ============================================

export const ramadanRationSchema = z.object({
  familyMembers: z.number().int().min(1, 'Must have at least 1 family member'),
  monthlyIncome: z.number().nonnegative('Monthly income must be non-negative'),
  hasDisabledMembers: z.boolean(),
  disabilityDetails: z.string().optional(),
  applicantName: z.string().min(2),
  applicantPhone: z.string().min(11).max(15),
  applicantCNIC: z.string().length(13, 'CNIC must be exactly 13 digits'),
  applicantAddress: z.string().min(10),
  reasonForApplication: z.string().min(10, 'Reason must be at least 10 characters'),
  previouslyReceived: z.boolean(),
  additionalNotes: z.string().optional(),
});

// ============================================
// ORPHAN REGISTRATION VALIDATOR
// ============================================

export const orphanRegistrationSchema = z.object({
  orphanName: z.string().min(2),
  orphanAge: z.number().int().min(0).max(18, 'Orphan must be 18 or younger'),
  orphanGender: z.enum(['MALE', 'FEMALE'], {
    required_error: 'Gender is required',
  }),
  guardianRelation: z.string().min(2).max(50),
  guardianName: z.string().min(2),
  guardianPhone: z.string().min(11).max(15),
  guardianCNIC: z.string().length(13, 'CNIC must be exactly 13 digits'),
  guardianAddress: z.string().min(10),
  monthlyIncome: z.number().nonnegative('Monthly income must be non-negative'),
  familyMembers: z.number().int().min(1, 'Must have at least 1 family member'),
  educationLevel: z.string().min(2).max(50),
  schoolName: z.string().min(2).optional(),
  healthCondition: z.string().optional(),
  fatherStatus: z.enum(['DECEASED', 'UNKNOWN', 'ABSENT'], {
    required_error: 'Father status is required',
  }),
  motherStatus: z.enum(['DECEASED', 'ALIVE', 'UNKNOWN', 'ABSENT'], {
    required_error: 'Mother status is required',
  }),
  additionalNotes: z.string().optional(),
});
