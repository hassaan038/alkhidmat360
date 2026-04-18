import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { ApiError } from '../utils/ApiResponse.js';

const prisma = new PrismaClient();

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} Created user (without password)
 */
export async function registerUser(userData) {
  const { email, password, fullName, phoneNumber, cnic, userType } = userData;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new ApiError(400, 'User with this email already exists');
  }

  // Check if CNIC is already registered (if provided)
  if (cnic) {
    const existingCnic = await prisma.user.findUnique({
      where: { cnic },
    });

    if (existingCnic) {
      throw new ApiError(400, 'User with this CNIC already exists');
    }
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      fullName,
      phoneNumber,
      cnic: cnic || null,
      userType,
    },
  });

  // Remove password from response
  const { password: _, ...userWithoutPassword } = user;

  return userWithoutPassword;
}

/**
 * Authenticate user login
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} Authenticated user (without password)
 */
export async function loginUser(email, password) {
  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  // Check if user is active
  if (!user.isActive) {
    throw new ApiError(403, 'Your account has been deactivated. Please contact support.');
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid email or password');
  }

  // Remove password from response
  const { password: _, ...userWithoutPassword } = user;

  return userWithoutPassword;
}

/**
 * Get user by ID
 * @param {number} userId - User ID
 * @returns {Promise<Object>} User (without password)
 */
export async function getUserById(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Remove password from response
  const { password: _, ...userWithoutPassword } = user;

  return userWithoutPassword;
}

export default {
  registerUser,
  loginUser,
  getUserById,
};
