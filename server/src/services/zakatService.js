import { PrismaClient } from '@prisma/client';
import { ApiError } from '../utils/ApiResponse.js';
import { sendStatusEmail } from './emailService.js';

const prisma = new PrismaClient();

const userInclude = {
  user: { select: { id: true, email: true, fullName: true, phoneNumber: true } },
};

// ============================================
// ZAKAT PAYMENT (DONOR)
// ============================================

export async function createZakatPayment(userId, data) {
  const {
    cashSavings = 0,
    goldGrams = 0,
    goldValue = 0,
    silverGrams = 0,
    silverValue = 0,
    investments = 0,
    businessAssets = 0,
    otherAssets = 0,
    liabilities = 0,
    nisabBasis,
    nisabThreshold,
    totalWealth,
    zakatAmount,
    contactPhone,
    notes,
    paymentMarked = false,
    paymentScreenshotUrl = null,
  } = data;

  if (!nisabBasis) throw new ApiError(400, 'nisabBasis is required');
  if (zakatAmount == null) throw new ApiError(400, 'zakatAmount is required');

  // Religious obligation (not a free-form gift) — admin verifies the
  // payment before confirming, so status stays 'pending' regardless of
  // paymentMarked. Admin's Confirm/Reject UI handles the rest.
  return prisma.zakatPayment.create({
    data: {
      userId,
      cashSavings,
      goldGrams,
      goldValue,
      silverGrams,
      silverValue,
      investments,
      businessAssets,
      otherAssets,
      liabilities,
      nisabBasis,
      nisabThreshold,
      totalWealth,
      zakatAmount,
      contactPhone: contactPhone || null,
      notes: notes || null,
      paymentMarked,
      paymentMarkedAt: paymentMarked ? new Date() : null,
      paymentScreenshotUrl: paymentScreenshotUrl || null,
    },
  });
}

export async function getUserZakatPayments(userId) {
  return prisma.zakatPayment.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getAllZakatPayments() {
  return prisma.zakatPayment.findMany({
    include: userInclude,
    orderBy: { createdAt: 'desc' },
  });
}

export async function updateZakatPaymentStatus(id, status) {
  const paymentId = parseInt(id);
  const existing = await prisma.zakatPayment.findUnique({ where: { id: paymentId } });
  if (!existing) throw new ApiError(404, 'Zakat payment not found');

  const record = await prisma.zakatPayment.update({
    where: { id: paymentId },
    data: { status },
    include: userInclude,
  });

  if (record.user?.email) {
    await sendStatusEmail({
      to: record.user.email,
      fullName: record.user.fullName,
      recordType: 'zakatPayment',
      status,
    });
  }

  return record;
}

// ============================================
// ZAKAT APPLICATION (BENEFICIARY)
// ============================================

export async function createZakatApplication(userId, data) {
  const {
    applicantName,
    applicantPhone,
    applicantCNIC,
    applicantAddress,
    familyMembers,
    monthlyIncome,
    employmentStatus,
    housingStatus,
    hasDisabledMembers,
    disabilityDetails,
    reasonForApplication,
    amountRequested,
    additionalNotes,
    cnicDocumentUrl,
  } = data;

  return prisma.zakatApplication.create({
    data: {
      userId,
      applicantName,
      applicantPhone,
      applicantCNIC,
      applicantAddress,
      familyMembers,
      monthlyIncome,
      employmentStatus,
      housingStatus,
      hasDisabledMembers,
      disabilityDetails: disabilityDetails || null,
      reasonForApplication,
      amountRequested: amountRequested != null ? amountRequested : null,
      additionalNotes: additionalNotes || null,
      cnicDocumentUrl: cnicDocumentUrl || null,
    },
  });
}

export async function getUserZakatApplications(userId) {
  return prisma.zakatApplication.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getAllZakatApplications() {
  return prisma.zakatApplication.findMany({
    include: userInclude,
    orderBy: { createdAt: 'desc' },
  });
}

export async function updateZakatApplicationStatus(id, status) {
  const appId = parseInt(id);
  const existing = await prisma.zakatApplication.findUnique({ where: { id: appId } });
  if (!existing) throw new ApiError(404, 'Zakat application not found');

  const record = await prisma.zakatApplication.update({
    where: { id: appId },
    data: { status },
    include: userInclude,
  });

  if (record.user?.email) {
    await sendStatusEmail({
      to: record.user.email,
      fullName: record.user.fullName,
      recordType: 'zakatApplication',
      status,
    });
  }

  return record;
}

export default {
  createZakatPayment,
  getUserZakatPayments,
  getAllZakatPayments,
  updateZakatPaymentStatus,
  createZakatApplication,
  getUserZakatApplications,
  getAllZakatApplications,
  updateZakatApplicationStatus,
};
