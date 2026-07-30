import { create } from 'zustand';
import type { Pharmacy } from '../types/pharmacy.types';
import { pharmacyApi } from '../api/endpoints/pharmacy';

interface ApiError {
  response?: {
    status?: number;
    data?: {
      message?: string;
    };
  };
}

interface PharmacyState {
  pharmacies: Pharmacy[];
  selectedPharmacy: Pharmacy | null;
  pharmacy: Pharmacy | null;
  isLoading: boolean;
  searchQuery: string;

  fetchPharmacies: (params?: { search?: string; isActive?: boolean }) => Promise<void>;
  fetchNearbyPharmacies: (lat: number, lng: number) => Promise<void>;
  fetchPharmacy: () => Promise<void>;
  setSearchQuery: (query: string) => void;
  setSelectedPharmacy: (pharmacy: Pharmacy | null) => void;
}

export const usePharmacyStore = create<PharmacyState>((set) => ({
  pharmacies: [],
  selectedPharmacy: null,
  pharmacy: null,
  isLoading: false,
  searchQuery: '',

  fetchPharmacies: async (params) => {
    set({ isLoading: true });
    try {
      const response = await pharmacyApi.getPharmacies(params);
      
      // ✅ FIXED: Handle the nested response structure
      // Response: { success: true, data: { pharmacies: [], pagination: {} } }
      const pharmacies = response?.data?.pharmacies || response?.pharmacies || [];
      
      console.log('fetchPharmacies - pharmacies:', pharmacies);
      console.log('fetchPharmacies - is array?', Array.isArray(pharmacies));
      
      set({ pharmacies });
    } catch (error) {
      console.error('Failed to fetch pharmacies:', error);
      set({ pharmacies: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchNearbyPharmacies: async (lat, lng) => {
    set({ isLoading: true });
    try {
      const response = await pharmacyApi.getNearbyPharmacies(lat, lng);
      
      // ✅ FIXED: Handle the nested response structure
      // Response: { success: true, data: [...] }
      const pharmacies = response?.data || response || [];
      
      console.log('fetchNearbyPharmacies - pharmacies:', pharmacies);
      console.log('fetchNearbyPharmacies - is array?', Array.isArray(pharmacies));
      
      set({ pharmacies });
    } catch (error) {
      console.error('Failed to fetch nearby pharmacies:', error);
      set({ pharmacies: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchPharmacy: async () => {
    set({ isLoading: true });
    try {
      const result = await pharmacyApi.getMyPharmacy();
      set({ pharmacy: result });
    } catch (error: unknown) {
      const err = error as ApiError;
      if (err.response?.status !== 404) {
        console.error('Failed to fetch pharmacy:', error);
      }
      set({ pharmacy: null });
    } finally {
      set({ isLoading: false });
    }
  },

  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedPharmacy: (pharmacy) => set({ selectedPharmacy: pharmacy }),
}));