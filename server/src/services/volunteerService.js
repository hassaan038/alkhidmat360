import { PrismaClient } from '@prisma/client';
import { getUserContactInfo } from '../utils/userIdentity.js';

const prisma = new PrismaClient();

// ============================================
// VOLUNTEER TASK SERVICE
// ============================================

export async function createVolunteerTask(userId, taskData) {
  const { skills, experience, preferredLocation, ...rest } = taskData;
  const contact = await getUserContactInfo(userId);

  const task = await prisma.volunteerTask.create({
    data: {
      userId,
      ...rest,
      volunteerPhone: contact.phoneNumber,
      volunteerEmail: contact.email,
      skills: skills || null,
      experience: experience || null,
      preferredLocation: preferredLocation || null,
    },
  });

  return task;
}

export async function getUserVolunteerTasks(userId) {
  const tasks = await prisma.volunteerTask.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  return tasks;
}
