import { PrismaClient } from '@prisma/client';
import { ApiError } from '../utils/ApiResponse.js';

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

  return prisma.sadqa.update({ where: { id: sadqaId }, data: { status } });
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

  return prisma.disasterDonation.update({
    where: { id: donationId },
    data: { status },
  });
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
