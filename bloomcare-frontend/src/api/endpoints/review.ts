import apiClient from '../client';

export const reviewApi = {
  createReview: async (data: {
    pharmacyId: string;
    rating: number;
    comment: string;
  }) => {
    const response = await apiClient.post('/reviews', data);
    return response.data.data;
  },

  getPharmacyReviews: async (pharmacyId: string, params?: {
    page?: number;
    limit?: number;
    sortBy?: 'newest' | 'oldest' | 'highest' | 'lowest';
  }) => {
    const response = await apiClient.get(`/reviews/pharmacy/${pharmacyId}`, { params });
    
    
    const result = response.data;
    
    // Handle: { success: true, data: { reviews: [], pagination: {} } }
    if (result?.success && result?.data?.reviews) {
      return {
        reviews: result.data.reviews || [],
        pagination: result.data.pagination || { page: 1, limit: 10, total: 0, pages: 0 }
      };
    }
    
    // Handle: { data: { reviews: [], pagination: {} } }
    if (result?.data?.reviews) {
      return {
        reviews: result.data.reviews || [],
        pagination: result.data.pagination || { page: 1, limit: 10, total: 0, pages: 0 }
      };
    }
    
    // Handle: { reviews: [], pagination: {} }
    if (result?.reviews) {
      return {
        reviews: result.reviews || [],
        pagination: result.pagination || { page: 1, limit: 10, total: 0, pages: 0 }
      };
    }
    
    // Handle: { data: [] }
    if (Array.isArray(result?.data)) {
      return {
        reviews: result.data || [],
        pagination: { page: 1, limit: 10, total: result.data.length, pages: 1 }
      };
    }
    
    // Handle: [] (direct array)
    if (Array.isArray(result)) {
      return {
        reviews: result || [],
        pagination: { page: 1, limit: 10, total: result.length, pages: 1 }
      };
    }
    
    // Default fallback
    return {
      reviews: [],
      pagination: { page: 1, limit: 10, total: 0, pages: 0 }
    };
  },

  getReviewById: async (id: string) => {
    const response = await apiClient.get(`/reviews/${id}`);
    return response.data.data;
  },

  updateReview: async (id: string, data: {
    rating?: number;
    comment?: string;
  }) => {
    const response = await apiClient.put(`/reviews/${id}`, data);
    return response.data.data;
  },

  deleteReview: async (id: string) => {
    const response = await apiClient.delete(`/reviews/${id}`);
    return response.data;
  },

  getUserReviewForPharmacy: async (pharmacyId: string) => {
    const response = await apiClient.get(`/reviews/my-review/pharmacy/${pharmacyId}`);
    return response.data.data;
  },

  getUserReviews: async (params?: {
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get('/reviews/my-reviews', { params });
    return response.data;
  },

  deleteReviewByAdmin: async (id: string) => {
    const response = await apiClient.delete(`/reviews/admin/${id}`);
    return response.data;
  },
};