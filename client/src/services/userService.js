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

// ============================================
// PROFILE / SETTINGS
// ============================================

export async function getMyProfile() {
  const response = await api.get('/users/me/profile');
  return response.data;
}

export async function updateMyProfile(payload) {
  const response = await api.patch('/users/me/profile', payload);
  return response.data;
}

export async function changeMyPassword(payload) {
  const response = await api.post('/users/me/change-password', payload);
  return response.data;
}

export async function deleteMyAccount(payload) {
  // axios delete with body needs the `data` config key
  const response = await api.delete('/users/me', { data: payload });
  return response.data;
}

export default {
  getDashboardStats,
  getRecentActivities,
  getMyProfile,
  updateMyProfile,
  changeMyPassword,
  deleteMyAccount,
};
