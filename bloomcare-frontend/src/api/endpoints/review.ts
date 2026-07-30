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
    return response.data;
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

  // Admin endpoint
  deleteReviewByAdmin: async (id: string) => {
    const response = await apiClient.delete(`/reviews/admin/${id}`);
    return response.data;
  },
};