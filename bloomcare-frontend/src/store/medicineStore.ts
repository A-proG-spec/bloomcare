import { create } from 'zustand';
import type { Medicine } from '../api/types';
import { medicineApi } from '../api/endpoints';

interface MedicineState {
  medicines: Medicine[];
  selectedMedicine: Medicine | null;
  isLoading: boolean;
  categories: string[];
  manufacturers: string[];
  
  fetchMedicines: (params?: {
    search?: string;
    category?: string;
    manufacturer?: string;
    page?: number;
    limit?: number;
  }) => Promise<void>;
  
  fetchMedicineById: (id: string) => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchManufacturers: () => Promise<void>;
  searchMedicines: (q: string) => Promise<Medicine[]>;
  setSelectedMedicine: (medicine: Medicine | null) => void;
}

export const useMedicineStore = create<MedicineState>((set) => ({
  medicines: [],
  selectedMedicine: null,
  isLoading: false,
  categories: [],
  manufacturers: [],

  fetchMedicines: async (params) => {
    set({ isLoading: true });
    try {
      const response = await medicineApi.getMedicines(params);
      let medicines: Medicine[] = [];
      if (response?.data?.medicines) {
        medicines = response.data.medicines;
      } else if (response?.medicines) {
        medicines = response.medicines;
      } else if (Array.isArray(response?.data)) {
        medicines = response.data;
      } else if (Array.isArray(response)) {
        medicines = response;
      }
      set({ medicines });
    } catch (error) {
      console.error('Failed to fetch medicines:', error);
      set({ medicines: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchMedicineById: async (id) => {
    set({ isLoading: true });
    try {
      const medicine = await medicineApi.getMedicineById(id);
      set({ selectedMedicine: medicine });
    } catch (error) {
      console.error('Failed to fetch medicine:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchCategories: async () => {
    try {
      const categories = await medicineApi.getCategories();
      set({ categories });
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  },

  fetchManufacturers: async () => {
    try {
      const manufacturers = await medicineApi.getManufacturers();
      set({ manufacturers });
    } catch (error) {
      console.error('Failed to fetch manufacturers:', error);
    }
  },

  searchMedicines: async (q) => {
    try {
      return await medicineApi.searchMedicines(q);
    } catch (error) {
      console.error('Failed to search medicines:', error);
      return [];
    }
  },

  setSelectedMedicine: (medicine) => set({ selectedMedicine: medicine }),
}));