import apiClient from '../client';

export const pharmacyApi = {
  // ===== LIST / SEARCH =====
  getPharmacies: async (params?: {
    search?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get('/pharmacy', { params });
    // ✅ Return the full response, store will handle extraction
    return response.data;
  },

  getNearbyPharmacies: async (lat: number, lng: number, radius?: number) => {
    // ✅ FIXED: Use 'lat' and 'lng' as query params (matches backend)
    const response = await apiClient.get('/pharmacy/nearby', {
      params: { lat, lng, radius },
    });
    return response.data;
  },

  getPharmacyById: async (id: string) => {
    const response = await apiClient.get(`/pharmacy/${id}`);
    return response.data.data;
  },

  // ===== APPLICATION =====
  applyForPharmacy: async (data: {
    pharmacyName: string;
    address: string;
    latitude: number;
    longitude: number;
    phone: string;
    email: string;
    website?: string;
    openingHours?: any;
  }) => {
    const response = await apiClient.post('/pharmacy/apply', data);
    return response.data.data;
  },

  getMyApplication: async () => {
    const response = await apiClient.get('/pharmacy/my-application');
    return response.data.data;
  },

  getMyPharmacy: async () => {
    const response = await apiClient.get('/pharmacy/my-pharmacy');
    return response.data.data;
  },

  updatePharmacy: async (data: {
    name?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    phone?: string;
    email?: string;
    website?: string;
    openingHours?: any;
    isActive?: boolean;
  }) => {
    const response = await apiClient.put('/pharmacy/update', data);
    return response.data.data;
  },

  uploadPharmacyImage: async (image: File) => {
    const formData = new FormData();
    formData.append('image', image);
    const response = await apiClient.post('/pharmacy/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  // ===== ADMIN =====
  getAllApplications: async (params?: {
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get('/pharmacy/applications', { params });
    return response.data.data;
  },

  reviewApplication: async (id: string, data: {
    status: 'approved' | 'rejected';
    adminNotes?: string;
  }) => {
    const response = await apiClient.put(`/pharmacy/applications/${id}/review`, data);
    return response.data.data;
  }
};