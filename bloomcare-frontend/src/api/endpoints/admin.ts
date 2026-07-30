import apiClient from '../client';

export const adminApi = {
  // Dashboard
  getDashboardStats: async () => {
    const response = await apiClient.get('/admin/dashboard');
    return response.data.data;
  },

  // Users
  getUsers: async (params?: {
    search?: string;
    role?: string;
    isEmailVerified?: boolean;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get('/admin/users', { params });
    return response.data.data; // ✅ Extract data wrapper
  },

  getUserById: async (id: string) => {
    const response = await apiClient.get(`/admin/users/${id}`);
    return response.data.data;
  },

  updateUserRole: async (id: string, role: 'admin' | 'user' | 'pharmacy_owner') => {
    const response = await apiClient.put(`/admin/users/${id}/role`, { role });
    return response.data.data;
  },

  deleteUser: async (id: string) => {
    const response = await apiClient.delete(`/admin/users/${id}`);
    return response.data;
  },

  // Pharmacies
  getAllPharmacies: async (params?: {
    search?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get('/admin/pharmacies', { params });
    return response.data.data; // ✅ Extract data wrapper
  },

  togglePharmacyStatus: async (id: string) => {
    const response = await apiClient.put(`/admin/pharmacies/${id}/toggle-status`);
    return response.data.data;
  },

  // Applications
  getPendingApplications: async (params?: {
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get('/admin/applications/pending', { params });
    return response.data.data; // ✅ Extract data wrapper
  },

  // Orders
  getAllOrders: async (params?: {
    status?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get('/admin/orders', { params });
    return response.data.data; // ✅ Extract data wrapper
  },

  // Analytics
  getAnalytics: async (period?: 'day' | 'week' | 'month' | 'year') => {
    const response = await apiClient.get('/admin/analytics', {
      params: { period },
    });
    return response.data.data; // ✅ Extract data wrapper
  },

  getRevenueAnalytics: async (period?: 'day' | 'week' | 'month' | 'year') => {
    const response = await apiClient.get('/admin/analytics/revenue', {
      params: { period },
    });
    return response.data.data;
  },

  getTopPharmacies: async (limit?: number) => {
    const response = await apiClient.get('/admin/analytics/top-pharmacies', {
      params: { limit },
    });
    return response.data.data;
  },

  getTopMedicines: async (limit?: number) => {
    const response = await apiClient.get('/admin/analytics/top-medicines', {
      params: { limit },
    });
    return response.data.data;
  },
};