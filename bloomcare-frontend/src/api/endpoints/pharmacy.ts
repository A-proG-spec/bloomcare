import apiClient from '../client';

export const pharmacyApi = {
  // ===== LIST / SEARCH =====
  getPharmacies: async (params?: {
    search?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }) => {
    console.log('🔍 [API] Requesting pharmacies with params:', params);
    const response = await apiClient.get('/pharmacy', { params });
    console.log('🔍 [API] Raw response:', response);
    console.log('🔍 [API] response.data:', response.data);
    console.log('🔍 [API] response.data.data:', response.data?.data);
    console.log('🔍 [API] response.data.data.pharmacies:', response.data?.data?.pharmacies);
    return response.data;
  },

  getNearbyPharmacies: async (lat: number, lng: number, radius?: number) => {
    console.log('🔍 [API] Requesting nearby pharmacies at lat:', lat, 'lng:', lng, 'radius:', radius);
    const response = await apiClient.get('/pharmacy/nearby', {
      params: { lat, lng, radius },
    });
    console.log('🔍 [API] Nearby API response:', response);
    console.log('🔍 [API] Nearby response.data:', response.data);
    console.log('🔍 [API] Nearby response.data.data:', response.data?.data);
    return response.data;
  },

  getPharmacyById: async (id: string) => {
    console.log('🔍 [API] Requesting pharmacy by id:', id);
    const response = await apiClient.get(`/pharmacy/${id}`);
    console.log('🔍 [API] Pharmacy by id response:', response.data);
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