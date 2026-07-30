import apiClient from '../client';

export const orderApi = {
  // Create order
  createOrder: async (data: {
    pharmacyId: string;
    items: Array<{ medicineId: string; quantity: number }>;
  }) => {
    const response = await apiClient.post('/orders', data);
    return response.data.data; // returns the order
  },

  // Get user's orders (with filters)
  getUserOrders: async (params?: {
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get('/orders/my-orders', { params });
    return response.data.data; // { orders, pagination }
  },

  // Get order details
  getOrderDetails: async (id: string) => {
    const response = await apiClient.get(`/orders/${id}`);
    return response.data.data;
  },

  // Cancel order
  cancelOrder: async (id: string, reason: string) => {
    const response = await apiClient.post(`/orders/${id}/cancel`, { reason });
    return response.data.data;
  },

  // Admin: Get all orders
  getAllOrders: async (params?: {
    status?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get('/admin/orders', { params });
    return response.data.data;
  },

  // Pharmacy owner: Get pharmacy orders
  getPharmacyOrders: async (pharmacyId: string, params?: {
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get(`/orders/pharmacy/${pharmacyId}`, { params });
    return response.data.data;
  },

  // Update order status (pharmacy owner/admin)
  updateOrderStatus: async (id: string, data: {
    status: 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
    note?: string;
  }) => {
    const response = await apiClient.put(`/orders/${id}/status`, data);
    return response.data.data;
  },

  // Admin: Get order statistics
  getOrderStats: async () => {
    const response = await apiClient.get('/orders/admin/stats');
    return response.data.data;
  },
};