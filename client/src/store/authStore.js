import { create } from 'zustand';
import * as authService from '../services/authService';

const useAuthStore = create((set) => ({
  user: null,
  loading: true, // Start with loading true to prevent redirect before auth check
  error: null,
  isAuthenticated: false,

  // Login action
  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const response = await authService.login(email, password);
      set({
        user: response.data.user,
        isAuthenticated: true,
        loading: false,
        error: null,
      });
      return response.data.user;
    } catch (error) {
      set({
        loading: false,
        error: error.message || 'Login failed',
        isAuthenticated: false,
      });
      throw error;
    }
  },

  // Signup action
  signup: async (userData) => {
    set({ loading: true, error: null });
    try {
      const response = await authService.signup(userData);
      set({
        user: response.data.user,
        isAuthenticated: true,
        loading: false,
        error: null,
      });
      return response.data.user;
    } catch (error) {
      set({
        loading: false,
        error: error.message || 'Signup failed',
        isAuthenticated: false,
      });
      throw error;
    }
  },

  // Logout action
  logout: async () => {
    set({ loading: true });
    try {
      await authService.logout();
      set({
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      });
    } catch (error) {
      set({ loading: false, error: error.message });
      // Even if logout fails on server, clear local state
      set({ user: null, isAuthenticated: false });
    }
  },

  // Check authentication status
  checkAuth: async () => {
    console.log('🔍 checkAuth called');
    set({ loading: true });
    try {
      console.log('📡 Calling getCurrentUser API...');
      const response = await authService.getCurrentUser();
      console.log('✅ checkAuth success:', response);
      set({
        user: response.data.user,
        isAuthenticated: true,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('❌ checkAuth failed:', error);
      set({
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null, // Don't show error for auth check
      });
    }
  },

  // Clear error
  clearError: () => set({ error: null }),
}));

export default useAuthStore;
