import apiClient from '../client';

export const medicineApi = {
  // ===== PUBLIC ENDPOINTS =====
  getMedicines: async (params?: {
    search?: string;
    category?: string;
    manufacturer?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get('/medicines', { params });
    return response.data;
  },

  getMedicineById: async (id: string) => {
    const response = await apiClient.get(`/medicines/${id}`);
    console.log('API Response:', response.data);
    return response.data;
  },

  getCategories: async () => {
    const response = await apiClient.get('/medicines/categories');
    return response.data.data;
  },

  getManufacturers: async () => {
    const response = await apiClient.get('/medicines/manufacturers');
    return response.data.data;
  },

  searchMedicines: async (q: string, limit?: number) => {
    const response = await apiClient.get('/medicines/search', {
      params: { q, limit },
    });
    return response.data.data;
  },

  getMedicinesByPharmacy: async (pharmacyId: string, params?: {
    search?: string;
    inStockOnly?: boolean;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get(`/medicines/pharmacy/${pharmacyId}`, { params });
    return response.data;
  },

  // ===== PHARMACY OWNER ENDPOINTS =====
  getPharmacyMedicines: async (pharmacyId: string, params?: {
    search?: string;
    inStockOnly?: boolean;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get(`/medicines/pharmacy/${pharmacyId}`, { params });
    return response.data.data;
  },

  addMedicineToPharmacy: async (data: {
    pharmacyId: string;
    medicineId: string;
    price: number;
    quantity: number;
  }) => {
    const response = await apiClient.post('/medicines/pharmacy/add', data);
    return response.data.data;
  },

  updateMedicineStock: async (data: {
    pharmacyId: string;
    medicineId: string;
    quantity: number;
    price?: number;
  }) => {
    const response = await apiClient.put('/medicines/pharmacy/stock', data);
    return response.data.data;
  },

  removeMedicineFromPharmacy: async (pharmacyId: string, medicineId: string) => {
    const response = await apiClient.delete(`/medicines/pharmacy/${pharmacyId}/${medicineId}`);
    return response.data.data;
  },

  // ===== ADMIN ENDPOINTS =====
  createMedicine: async (data: {
    name: string;
    genericName?: string;
    category: string;
    manufacturer: string;
    description?: string;
    image?: string;
  }) => {
    const response = await apiClient.post('/medicines', data);
    return response.data.data;
  },

  updateMedicine: async (id: string, data: Partial<{
    name: string;
    genericName: string;
    category: string;
    manufacturer: string;
    description: string;
    image: string;
  }>) => {
    const response = await apiClient.put(`/medicines/${id}`, data);
    return response.data.data;
  },

  deleteMedicine: async (id: string) => {
    const response = await apiClient.delete(`/medicines/${id}`);
    return response.data;
  },
};