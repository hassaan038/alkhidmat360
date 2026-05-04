import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { ApiError } from '../utils/ApiResponse.js';
import { sendStatusEmail } from './emailService.js';

const prisma = new PrismaClient();

const userInclude = {
  user: { select: { id: true, email: true, fullName: true } },
};

async function notify(record, recordType, status) {
  if (record?.user?.email) {
    await sendStatusEmail({
      to: record.user.email,
      fullName: record.user.fullName,
      recordType,
      status,
    });
  }
}

// ============================================
// ADMIN DASHBOARD STATISTICS
// ============================================

export async function getDashboardStats() {
  const [
    totalDonations,
    totalApplications,
    totalVolunteers,
    pendingDonations,
    pendingApplications,
    pendingVolunteers,
    qurbani,
    ration,
    skin,
    sponsorship,
    loan,
    ramadan,
    orphan,
    qurbaniListings,
    qurbaniHissaBookings,
    qurbaniPendingBookings,
  ] = await Promise.all([
    // Total donations across all types
    Promise.all([
      prisma.qurbaniDonation.count(),
      prisma.rationDonation.count(),
      prisma.skinCollection.count(),
      prisma.orphanSponsorship.count(),
    ]).then((counts) => counts.reduce((sum, count) => sum + count, 0)),

    // Total applications across all types
    Promise.all([
      prisma.loanApplication.count(),
      prisma.ramadanRationApplication.count(),
      prisma.orphanRegistration.count(),
    ]).then((counts) => counts.reduce((sum, count) => sum + count, 0)),

    // Total volunteer tasks
    prisma.volunteerTask.count(),

    // Pending donations
    Promise.all([
      prisma.qurbaniDonation.count({ where: { status: 'pending' } }),
      prisma.rationDonation.count({ where: { status: 'pending' } }),
      prisma.skinCollection.count({ where: { status: 'pending' } }),
      prisma.orphanSponsorship.count({ where: { status: 'pending' } }),
    ]).then((counts) => counts.reduce((sum, count) => sum + count, 0)),

    // Pending applications
    Promise.all([
      prisma.loanApplication.count({ where: { status: 'pending' } }),
      prisma.ramadanRationApplication.count({ where: { status: 'pending' } }),
      prisma.orphanRegistration.count({ where: { status: 'pending' } }),
    ]).then((counts) => counts.reduce((sum, count) => sum + count, 0)),

    // Pending volunteer tasks
    prisma.volunteerTask.count({ where: { status: 'pending' } }),

    // Per-type donation counts
    prisma.qurbaniDonation.count(),
    prisma.rationDonation.count(),
    prisma.skinCollection.count(),
    prisma.orphanSponsorship.count(),

    // Per-type application counts
    prisma.loanApplication.count(),
    prisma.ramadanRationApplication.count(),
    prisma.orphanRegistration.count(),

    // Qurbani module counts
    prisma.qurbaniListing.count(),
    prisma.qurbaniHissaBooking.count(),
    prisma.qurbaniHissaBooking.count({ where: { status: 'pending' } }),
  ]);

  return {
    totalDonations,
    totalApplications,
    totalVolunteers,
    pendingDonations,
    pendingApplications,
    pendingVolunteers,
    donationsByType: { qurbani, ration, skin, sponsorship },
    applicationsByType: { loan, ramadan, orphan },
    qurbaniModule: {
      listings: qurbaniListings,
      bookings: qurbaniHissaBookings,
      pendingBookings: qurbaniPendingBookings,
    },
  };
}

// ============================================
// DONATION MANAGEMENT
// ============================================

