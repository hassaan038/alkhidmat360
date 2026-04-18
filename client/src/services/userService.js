import api from './api';

/**
 * Get dashboard statistics for current user
 */
export async function getDashboardStats() {
  const response = await api.get('/users/dashboard/stats');
  return response.data;
}

/**
 * Get recent activities for current user
 */
export async function getRecentActivities(limit = 10) {
  const response = await api.get('/users/dashboard/activities', {
    params: { limit }
  });
  return response.data;
}

export default {
  getDashboardStats,
  getRecentActivities,
};
