import { create } from 'zustand';
import { medicineApi } from '../api/endpoints/medicine';

interface ApiErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
}

interface Medicine {
  _id: string;
  name: string;
  genericName?: string;
  category?: string;
  manufacturer?: string;
  description?: string;
  image?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface MedicineState {
  medicines: Medicine[];
  isLoading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
  totalMedicines: number;
  categories: string[];
  manufacturers: string[];
  
  // Actions
  fetchMedicines: (params?: {
    search?: string;
    category?: string;
    manufacturer?: string;
    page?: number;
    limit?: number;
  }) => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchManufacturers: () => Promise<void>;
  searchMedicines: (query: string) => Promise<Medicine[]>;
  reset: () => void;
  clearError: () => void;
}

// ✅ FIX: Removed unused 'get' parameter
export const useMedicineStore = create<MedicineState>((set) => ({
  medicines: [],
  isLoading: false,
  error: null,
  totalPages: 1,
  currentPage: 1,
  totalMedicines: 0,
  categories: [],
  manufacturers: [],

  fetchMedicines: async (params = {}) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await medicineApi.getMedicines(params);
      
      set({
        medicines: response.data.medicines || [],
        totalPages: response.data.pagination?.pages || 1,
        currentPage: response.data.pagination?.page || 1,
        totalMedicines: response.data.pagination?.total || 0,
        isLoading: false,
      });
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      set({
        error: err.response?.data?.message || 'Failed to fetch medicines',
        isLoading: false,
      });
    }
  },

  fetchCategories: async () => {
    try {
      const response = await medicineApi.getCategories();
      set({ categories: response.data || [] });
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  },

  fetchManufacturers: async () => {
    try {
      const response = await medicineApi.getManufacturers();
      set({ manufacturers: response.data || [] });
    } catch (error) {
      console.error('Failed to fetch manufacturers:', error);
    }
  },

  searchMedicines: async (query: string) => {
    if (!query || query.length < 2) {
      return [];
    }
    
    try {
      const response = await medicineApi.searchMedicines(query);
      return response.data || [];
    } catch (error) {
      console.error('Failed to search medicines:', error);
      return [];
    }
  },

  reset: () => {
    set({
      medicines: [],
      isLoading: false,
      error: null,
      totalPages: 1,
      currentPage: 1,
      totalMedicines: 0,
    });
  },

  clearError: () => {
    set({ error: null });
  },
}));