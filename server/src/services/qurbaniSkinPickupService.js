import { PrismaClient } from '@prisma/client';
import { ApiError } from '../utils/ApiResponse.js';

const prisma = new PrismaClient();

const userInclude = {
  user: { select: { id: true, email: true, fullName: true, phoneNumber: true } },
};

function buildPickupData(userId, data) {
  const {
    contactPhone,
    address,
    latitude,
    longitude,
    numberOfSkins = 1,
    preferredDate,
    additionalDetails,
  } = data;

  return {
    userId,
    contactPhone,
    address,
    latitude: latitude != null ? latitude : null,
    longitude: longitude != null ? longitude : null,
    numberOfSkins,
    preferredDate: preferredDate ? new Date(preferredDate) : null,
    additionalDetails: additionalDetails || null,
  };
}

export async function createPickup(userId, data) {
  return prisma.qurbaniSkinPickup.create({
    data: buildPickupData(userId, data),
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

  return prisma.qurbaniSkinPickup.update({
    where: { id: pickupId },
    data: { status },
  });
}

export default {
  createPickup,
  getUserPickups,
  getAllPickups,
  updatePickupStatus,
};
