import { PrismaClient } from '@prisma/client';
import { ApiError } from '../utils/ApiResponse.js';
import { sendStatusEmail } from './emailService.js';

const prisma = new PrismaClient();

const userInclude = {
  user: { select: { id: true, email: true, fullName: true, phoneNumber: true } },
};

// ============================================
// SADQA (generic donation)
// ============================================

export async function createSadqa(userId, data) {
  const {
    donorName,
    donorPhone,
    donorEmail,
    amount,
    purpose,
    notes,
    paymentMarked = false,
    paymentScreenshotUrl = null,
  } = data;

  // Cash donation — auto-confirm on payment so admin doesn't have to
  // approve every sadqa. Admin still sees the record for reconciliation.
  return prisma.sadqa.create({
    data: {
      userId,
      donorName,
      donorPhone,
      donorEmail: donorEmail || null,
      amount,
      purpose: purpose || null,
      notes: notes || null,
      paymentMarked,
      paymentMarkedAt: paymentMarked ? new Date() : null,
      paymentScreenshotUrl: paymentScreenshotUrl || null,
      status: paymentMarked ? 'confirmed' : 'pending',
    },
  });
}

export async function getUserSadqas(userId) {
  return prisma.sadqa.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getAllSadqas() {
  return prisma.sadqa.findMany({
    include: userInclude,
    orderBy: { createdAt: 'desc' },
  });
}

export async function updateSadqaStatus(id, status) {
  const sadqaId = parseInt(id);
  const existing = await prisma.sadqa.findUnique({ where: { id: sadqaId } });
  if (!existing) throw new ApiError(404, 'Sadqa donation not found');

  const record = await prisma.sadqa.update({
    where: { id: sadqaId },
    data: { status },
    include: userInclude,
  });

  if (record.user?.email) {
    await sendStatusEmail({
      to: record.user.email,
      fullName: record.user.fullName,
      recordType: 'sadqa',
      status,
    });
  }

  return record;
}

// ============================================
// DISASTER DONATION
// ============================================

export async function createDisasterDonation(userId, data) {
  const {
    donorName,
    donorPhone,
    donorEmail,
    campaignKey,
    campaignLabel,
    amount,
    notes,
    paymentMarked = false,
    paymentScreenshotUrl = null,
  } = data;

  // Cash donation — auto-confirm on payment so admin doesn't have to
  // approve every campaign donation. Admin still sees the record for
  // reconciliation + campaign reporting.
  return prisma.disasterDonation.create({
    data: {
      userId,
      donorName,
      donorPhone,
      donorEmail: donorEmail || null,
      campaignKey,
      campaignLabel,
      amount,
      notes: notes || null,
      paymentMarked,
      paymentMarkedAt: paymentMarked ? new Date() : null,
      paymentScreenshotUrl: paymentScreenshotUrl || null,
      status: paymentMarked ? 'confirmed' : 'pending',
    },
  });
}

export async function getUserDisasterDonations(userId) {
  return prisma.disasterDonation.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getAllDisasterDonations() {
  return prisma.disasterDonation.findMany({
    include: userInclude,
    orderBy: { createdAt: 'desc' },
  });
}

export async function updateDisasterDonationStatus(id, status) {
  const donationId = parseInt(id);
  const existing = await prisma.disasterDonation.findUnique({
    where: { id: donationId },
  });
  if (!existing) throw new ApiError(404, 'Disaster donation not found');

  const record = await prisma.disasterDonation.update({
    where: { id: donationId },
    data: { status },
    include: userInclude,
  });

  if (record.user?.email) {
    await sendStatusEmail({
      to: record.user.email,
      fullName: record.user.fullName,
      recordType: 'disasterDonation',
      status,
    });
  }

  return record;
}

export default {
  createSadqa,
  getUserSadqas,
  getAllSadqas,
  updateSadqaStatus,
  createDisasterDonation,
  getUserDisasterDonations,
  getAllDisasterDonations,
  updateDisasterDonationStatus,
};
