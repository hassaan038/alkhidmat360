import { PrismaClient } from '@prisma/client';
import { ApiError } from '../utils/ApiResponse.js';
import { getUserContactInfo } from '../utils/userIdentity.js';
import { sendStatusEmail } from './emailService.js';

const prisma = new PrismaClient();

const userInclude = {
  user: { select: { id: true, email: true, fullName: true, phoneNumber: true } },
};

export async function createPickup(userId, data) {
  const {
    address,
    latitude,
    longitude,
    numberOfSkins = 1,
    preferredDate,
    additionalDetails,
    housePhotoUrl,
  } = data;
  const contact = await getUserContactInfo(userId);

  return prisma.qurbaniSkinPickup.create({
    data: {
      userId,
      contactPhone: contact.phoneNumber,
      address: (address || '').trim(),
      latitude: latitude != null ? latitude : null,
      longitude: longitude != null ? longitude : null,
      numberOfSkins,
      preferredDate: preferredDate ? new Date(preferredDate) : null,
      additionalDetails: additionalDetails || null,
      housePhotoUrl: housePhotoUrl || null,
    },
  });
}

export async function getUserPickups(userId) {
  return prisma.qurbaniSkinPickup.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getAllPickups() {
  return prisma.qurbaniSkinPickup.findMany({
    include: userInclude,
    orderBy: { createdAt: 'desc' },
  });
}

export async function updatePickupStatus(id, status) {
  const pickupId = parseInt(id);
  const existing = await prisma.qurbaniSkinPickup.findUnique({
    where: { id: pickupId },
  });
  if (!existing) throw new ApiError(404, 'Pickup request not found');

  const record = await prisma.qurbaniSkinPickup.update({
    where: { id: pickupId },
    data: { status },
    include: userInclude,
  });

  if (record.user?.email) {
    await sendStatusEmail({
      to: record.user.email,
      fullName: record.user.fullName,
      recordType: 'qurbaniSkinPickup',
      status,
    });
  }

  return record;
}

export default {
  createPickup,
  getUserPickups,
  getAllPickups,
  updatePickupStatus,
};
