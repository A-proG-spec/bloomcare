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
    console.log('🔍 [Store] fetchPharmacies called with params:', params);
    set({ isLoading: true });
    try {
      const response = await pharmacyApi.getPharmacies(params);
      
      console.log('🔍 [Store] Raw API response:', response);
      console.log('🔍 [Store] response.data:', response?.data);
      console.log('🔍 [Store] response.data.pharmacies:', response?.data?.pharmacies);
      
      // ✅ Try multiple ways to extract pharmacies
      const pharmacies = response?.data?.pharmacies || response?.pharmacies || [];
      
      console.log('🔍 [Store] Extracted pharmacies:', pharmacies);
      console.log('🔍 [Store] Is array?', Array.isArray(pharmacies));
      console.log('🔍 [Store] Length:', pharmacies.length);
      
      if (pharmacies.length > 0) {
        console.log('🔍 [Store] First pharmacy:', pharmacies[0]);
        console.log('🔍 [Store] Latitude:', pharmacies[0].latitude);
        console.log('🔍 [Store] Longitude:', pharmacies[0].longitude);
        console.log('🔍 [Store] IsActive:', pharmacies[0].isActive);
      }
      
      set({ pharmacies });
    } catch (error) {
      console.error('❌ [Store] Failed to fetch pharmacies:', error);
      set({ pharmacies: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchNearbyPharmacies: async (lat, lng) => {
    console.log('🔍 [Store] fetchNearbyPharmacies called with lat:', lat, 'lng:', lng);
    set({ isLoading: true });
    try {
      const response = await pharmacyApi.getNearbyPharmacies(lat, lng);
      
      console.log('🔍 [Store] Nearby API response:', response);
      console.log('🔍 [Store] response.data:', response?.data);
      
      // ✅ Handle the nested response structure
      const pharmacies = response?.data || response || [];
      
      console.log('🔍 [Store] Extracted nearby pharmacies:', pharmacies);
      console.log('🔍 [Store] Is array?', Array.isArray(pharmacies));
      console.log('🔍 [Store] Length:', pharmacies.length);
      
      if (pharmacies.length > 0) {
        console.log('🔍 [Store] First nearby pharmacy:', pharmacies[0]);
        console.log('🔍 [Store] Latitude:', pharmacies[0].latitude);
        console.log('🔍 [Store] Longitude:', pharmacies[0].longitude);
      }
      
      set({ pharmacies });
    } catch (error) {
      console.error('❌ [Store] Failed to fetch nearby pharmacies:', error);
      set({ pharmacies: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchPharmacy: async () => {
    console.log('🔍 [Store] fetchPharmacy called');
    set({ isLoading: true });
    try {
      const result = await pharmacyApi.getMyPharmacy();
      console.log('🔍 [Store] My pharmacy:', result);
      set({ pharmacy: result });
    } catch (error: unknown) {
      const err = error as ApiError;
      if (err.response?.status !== 404) {
        console.error('❌ [Store] Failed to fetch pharmacy:', error);
      }
      set({ pharmacy: null });
    } finally {
      set({ isLoading: false });
    }
  },

  setSearchQuery: (query) => {
    console.log('🔍 [Store] setSearchQuery:', query);
    set({ searchQuery: query });
  },

  setSelectedPharmacy: (pharmacy) => {
    console.log('🔍 [Store] setSelectedPharmacy:', pharmacy?.name);
    set({ selectedPharmacy: pharmacy });
  },
}));