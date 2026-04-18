import api from './api';

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} User data
 */
export async function signup(userData) {
  const response = await api.post('/auth/signup', userData);
  return response.data;
}

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} User data
 */
export async function login(email, password) {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
}

/**
 * Logout current user
 * @returns {Promise<void>}
 */
export async function logout() {
  const response = await api.post('/auth/logout');
  return response.data;
}

/**
 * Get current authenticated user
 * @returns {Promise<Object>} User data
 */
export async function getCurrentUser() {
  const response = await api.get('/auth/me');
  return response.data;
}

export default {
  signup,
  login,
  logout,
  getCurrentUser,
};
