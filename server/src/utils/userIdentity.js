import { PrismaClient } from '@prisma/client';
import { ApiError } from './ApiResponse.js';

const prisma = new PrismaClient();

// Forms used to re-collect phone / email / CNIC even though signup already
// captured them. We now read those fields from the session user instead so
// every donation, application and volunteer-task record carries the same
// contact info as the account itself.
export async function getUserContactInfo(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { fullName: true, email: true, phoneNumber: true, cnic: true },
  });
  if (!user) throw new ApiError(404, 'User not found');
  return user;
}
