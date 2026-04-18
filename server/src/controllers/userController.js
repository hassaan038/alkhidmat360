import * as userService from '../services/userService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';

/**
 * Get dashboard statistics for the current user
 */
export async function getDashboardStats(req, res) {
  try {
    const userId = req.session.userId;
    const userType = req.session.userType;

    if (!userId || !userType) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const stats = await userService.getUserDashboardStats(userId, userType);

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error in getDashboardStats:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
    });
  }
}

/**
 * Get recent activities for the current user
 */
export async function getRecentActivities(req, res) {
  try {
    const userId = req.session.userId;
    const userType = req.session.userType;
    const limit = parseInt(req.query.limit) || 10;

    if (!userId || !userType) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const activities = await userService.getUserRecentActivities(userId, userType, limit);

    return res.status(200).json({
      success: true,
      data: activities,
    });
  } catch (error) {
    console.error('Error in getRecentActivities:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch recent activities',
    });
  }
}

// ============================================
// PROFILE / SETTINGS
// ============================================

export const getMyProfile = asyncHandler(async (req, res) => {
  const userId = req.session.userId;
  const user = await userService.getProfile(userId);
  res.json(new ApiResponse(200, { user }, 'Profile fetched'));
});

export const updateMyProfile = asyncHandler(async (req, res) => {
  const userId = req.session.userId;
  const user = await userService.updateProfile(userId, req.body);

  // Keep the session.user object in sync so the next /auth/me hit
  // reflects the updated profile immediately.
  if (req.session?.user) {
    req.session.user = { ...req.session.user, ...user };
  }

  res.json(new ApiResponse(200, { user }, 'Profile updated'));
});

export const changeMyPassword = asyncHandler(async (req, res) => {
  const userId = req.session.userId;
  const { currentPassword, newPassword } = req.body;
  await userService.changePassword(userId, currentPassword, newPassword);
  res.json(new ApiResponse(200, { ok: true }, 'Password updated'));
});

export const deleteMyAccount = asyncHandler(async (req, res) => {
  const userId = req.session.userId;
  const { password } = req.body;
  await userService.deleteAccount(userId, password);

  // Tear down the session so the now-orphaned cookie can't be reused.
  req.session.destroy(() => {
    res.clearCookie(process.env.SESSION_NAME || 'alkhidmat_sid');
    res.json(new ApiResponse(200, { ok: true }, 'Account deleted'));
  });
});
