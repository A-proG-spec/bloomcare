import apiClient from '../client';

export const paymentApi = {
  /**
   * Initialize Stripe payment
   */
  initializePayment: async (data: {
    orderId: string;
    paymentMethod: 'card' | 'mobile_pay' | 'bank_transfer';
  }) => {
    const response = await apiClient.post('/payments/initialize', data);
    return response.data.data;
  },

  /**
   * Verify payment after success
   */
  verifyPayment: async (paymentIntentId: string, orderId: string) => {
    const response = await apiClient.get('/payments/verify', {
      params: { payment_intent_id: paymentIntentId, orderId },
    });
    return response.data.data;
  },

  /**
   * Get payment status
   */
  getPaymentStatus: async (orderId: string) => {
    const response = await apiClient.get(`/payments/status/${orderId}`);
    return response.data.data;
  },
};