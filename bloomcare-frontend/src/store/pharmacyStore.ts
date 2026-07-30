import { create } from 'zustand';
import type { Pharmacy } from '../types/pharmacy.types';
import { pharmacyApi } from '../api/endpoints/pharmacy';

// ✅ ADDED: Type for API error
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
  pharmacy: Pharmacy | null; // For pharmacy owner's own pharmacy
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
      set({ pharmacies: response.data.pharmacies || [] });
    } catch (error) {
      console.error('Failed to fetch pharmacies:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchNearbyPharmacies: async (lat, lng) => {
    set({ isLoading: true });
    try {
      const response = await pharmacyApi.getNearbyPharmacies(lat, lng);
      set({ pharmacies: response.data || [] });
    } catch (error) {
      console.error('Failed to fetch nearby pharmacies:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  // ✅ FIXED: Removed 'any' type
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