export async function getAllQurbaniDonations() {
  return await prisma.qurbaniDonation.findMany({
    include: {
      user: {
        select: { id: true, email: true, fullName: true, phoneNumber: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getAllRationDonations() {
  return await prisma.rationDonation.findMany({
    include: {
      user: {
        select: { id: true, email: true, fullName: true, phoneNumber: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getAllSkinCollections() {
  return await prisma.skinCollection.findMany({
    include: {
      user: {
        select: { id: true, email: true, fullName: true, phoneNumber: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getAllOrphanSponsorships() {
  return await prisma.orphanSponsorship.findMany({
    include: {
      user: {
        select: { id: true, email: true, fullName: true, phoneNumber: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

// ============================================
// APPLICATION MANAGEMENT
// ============================================

export async function getAllLoanApplications() {
  return await prisma.loanApplication.findMany({
    include: {
      user: {
        select: { id: true, email: true, fullName: true, phoneNumber: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getAllRamadanRationApplications() {
  return await prisma.ramadanRationApplication.findMany({
    include: {
      user: {
        select: { id: true, email: true, fullName: true, phoneNumber: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getAllOrphanRegistrations() {
  return await prisma.orphanRegistration.findMany({
    include: {
      user: {
        select: { id: true, email: true, fullName: true, phoneNumber: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

// ============================================
// VOLUNTEER MANAGEMENT
// ============================================

export async function getAllVolunteerTasks() {
  return await prisma.volunteerTask.findMany({
    include: {
      user: {
        select: { id: true, email: true, fullName: true, phoneNumber: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getAllVolunteers() {
  return await prisma.user.findMany({
    where: {
      userType: 'VOLUNTEER',
    },
    select: {
      id: true,
      email: true,
      fullName: true,
      phoneNumber: true,
      cnic: true,
      isActive: true,
      createdAt: true,
      volunteerTasks: {
        select: {
          id: true,
          taskCategory: true,
          status: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

// ============================================
// STATUS UPDATE FUNCTIONS
// ============================================

export async function updateQurbaniDonationStatus(id, status) {
  const record = await prisma.qurbaniDonation.update({
    where: { id: parseInt(id) },
    data: { status },
    include: userInclude,
  });
  await notify(record, 'qurbaniDonation', status);
  return record;
}

export async function updateRationDonationStatus(id, status) {
  const record = await prisma.rationDonation.update({
    where: { id: parseInt(id) },
    data: { status },
    include: userInclude,
  });
  await notify(record, 'rationDonation', status);
  return record;
}

export async function updateSkinCollectionStatus(id, status) {
  const record = await prisma.skinCollection.update({
    where: { id: parseInt(id) },
    data: { status },
    include: userInclude,
  });
  await notify(record, 'skinCollection', status);
  return record;
}

export async function updateOrphanSponsorshipStatus(id, status) {
  const record = await prisma.orphanSponsorship.update({
    where: { id: parseInt(id) },
    data: { status },
    include: userInclude,
  });
  await notify(record, 'orphanSponsorship', status);
  return record;
}

export async function updateLoanApplicationStatus(id, status) {
  const record = await prisma.loanApplication.update({
    where: { id: parseInt(id) },
    data: { status },
    include: userInclude,
  });
  await notify(record, 'loanApplication', status);
  return record;
}

export async function updateRamadanRationApplicationStatus(id, status) {
  const record = await prisma.ramadanRationApplication.update({
    where: { id: parseInt(id) },
    data: { status },
    include: userInclude,
  });
  await notify(record, 'ramadanRationApplication', status);
  return record;
}

export async function updateOrphanRegistrationStatus(id, status) {
  const record = await prisma.orphanRegistration.update({
    where: { id: parseInt(id) },
    data: { status },
    include: userInclude,
  });
  await notify(record, 'orphanRegistration', status);
  return record;
}

export async function updateVolunteerTaskStatus(id, status) {
  const record = await prisma.volunteerTask.update({
    where: { id: parseInt(id) },
    data: { status },
    include: userInclude,
  });
  await notify(record, 'volunteerTask', status);
  return record;
}

// ============================================
// ADMIN USER MANAGEMENT
// ============================================

export async function createAdminUser(adminData) {
  // Check if email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: adminData.email },
  });

  if (existingUser) {
    throw new ApiError(400, 'Email already exists');
  }

  // Check if CNIC exists (if provided)
  if (adminData.cnic) {
    const existingCnic = await prisma.user.findUnique({
      where: { cnic: adminData.cnic },
    });

    if (existingCnic) {
      throw new ApiError(400, 'CNIC already exists');
    }
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(adminData.password, 10);

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      email: adminData.email,
      password: hashedPassword,
      fullName: adminData.fullName,
      phoneNumber: adminData.phoneNumber,
      cnic: adminData.cnic || null,
      userType: 'ADMIN',
      isActive: true,
    },
  });

  // Remove password from response
  const { password, ...adminWithoutPassword } = admin;
  return adminWithoutPassword;
}

// ============================================
// USER MANAGEMENT
// ============================================

export async function getAllUsers() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      fullName: true,
      phoneNumber: true,
      cnic: true,
      userType: true,
      isActive: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const counts = {
    total: users.length,
    donors: users.filter(u => u.userType === 'DONOR').length,
    beneficiaries: users.filter(u => u.userType === 'BENEFICIARY').length,
    volunteers: users.filter(u => u.userType === 'VOLUNTEER').length,
    admins: users.filter(u => u.userType === 'ADMIN').length,
  };

  return { users, counts };
}
