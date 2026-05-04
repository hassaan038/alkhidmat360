import { PrismaClient } from '@prisma/client';
import { ApiError } from '../utils/ApiResponse.js';
import { sendStatusEmail } from './emailService.js';

const prisma = new PrismaClient();

const userInclude = {
  user: { select: { id: true, email: true, fullName: true, phoneNumber: true } },
};

export async function createFitrana(userId, data) {
  const {
    numberOfPeople,
    calculationBasis,
    amountPerPerson,
    contactPhone,
    notes,
    paymentMarked = false,
    paymentScreenshotUrl = null,
  } = data;

  if (!numberOfPeople || numberOfPeople < 1) {
    throw new ApiError(400, 'numberOfPeople must be at least 1');
  }
  if (amountPerPerson == null || Number(amountPerPerson) <= 0) {
    throw new ApiError(400, 'amountPerPerson must be greater than 0');
  }

  const totalAmount = Number(numberOfPeople) * Number(amountPerPerson);

  // Religious obligation (not a free-form gift) — admin verifies the
  // payment before confirming, so status stays 'pending' regardless of
  // paymentMarked. Admin's Confirm/Reject UI handles the rest.
  return prisma.fitrana.create({
    data: {
      userId,
      numberOfPeople,
      calculationBasis,
      amountPerPerson,
      totalAmount,
      contactPhone: contactPhone || null,
      notes: notes || null,
      paymentMarked,
      paymentMarkedAt: paymentMarked ? new Date() : null,
      paymentScreenshotUrl: paymentScreenshotUrl || null,
    },
  });
}

export async function getUserFitranas(userId) {
  return prisma.fitrana.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getAllFitranas() {
  return prisma.fitrana.findMany({
    include: userInclude,
    orderBy: { createdAt: 'desc' },
  });
}

export async function updateFitranaStatus(id, status) {
  const fitranaId = parseInt(id);
  const existing = await prisma.fitrana.findUnique({ where: { id: fitranaId } });
  if (!existing) throw new ApiError(404, 'Fitrana record not found');

  const record = await prisma.fitrana.update({
    where: { id: fitranaId },
    data: { status },
    include: userInclude,
  });

  if (record.user?.email) {
    await sendStatusEmail({
      to: record.user.email,
      fullName: record.user.fullName,
      recordType: 'fitrana',
      status,
    });
  }

  return record;
}

export default {
  createFitrana,
  getUserFitranas,
  getAllFitranas,
  updateFitranaStatus,
};
