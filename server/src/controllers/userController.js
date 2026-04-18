import * as userService from '../services/userService.js';

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
