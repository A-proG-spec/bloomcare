import { create } from 'zustand';
import type { Order, OrderItem } from '../api/types';
import { orderApi } from '../api/endpoints';

interface CartItem {
  medicineId: string;
  medicineName: string;
  quantity: number;
  price: number;
}

interface OrderState {
  orders: Order[];
  selectedOrder: Order | null;
  cart: CartItem[];
  isLoading: boolean;
  
  // Cart methods
  addToCart: (item: CartItem) => void;
  removeFromCart: (medicineId: string) => void;
  updateCartItem: (medicineId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
  
  // Order methods
  fetchUserOrders: (params?: {
    status?: string;
    page?: number;
    limit?: number;
  }) => Promise<void>;
  
  fetchOrderDetails: (id: string) => Promise<void>;
  createOrder: (pharmacyId: string, items: Array<{ medicineId: string; quantity: number }>, paymentMethod: 'cod' | 'online') => Promise<Order>;
  cancelOrder: (id: string, reason: string) => Promise<void>;
  
  setSelectedOrder: (order: Order | null) => void;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  selectedOrder: null,
  cart: [],
  isLoading: false,

  addToCart: (item) => {
    const cart = get().cart;
    const existing = cart.find(c => c.medicineId === item.medicineId);
    
    if (existing) {
      set({
        cart: cart.map(c =>
          c.medicineId === item.medicineId
            ? { ...c, quantity: c.quantity + item.quantity }
            : c
        ),
      });
    } else {
      set({ cart: [...cart, item] });
    }
  },

  removeFromCart: (medicineId) => {
    set({ cart: get().cart.filter(c => c.medicineId !== medicineId) });
  },

  updateCartItem: (medicineId, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(medicineId);
      return;
    }
    set({
      cart: get().cart.map(c =>
        c.medicineId === medicineId ? { ...c, quantity } : c
      ),
    });
  },

  clearCart: () => set({ cart: [] }),

  getCartTotal: () => {
    return get().cart.reduce((total, item) => total + item.price * item.quantity, 0);
  },

  getCartCount: () => {
    return get().cart.reduce((count, item) => count + item.quantity, 0);
  },

  fetchUserOrders: async (params) => {
    set({ isLoading: true });
    try {
      const result = await orderApi.getUserOrders(params);
      set({ orders: result.orders || [] });
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      set({ orders: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchOrderDetails: async (id) => {
    set({ isLoading: true });
    try {
      const order = await orderApi.getOrderDetails(id);
      set({ selectedOrder: order });
    } catch (error) {
      console.error('Failed to fetch order:', error);
      set({ selectedOrder: null });
    } finally {
      set({ isLoading: false });
    }
  },

  // ✅ Updated: Accept paymentMethod parameter
  createOrder: async (pharmacyId, items, paymentMethod: 'cod' | 'online' = 'cod') => {
    set({ isLoading: true });
    try {
      const order = await orderApi.createOrder({ pharmacyId, items, paymentMethod });
      set({ cart: [] });
      return order;
    } finally {
      set({ isLoading: false });
    }
  },

  cancelOrder: async (id, reason) => {
    set({ isLoading: true });
    try {
      await orderApi.cancelOrder(id, reason);
      set((state) => ({
        orders: state.orders.map(o =>
          o._id === id ? { ...o, status: 'Cancelled' } : o
        ),
        selectedOrder: state.selectedOrder?._id === id
          ? { ...state.selectedOrder, status: 'Cancelled' }
          : state.selectedOrder,
      }));
    } finally {
      set({ isLoading: false });
    }
  },

  setSelectedOrder: (order) => set({ selectedOrder: order }),
}));