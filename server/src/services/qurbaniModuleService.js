import { PrismaClient, Prisma } from '@prisma/client';
import { ApiError } from '../utils/ApiResponse.js';
import { sendStatusEmail } from './emailService.js';

const prisma = new PrismaClient();

// ============================================
// HELPERS
// ============================================

const ACTIVE_BOOKING_STATUSES = ['pending', 'confirmed'];

function parseDedications(booking) {
  if (!booking) return booking;
  let parsed = [];
  try {
    parsed = typeof booking.dedications === 'string' ? JSON.parse(booking.dedications) : booking.dedications || [];
  } catch {
    parsed = [];
  }
  return { ...booking, dedications: Array.isArray(parsed) ? parsed : [] };
}

/**
 * Compute hissasBooked (sum of hissaCount for pending + confirmed bookings)
 * and hissasAvailable for a single listing.
 * Accepts either the default `prisma` client or a transaction client.
 */
async function attachAvailability(listing, client = prisma) {
  if (!listing) return listing;

  const agg = await client.qurbaniHissaBooking.aggregate({
    where: {
      listingId: listing.id,
      status: { in: ACTIVE_BOOKING_STATUSES },
    },
    _sum: { hissaCount: true },
  });

  const hissasBooked = agg._sum.hissaCount || 0;
  const hissasAvailable = Math.max(0, listing.totalHissas - hissasBooked);

  return {
    ...listing,
    hissasBooked,
    hissasAvailable,
  };
}

async function attachAvailabilityMany(listings, client = prisma) {
  return Promise.all(listings.map((l) => attachAvailability(l, client)));
}

// ============================================
// USER: LISTINGS
// ============================================

export async function listActiveListings() {
  const listings = await prisma.qurbaniListing.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { pickupDate: 'asc' },
  });

  return attachAvailabilityMany(listings);
}

export async function getListingById(id) {
  const listing = await prisma.qurbaniListing.findUnique({
    where: { id: parseInt(id) },
  });

  if (!listing) {
    throw new ApiError(404, 'Qurbani listing not found');
  }

  return attachAvailability(listing);
}

// ============================================
// USER: BOOKINGS
// ============================================

