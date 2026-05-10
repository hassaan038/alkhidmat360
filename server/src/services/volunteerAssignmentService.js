import { PrismaClient } from '@prisma/client';
import { ApiError } from '../utils/ApiResponse.js';

const prisma = new PrismaClient();

const volunteerSelect = {
  id: true,
  email: true,
  fullName: true,
  phoneNumber: true,
};

const fullInclude = {
  volunteer: { select: volunteerSelect },
  assignedBy: { select: { id: true, email: true, fullName: true } },
};

// ============================================
// ADMIN — list everyone we can assign work to
// ============================================
export async function listAssignableVolunteers() {
  return prisma.user.findMany({
    where: { userType: 'VOLUNTEER', isActive: true },
    select: { ...volunteerSelect, createdAt: true },
    orderBy: { fullName: 'asc' },
  });
}

// ============================================
// ADMIN — CRUD assignments
// ============================================
export async function createAssignment(adminId, data) {
  const volunteer = await prisma.user.findUnique({
    where: { id: data.volunteerId },
  });
  if (!volunteer || volunteer.userType !== 'VOLUNTEER') {
    throw new ApiError(400, 'Selected user is not a volunteer');
  }

  return prisma.volunteerAssignment.create({
    data: {
      volunteerId: data.volunteerId,
      assignedById: adminId,
      title: data.title,
      description: data.description,
      category: data.category,
      priority: data.priority || 'normal',
      location: data.location || null,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
    },
    include: fullInclude,
  });
}

export async function listAllAssignments({ status, volunteerId } = {}) {
  return prisma.volunteerAssignment.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(volunteerId ? { volunteerId: Number(volunteerId) } : {}),
    },
    include: fullInclude,
    orderBy: { createdAt: 'desc' },
  });
}

export async function updateAssignment(id, data) {
  const existing = await prisma.volunteerAssignment.findUnique({
    where: { id: Number(id) },
  });
  if (!existing) throw new ApiError(404, 'Assignment not found');

  return prisma.volunteerAssignment.update({
    where: { id: existing.id },
    data: {
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.description !== undefined ? { description: data.description } : {}),
      ...(data.category !== undefined ? { category: data.category } : {}),
      ...(data.priority !== undefined ? { priority: data.priority } : {}),
      ...(data.location !== undefined ? { location: data.location || null } : {}),
      ...(data.dueDate !== undefined
        ? { dueDate: data.dueDate ? new Date(data.dueDate) : null }
        : {}),
    },
    include: fullInclude,
  });
}

export async function deleteAssignment(id) {
  const existing = await prisma.volunteerAssignment.findUnique({
    where: { id: Number(id) },
  });
  if (!existing) throw new ApiError(404, 'Assignment not found');
  await prisma.volunteerAssignment.delete({ where: { id: existing.id } });
}

export async function adminUpdateStatus(id, status) {
  const existing = await prisma.volunteerAssignment.findUnique({
    where: { id: Number(id) },
  });
  if (!existing) throw new ApiError(404, 'Assignment not found');

  return prisma.volunteerAssignment.update({
    where: { id: existing.id },
    data: {
      status,
      // Stamp lifecycle timestamps so the UI can render history later.
      startedAt:
        status === 'in_progress' && !existing.startedAt
          ? new Date()
          : existing.startedAt,
      completedAt: status === 'completed' ? new Date() : existing.completedAt,
    },
    include: fullInclude,
  });
}

// ============================================
// VOLUNTEER — own assignments
// ============================================
export async function listVolunteerAssignments(userId, { status } = {}) {
  return prisma.volunteerAssignment.findMany({
    where: {
      volunteerId: userId,
      ...(status ? { status } : {}),
    },
    include: fullInclude,
    orderBy: [{ status: 'asc' }, { dueDate: 'asc' }, { createdAt: 'desc' }],
  });
}

export async function volunteerUpdateStatus(userId, id, status, completionNotes) {
  const existing = await prisma.volunteerAssignment.findUnique({
    where: { id: Number(id) },
  });
  if (!existing) throw new ApiError(404, 'Assignment not found');
  if (existing.volunteerId !== userId) {
    throw new ApiError(403, 'This assignment is not yours to update');
  }
  if (existing.status === 'cancelled') {
    throw new ApiError(409, 'This assignment was cancelled by an admin');
  }
  if (existing.status === 'completed' && status === 'in_progress') {
    throw new ApiError(409, 'Cannot reopen a completed task');
  }

  return prisma.volunteerAssignment.update({
    where: { id: existing.id },
    data: {
      status,
      startedAt:
        status === 'in_progress' && !existing.startedAt
          ? new Date()
          : existing.startedAt,
      completedAt: status === 'completed' ? new Date() : existing.completedAt,
      completionNotes:
        status === 'completed' && completionNotes
          ? completionNotes
          : existing.completionNotes,
    },
    include: fullInclude,
  });
}
