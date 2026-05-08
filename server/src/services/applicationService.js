import { PrismaClient } from '@prisma/client';
import { ApiError } from '../utils/ApiResponse.js';
import { getUserContactInfo } from '../utils/userIdentity.js';

const prisma = new PrismaClient();

function ensureCnic(contact) {
  if (!contact.cnic) {
    throw new ApiError(
      400,
      'Your account is missing a CNIC. Please add one in Settings before submitting this application.'
    );
  }
  return contact.cnic;
}

// ============================================
// LOAN APPLICATION SERVICE
// ============================================

export async function createLoanApplication(userId, applicationData) {
  const { guarantorName, guarantorPhone, guarantorCNIC, guarantorAddress, ...rest } =
    applicationData;
  const contact = await getUserContactInfo(userId);

  const application = await prisma.loanApplication.create({
    data: {
      userId,
      ...rest,
      applicantPhone: contact.phoneNumber,
      applicantCNIC: ensureCnic(contact),
      guarantorName: guarantorName || null,
      guarantorPhone: guarantorPhone || null,
      guarantorCNIC: guarantorCNIC || null,
      guarantorAddress: guarantorAddress || null,
    },
  });

  return application;
}

export async function getUserLoanApplications(userId) {
  const applications = await prisma.loanApplication.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  return applications;
}

// ============================================
// RAMADAN RATION SERVICE
// ============================================

export async function createRamadanRationApplication(userId, applicationData) {
  const { disabilityDetails, ...rest } = applicationData;
  const contact = await getUserContactInfo(userId);

  const application = await prisma.ramadanRationApplication.create({
    data: {
      userId,
      ...rest,
      applicantPhone: contact.phoneNumber,
      applicantCNIC: ensureCnic(contact),
      disabilityDetails: disabilityDetails || null,
    },
  });

  return application;
}

export async function getUserRamadanRationApplications(userId) {
  const applications = await prisma.ramadanRationApplication.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  return applications;
}

// ============================================
// ORPHAN REGISTRATION SERVICE
// ============================================

export async function createOrphanRegistration(userId, registrationData) {
  const { schoolName, healthCondition, ...rest } = registrationData;
  const contact = await getUserContactInfo(userId);

  const registration = await prisma.orphanRegistration.create({
    data: {
      userId,
      ...rest,
      guardianPhone: contact.phoneNumber,
      guardianCNIC: ensureCnic(contact),
      schoolName: schoolName || null,
      healthCondition: healthCondition || null,
    },
  });

  return registration;
}

export async function getUserOrphanRegistrations(userId) {
  const registrations = await prisma.orphanRegistration.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  return registrations;
}
