import apiClient from '../client';

export interface CartItem {
  _id?: string;
  medicineId: string;
  pharmacyId: string;
  quantity: number;
  price: number;
  medicineName: string;
  pharmacyName: string;
  image: string;
  stockStatus: string;
  addedAt: string;
}

export interface GuestCartItemPayload {
  medicineId: string;
  pharmacyId: string;
  quantity: number;
}

export interface Cart {
  _id: string;
  user?: string;
  sessionId?: string;
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  status: 'active' | 'abandoned' | 'converted';
  createdAt: string;
  updatedAt: string;
}

export interface CartValidationResult {
  valid: boolean;
  errors: string[];
}

export const cartApi = {
  // Get cart
  getCart: async (): Promise<Cart> => {
    const response = await apiClient.get('/cart');
    return response.data.data;
  },

  // Get cart count
  getCartCount: async (): Promise<number> => {
    const response = await apiClient.get('/cart/count');
    return response.data.data.count;
  },

  // Add item
  addItem: async (data: {
    medicineId: string;
    pharmacyId: string;
    quantity: number;
  }): Promise<Cart> => {
    const response = await apiClient.post('/cart', data);
    return response.data.data;
  },

  // Update item quantity
  updateItem: async (
    medicineId: string,
    pharmacyId: string,
    quantity: number
  ): Promise<Cart> => {
    const response = await apiClient.put(`/cart/${medicineId}/${pharmacyId}`, {
      quantity,
    });
    return response.data.data;
  },

  // Remove item
  removeItem: async (medicineId: string, pharmacyId: string): Promise<Cart> => {
    const response = await apiClient.delete(`/cart/${medicineId}/${pharmacyId}`);
    return response.data.data;
  },

  // Clear cart
  clearCart: async (): Promise<void> => {
    await apiClient.delete('/cart');
  },

  // Merge guest cart (on login)
  mergeGuestCart: async (items: GuestCartItemPayload[]): Promise<Cart> => {
    const response = await apiClient.post('/cart/merge', { items });
    return response.data.data;
  },

  // Validate cart (for checkout)
  validateCart: async (): Promise<CartValidationResult> => {
    const response = await apiClient.get('/cart/validate');
    return response.data.data;
  },
};