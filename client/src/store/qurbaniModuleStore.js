import { create } from 'zustand';
import * as qurbaniModuleService from '../services/qurbaniModuleService';
import * as systemConfigService from '../services/systemConfigService';

const useQurbaniModuleStore = create((set, get) => ({
  // null = not yet checked, true/false = resolved state
  moduleEnabled: null,
  loading: false,
  listings: [],
  error: null,

  fetchFlag: async () => {
    // Avoid refetching if already resolved
    if (get().moduleEnabled !== null) return;
    try {
      const response = await systemConfigService.getQurbaniModuleFlag();
      set({ moduleEnabled: !!response.data?.enabled, error: null });
    } catch (error) {
      // On failure, treat as disabled so we don't block admin sidebar
      set({ moduleEnabled: false, error: error.message || 'Failed to fetch module flag' });
    }
  },

  refreshFlag: async () => {
    try {
      const response = await systemConfigService.getQurbaniModuleFlag();
      set({ moduleEnabled: !!response.data?.enabled, error: null });
    } catch (error) {
      set({ error: error.message || 'Failed to fetch module flag' });
    }
  },

  fetchListings: async () => {
    set({ loading: true, error: null });
    try {
      const response = await qurbaniModuleService.listActiveListings();
      set({
        listings: response.data?.listings || [],
        loading: false,
      });
    } catch (error) {
      set({
        loading: false,
        error: error.message || 'Failed to fetch listings',
        listings: [],
      });
    }
  },

  clearError: () => set({ error: null }),
}));

export default useQurbaniModuleStore;
