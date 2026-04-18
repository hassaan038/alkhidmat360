import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