export async function createBooking(
  userId,
  { listingId, hissaCount, notes, paymentMarked = false, paymentScreenshotUrl = null }
) {
  try {
    const booking = await prisma.$transaction(
      async (tx) => {
        const listing = await tx.qurbaniListing.findUnique({
          where: { id: parseInt(listingId) },
        });

        if (!listing) {
          throw new ApiError(404, 'Qurbani listing not found');
        }

        if (listing.status !== 'ACTIVE') {
          throw new ApiError(
            409,
            'This listing is not available for booking'
          );
        }

        const agg = await tx.qurbaniHissaBooking.aggregate({
          where: {
            listingId: listing.id,
            status: { in: ACTIVE_BOOKING_STATUSES },
          },
          _sum: { hissaCount: true },
        });

        const alreadyBooked = agg._sum.hissaCount || 0;
        const nextBooked = alreadyBooked + hissaCount;

        if (nextBooked > listing.totalHissas) {
          throw new ApiError(409, 'Not enough hissas available');
        }

        const pricePerHissa = Number(listing.pricePerHissa);
        const totalAmount = pricePerHissa * hissaCount;

        const booking = await tx.qurbaniHissaBooking.create({
          data: {
            listingId: listing.id,
            userId,
            hissaCount,
            dedications: '[]',
            totalAmount,
            status: 'pending',
            notes: notes || null,
            paymentMarked,
            paymentMarkedAt: paymentMarked ? new Date() : null,
            paymentScreenshotUrl: paymentScreenshotUrl || null,
          },
        });

        // If we've filled the listing, mark it as FULL.
        if (nextBooked === listing.totalHissas) {
          await tx.qurbaniListing.update({
            where: { id: listing.id },
            data: { status: 'FULL' },
          });
        }

        return booking;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
    );
    return parseDedications(booking);
  } catch (err) {
    // Serialization conflicts should surface as 409 to the client so they can retry.
    if (
      err &&
      (err.code === 'P2034' /* transaction conflict */ ||
        /deadlock|serializ/i.test(err.message || ''))
    ) {
      throw new ApiError(
        409,
        'Booking conflict — please try again'
      );
    }
    throw err;
  }
}

export async function markBookingPaid(bookingId, userId, paymentScreenshotUrl = null) {
  const booking = await prisma.qurbaniHissaBooking.findUnique({
    where: { id: parseInt(bookingId) },
  });

  if (!booking) {
    throw new ApiError(404, 'Booking not found');
  }

  if (booking.userId !== userId) {
    throw new ApiError(403, 'You can only update your own bookings');
  }

  if (booking.status === 'rejected') {
    throw new ApiError(409, 'Cannot mark a rejected booking as paid');
  }

  if (booking.paymentMarked) {
    throw new ApiError(409, 'Payment has already been marked for this booking');
  }

  const updated = await prisma.qurbaniHissaBooking.update({
    where: { id: booking.id },
    data: {
      paymentMarked: true,
      paymentMarkedAt: new Date(),
      ...(paymentScreenshotUrl ? { paymentScreenshotUrl } : {}),
    },
  });
  return parseDedications(updated);
}

export async function getUserBookings(userId) {
  const bookings = await prisma.qurbaniHissaBooking.findMany({
    where: { userId },
    include: {
      listing: {
        select: {
          id: true,
          name: true,
          pickupDate: true,
          pickupLocation: true,
          pricePerHissa: true,
          photoUrl: true,
          status: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
  return bookings.map(parseDedications);
}

// ============================================
// ADMIN: LISTINGS
// ============================================

export async function getAllListings() {
  const listings = await prisma.qurbaniListing.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return attachAvailabilityMany(listings);
}

export async function createListing(data) {
  const {
    name,
    weightKg,
    totalHissas = 7,
    pricePerHissa,
    photoUrl,
    pickupDate,
    pickupLocation,
    description,
    status,
  } = data;

  if (!pickupDate) {
    throw new ApiError(400, 'pickupDate is required');
  }

  let resolvedName = name && name.trim() ? name.trim() : null;
  if (!resolvedName) {
    const count = await prisma.qurbaniListing.count();
    resolvedName = `Bull #${count + 1}`;
  }

  const listing = await prisma.qurbaniListing.create({
    data: {
      name: resolvedName,
      weightKg: weightKg != null ? weightKg : null,
      totalHissas,
      pricePerHissa,
      photoUrl: photoUrl || null,
      pickupDate: new Date(pickupDate),
      pickupLocation,
      description: description || null,
      status: status || 'DRAFT',
    },
  });

  return listing;
}

export async function updateListing(id, data) {
  const listingId = parseInt(id);
  const existing = await prisma.qurbaniListing.findUnique({
    where: { id: listingId },
  });

  if (!existing) {
    throw new ApiError(404, 'Qurbani listing not found');
  }

  const updateData = {};
  const assignable = [
    'name',
    'weightKg',
    'totalHissas',
    'pricePerHissa',
    'photoUrl',
    'pickupLocation',
    'description',
  ];

  for (const key of assignable) {
    if (data[key] !== undefined) updateData[key] = data[key];
  }

  if (data.pickupDate !== undefined) {
    updateData.pickupDate = new Date(data.pickupDate);
  }

  return prisma.qurbaniListing.update({
    where: { id: listingId },
    data: updateData,
  });
}

export async function deleteListing(id) {
  const listingId = parseInt(id);

  const listing = await prisma.qurbaniListing.findUnique({
    where: { id: listingId },
  });

  if (!listing) {
    throw new ApiError(404, 'Qurbani listing not found');
  }

  const bookingCount = await prisma.qurbaniHissaBooking.count({
    where: { listingId },
  });

  if (bookingCount > 0) {
    throw new ApiError(
      409,
      'Cannot delete a listing that has bookings'
    );
  }

  await prisma.qurbaniListing.delete({ where: { id: listingId } });
  return { id: listingId };
}

const ALLOWED_TRANSITIONS = {
  DRAFT: ['DRAFT', 'ACTIVE'],
  ACTIVE: ['ACTIVE', 'DRAFT', 'FULL', 'CLOSED'],
  FULL: ['FULL', 'CLOSED'],
  CLOSED: ['CLOSED'],
};

export async function updateListingStatus(id, status) {
  const listingId = parseInt(id);
  const listing = await prisma.qurbaniListing.findUnique({
    where: { id: listingId },
  });

  if (!listing) {
    throw new ApiError(404, 'Qurbani listing not found');
  }

  const allowed = ALLOWED_TRANSITIONS[listing.status] || [];
  if (!allowed.includes(status)) {
    throw new ApiError(
      400,
      `Cannot transition listing from ${listing.status} to ${status}`
    );
  }

  return prisma.qurbaniListing.update({
    where: { id: listingId },
    data: { status },
  });
}

// ============================================
// ADMIN: BOOKINGS
// ============================================

export async function getAllBookings() {
  const bookings = await prisma.qurbaniHissaBooking.findMany({
    include: {
      user: {
        select: { id: true, email: true, fullName: true, phoneNumber: true },
      },
      listing: {
        select: {
          id: true,
          name: true,
          pickupDate: true,
          pickupLocation: true,
          pricePerHissa: true,
          photoUrl: true,
          totalHissas: true,
          status: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
  return bookings.map(parseDedications);
}

export async function updateBookingStatus(id, status) {
  const bookingId = parseInt(id);
  const existing = await prisma.qurbaniHissaBooking.findUnique({
    where: { id: bookingId },
  });

  if (!existing) {
    throw new ApiError(404, 'Booking not found');
  }

  const updated = await prisma.qurbaniHissaBooking.update({
    where: { id: bookingId },
    data: { status },
    include: { user: { select: { id: true, email: true, fullName: true } } },
  });

  if (updated.user?.email) {
    await sendStatusEmail({
      to: updated.user.email,
      fullName: updated.user.fullName,
      recordType: 'qurbaniBooking',
      status,
    });
  }

  return parseDedications(updated);
}

export default {
  listActiveListings,
  getListingById,
  createBooking,
  markBookingPaid,
  getUserBookings,
  getAllListings,
  createListing,
  updateListing,
  deleteListing,
  updateListingStatus,
  getAllBookings,
  updateBookingStatus,
};
