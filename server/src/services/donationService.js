import { PrismaClient } from '@prisma/client';
import { ApiError } from '../utils/ApiResponse.js';

const prisma = new PrismaClient();

// ============================================
// QURBANI DONATION
// ============================================

export async function createQurbaniDonation(userId, donationData) {
  const { deliveryDate, paymentMarked = false, ...rest } = donationData;

  // Cash donation — auto-confirm when the donor marks payment so admin
  // doesn't have to approve every cash gift. Admin still sees the record
  // (with screenshot) for reconciliation.
  const donation = await prisma.qurbaniDonation.create({
    data: {
      userId,
      ...rest,
      deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
      paymentMarked,
      paymentMarkedAt: paymentMarked ? new Date() : null,
      status: paymentMarked ? 'confirmed' : 'pending',
    },
  });

  return donation;
}

export async function getUserQurbaniDonations(userId) {
  const donations = await prisma.qurbaniDonation.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  return donations;
}

// ============================================
// RATION DONATION
// ============================================

export async function createRationDonation(userId, donationData) {
  const { paymentMarked = false, ...rest } = donationData;
  // Cash donation — auto-confirm on payment so admin doesn't have to
  // approve. Distribution side is still tracked separately by ops.
  const donation = await prisma.rationDonation.create({
    data: {
      userId,
      ...rest,
      paymentMarked,
      paymentMarkedAt: paymentMarked ? new Date() : null,
      status: paymentMarked ? 'confirmed' : 'pending',
    },
  });

  return donation;
}

export async function getUserRationDonations(userId) {
  const donations = await prisma.rationDonation.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  return donations;
}

// ============================================
// SKIN COLLECTION
// ============================================

export async function createSkinCollection(userId, collectionData) {
  const { preferredDate, ...rest } = collectionData;

  const collection = await prisma.skinCollection.create({
    data: {
      userId,
      ...rest,
      preferredDate: new Date(preferredDate),
    },
  });

  return collection;
}

export async function getUserSkinCollections(userId) {
  const collections = await prisma.skinCollection.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  return collections;
}

// ============================================
// ORPHAN SPONSORSHIP
// ============================================

export async function createOrphanSponsorship(userId, sponsorshipData) {
  const { startDate, paymentMarked = false, ...rest } = sponsorshipData;

  // Auto-confirm — first-month cash payment lands as a confirmed record.
  // Recipient assignment is handled out-of-band by the ops team.
  const sponsorship = await prisma.orphanSponsorship.create({
    data: {
      userId,
      ...rest,
      startDate: startDate ? new Date(startDate) : null,
      paymentMarked,
      paymentMarkedAt: paymentMarked ? new Date() : null,
      status: paymentMarked ? 'confirmed' : 'pending',
    },
  });

  return sponsorship;
}

export async function getUserOrphanSponsorships(userId) {
  const sponsorships = await prisma.orphanSponsorship.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  return sponsorships;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

export async function getDonationById(type, id, userId) {
  let donation;

  switch (type) {
    case 'qurbani':
      donation = await prisma.qurbaniDonation.findFirst({
        where: { id: parseInt(id), userId },
      });
      break;
    case 'ration':
      donation = await prisma.rationDonation.findFirst({
        where: { id: parseInt(id), userId },
      });
      break;
    case 'skin':
      donation = await prisma.skinCollection.findFirst({
        where: { id: parseInt(id), userId },
      });
      break;
    case 'orphan':
      donation = await prisma.orphanSponsorship.findFirst({
        where: { id: parseInt(id), userId },
      });
      break;
    default:
      throw new ApiError(400, 'Invalid donation type');
  }

  if (!donation) {
    throw new ApiError(404, 'Donation not found');
  }

  return donation;
}

export default {
  createQurbaniDonation,
  getUserQurbaniDonations,
  createRationDonation,
  getUserRationDonations,
  createSkinCollection,
  getUserSkinCollections,
  createOrphanSponsorship,
  getUserOrphanSponsorships,
  getDonationById,
};
