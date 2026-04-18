import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { ApiError } from '../utils/ApiResponse.js';

const prisma = new PrismaClient();

// ============================================
// PROFILE / SETTINGS
// ============================================

const PROFILE_SELECT = {
  id: true,
  email: true,
  fullName: true,
  phoneNumber: true,
  cnic: true,
  userType: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
};

export async function getProfile(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: PROFILE_SELECT,
  });
  if (!user) throw new ApiError(404, 'User not found');
  return user;
}

export async function updateProfile(userId, data) {
  const { fullName, email, phoneNumber, cnic } = data;

  // Email uniqueness check (if changing)
  if (email !== undefined) {
    const existing = await prisma.user.findFirst({
      where: { email, NOT: { id: userId } },
    });
    if (existing) throw new ApiError(400, 'Email already in use');
  }

  // CNIC uniqueness check (if provided and changing)
  if (cnic) {
    const existing = await prisma.user.findFirst({
      where: { cnic, NOT: { id: userId } },
    });
    if (existing) throw new ApiError(400, 'CNIC already in use');
  }

  return prisma.user.update({
    where: { id: userId },
    data: {
      ...(fullName !== undefined && { fullName }),
      ...(email !== undefined && { email }),
      ...(phoneNumber !== undefined && { phoneNumber }),
      ...(cnic !== undefined && { cnic: cnic || null }),
    },
    select: PROFILE_SELECT,
  });
}

export async function changePassword(userId, currentPassword, newPassword) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new ApiError(404, 'User not found');

  const ok = await bcrypt.compare(currentPassword, user.password);
  if (!ok) throw new ApiError(401, 'Current password is incorrect');

  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashed },
  });
  return { ok: true };
}

export async function deleteAccount(userId, password) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new ApiError(404, 'User not found');

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) throw new ApiError(401, 'Password is incorrect');

  // Cascade is configured at the schema level — deleting the user wipes
  // all of their related records (donations, applications, bookings, etc).
  await prisma.user.delete({ where: { id: userId } });
  return { ok: true };
}

/**
 * Get user-specific dashboard statistics based on user type
 */
export async function getUserDashboardStats(userId, userType) {
  let stats = {
    totalSubmissions: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  };

  try {
    if (userType === 'DONOR') {
      // Count all donation types for this donor
      const [qurbani, ration, skin, orphan] = await Promise.all([
        prisma.qurbaniDonation.findMany({ where: { userId } }),
        prisma.rationDonation.findMany({ where: { userId } }),
        prisma.skinCollection.findMany({ where: { userId } }),
        prisma.orphanSponsorship.findMany({ where: { userId } }),
      ]);

      const allDonations = [...qurbani, ...ration, ...skin, ...orphan];

      stats.totalSubmissions = allDonations.length;
      stats.pending = allDonations.filter(d => d.status === 'pending').length;
      stats.approved = allDonations.filter(d => d.status === 'approved' || d.status === 'confirmed').length;
      stats.rejected = allDonations.filter(d => d.status === 'rejected').length;

    } else if (userType === 'BENEFICIARY') {
      // Count all application types for this beneficiary
      const [loans, rations, orphans] = await Promise.all([
        prisma.loanApplication.findMany({ where: { userId } }),
        prisma.ramadanRationApplication.findMany({ where: { userId } }),
        prisma.orphanRegistration.findMany({ where: { userId } }),
      ]);

      const allApplications = [...loans, ...rations, ...orphans];

      stats.totalSubmissions = allApplications.length;
      stats.pending = allApplications.filter(a => a.status === 'pending').length;
      stats.approved = allApplications.filter(a => a.status === 'approved').length;
      stats.rejected = allApplications.filter(a => a.status === 'rejected').length;

    } else if (userType === 'VOLUNTEER') {
      // Count all volunteer task registrations
      const tasks = await prisma.volunteerTask.findMany({
        where: { userId }
      });

      stats.totalSubmissions = tasks.length;
      stats.pending = tasks.filter(t => t.status === 'pending').length;
      stats.approved = tasks.filter(t => t.status === 'approved').length;
      stats.rejected = tasks.filter(t => t.status === 'rejected').length;
    }

    return stats;
  } catch (error) {
    console.error('Error fetching user stats:', error);
    throw error;
  }
}

/**
 * Get user's recent activities
 */
export async function getUserRecentActivities(userId, userType, limit = 10) {
  try {
    let activities = [];

    if (userType === 'DONOR') {
      const [qurbani, ration, skin, orphan] = await Promise.all([
        prisma.qurbaniDonation.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: limit,
        }),
        prisma.rationDonation.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: limit,
        }),
        prisma.skinCollection.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: limit,
        }),
        prisma.orphanSponsorship.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: limit,
        }),
      ]);

      activities = [
        ...qurbani.map(d => ({ ...d, type: 'Qurbani Donation' })),
        ...ration.map(d => ({ ...d, type: 'Ration Donation' })),
        ...skin.map(d => ({ ...d, type: 'Skin Collection' })),
        ...orphan.map(d => ({ ...d, type: 'Orphan Sponsorship' })),
      ];

    } else if (userType === 'BENEFICIARY') {
      const [loans, rations, orphans] = await Promise.all([
        prisma.loanApplication.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: limit,
        }),
        prisma.ramadanRationApplication.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: limit,
        }),
        prisma.orphanRegistration.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: limit,
        }),
      ]);

      activities = [
        ...loans.map(a => ({ ...a, type: 'Loan Application' })),
        ...rations.map(a => ({ ...a, type: 'Ramadan Ration Application' })),
        ...orphans.map(a => ({ ...a, type: 'Orphan Registration' })),
      ];

    } else if (userType === 'VOLUNTEER') {
      const tasks = await prisma.volunteerTask.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });

      activities = tasks.map(t => ({ ...t, type: 'Volunteer Task' }));
    }

    // Sort by createdAt and limit
    activities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return activities.slice(0, limit);

  } catch (error) {
    console.error('Error fetching user activities:', error);
    throw error;
  }
}
