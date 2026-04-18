import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================
// VOLUNTEER TASK SERVICE
// ============================================

export async function createVolunteerTask(userId, taskData) {
  const { skills, experience, preferredLocation, ...rest } = taskData;

  const task = await prisma.volunteerTask.create({
    data: {
      userId,
      ...rest,
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
