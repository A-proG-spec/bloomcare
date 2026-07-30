// src/store/applicationStore.ts
import { create } from 'zustand';
import { pharmacyApi } from '../api/endpoints/pharmacy';

interface Application {
  _id: string;
  pharmacyName: string;
  address: string;
  phone: string;
  email: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
  createdAt: string;
  user?: any;
}

interface ApplicationState {
  myApplication: Application | null;
  allApplications: Application[];
  isLoading: boolean;
  fetchMyApplication: () => Promise<void>;
  fetchAllApplications: (params?: { status?: string; page?: number; limit?: number }) => Promise<void>;
  reviewApplication: (id: string, status: 'approved' | 'rejected', adminNotes?: string) => Promise<void>;
  clear: () => void;
}

export const useApplicationStore = create<ApplicationState>((set, get) => ({
  myApplication: null,
  allApplications: [],
  isLoading: false,

  fetchMyApplication: async () => {
    set({ isLoading: true });
    try {
      const data = await pharmacyApi.getMyApplication();
      set({ myApplication: data });
    } catch (error: any) {
      // 404 means no application – it's fine, just set to null
      if (error.response?.status === 404) {
        set({ myApplication: null });
      } else {
        // Only log unexpected errors, no toast (toast handled in component)
        console.error('Unexpected error fetching application:', error);
      }
    } finally {
      set({ isLoading: false });
    }
  },

  fetchAllApplications: async (params) => {
    set({ isLoading: true });
    try {
      const data = await pharmacyApi.getAllApplications(params);
      set({ allApplications: data.applications || [] });
    } catch (error: any) {
      if (error.response?.status === 404) {
        set({ allApplications: [] });
      } else {
        console.error('Unexpected error fetching applications:', error);
      }
    } finally {
      set({ isLoading: false });
    }
  },

  reviewApplication: async (id, status, adminNotes) => {
    try {
      const result = await pharmacyApi.reviewApplication(id, { status, adminNotes });
      // Refresh lists after review
      await get().fetchAllApplications({ status: 'pending' });
      if (get().myApplication && get().myApplication?._id === id) {
        await get().fetchMyApplication();
      }
      return result;
    } catch (error) {
      throw error; // Let component handle toast for this action
    }
  },

  clear: () => set({ myApplication: null, allApplications: [] }),
}));