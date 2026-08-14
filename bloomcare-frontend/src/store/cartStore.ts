// src/store/cartStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { cartApi, CartItem } from '../api/endpoints/cart';
import toast from 'react-hot-toast';

interface ApiErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
}

interface IdObject {
  _id: string;
}

// Helper to safely extract string ID regardless of whether the field is populated or a plain string
const getId = (idOrObj: unknown): string => {
  if (idOrObj && typeof idOrObj === 'object' && '_id' in idOrObj) {
    return (idOrObj as IdObject)._id;
  }
  return typeof idOrObj === 'string' ? idOrObj : '';
};

interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  isLoading: boolean;
  isSynced: boolean;

  // Actions
  fetchCart: () => Promise<void>;
  addItem: (item: {
    medicineId: string;
    pharmacyId: string;
    quantity: number;
    price: number;
    medicineName: string;
    pharmacyName: string;
    image?: string;
    stockStatus?: string;
  }) => Promise<boolean>;
  updateQuantity: (medicineId: string, pharmacyId: string, quantity: number) => Promise<boolean>;
  removeItem: (medicineId: string, pharmacyId: string) => Promise<boolean>;
  clearCart: () => Promise<void>;
  getItemCount: () => number;
  getCartCount: () => number;
  getTotalItems: () => number;
  getItemQuantity: (medicineId: string, pharmacyId?: string) => number;
  getTotalPrice: () => number;
  getItemsByPharmacy: () => Record<string, { pharmacyName: string; items: CartItem[] }>;
  mergeGuestCart: (guestItems: CartItem[]) => Promise<void>;
  reset: () => void;
  resetCart: () => void;
}

const GUEST_CART_KEY = 'guest-cart';

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,
      totalPrice: 0,
      isLoading: false,
      isSynced: false,

      // ============================================================
      // FETCH CART
      // ============================================================

      fetchCart: async () => {
        set({ isLoading: true });
        try {
          const cart = await cartApi.getCart();
          set({
            items: cart.items || [],
            totalItems: cart.totalItems || 0,
            totalPrice: cart.totalPrice || 0,
            isSynced: true,
            isLoading: false,
          });
        } catch (error) {
          console.error('Failed to fetch cart:', error);
          set({ isLoading: false });
        }
      },

      // ============================================================
      // ADD ITEM
      // ============================================================

      addItem: async (item) => {
        set({ isLoading: true });
        try {
          const cart = await cartApi.addItem({
            medicineId: item.medicineId,
            pharmacyId: item.pharmacyId,
            quantity: item.quantity,
          });

          set({
            items: cart.items,
            totalItems: cart.totalItems,
            totalPrice: cart.totalPrice,
            isLoading: false,
          });

          return true;
        } catch (error: unknown) {
          const err = error as ApiErrorResponse;
          const message = err.response?.data?.message || 'Failed to add item to cart';
          toast.error(message);
          set({ isLoading: false });
          return false;
        }
      },

      // ============================================================
      // UPDATE QUANTITY
      // ============================================================

      updateQuantity: async (medicineId: string, pharmacyId: string, quantity: number) => {
        set({ isLoading: true });
        try {
          const cart = await cartApi.updateItem(medicineId, pharmacyId, quantity);

          set({
            items: cart.items,
            totalItems: cart.totalItems,
            totalPrice: cart.totalPrice,
            isLoading: false,
          });

          return true;
        } catch (error: unknown) {
          const err = error as ApiErrorResponse;
          const message = err.response?.data?.message || 'Failed to update cart';
          toast.error(message);
          set({ isLoading: false });
          return false;
        }
      },

      // ============================================================
      // REMOVE ITEM
      // ============================================================

      removeItem: async (medicineId: string, pharmacyId: string) => {
        set({ isLoading: true });
        try {
          const cart = await cartApi.removeItem(medicineId, pharmacyId);

          set({
            items: cart.items,
            totalItems: cart.totalItems,
            totalPrice: cart.totalPrice,
            isLoading: false,
          });

          return true;
        } catch (error: unknown) {
          const err = error as ApiErrorResponse;
          const message = err.response?.data?.message || 'Failed to remove item';
          toast.error(message);
          set({ isLoading: false });
          return false;
        }
      },

      // ============================================================
      // CLEAR CART
      // ============================================================

      clearCart: async () => {
        set({ isLoading: true });
        try {
          await cartApi.clearCart();
          set({
            items: [],
            totalItems: 0,
            totalPrice: 0,
            isLoading: false,
          });
        } catch (error) {
          console.error('Failed to clear cart:', error);
          set({ isLoading: false });
        }
      },

      // ============================================================
      // MERGE GUEST CART
      // ============================================================

      mergeGuestCart: async (guestItems: CartItem[]) => {
        if (!guestItems || guestItems.length === 0) {
          return;
        }

        set({ isLoading: true });

        try {
          const formattedItems = guestItems.map((item) => ({
            medicineId: getId(item.medicineId),
            pharmacyId: getId(item.pharmacyId),
            quantity: item.quantity,
          }));

          const cart = await cartApi.mergeGuestCart(formattedItems);
          set({
            items: cart.items,
            totalItems: cart.totalItems,
            totalPrice: cart.totalPrice,
            isLoading: false,
            isSynced: true,
          });

          localStorage.removeItem(GUEST_CART_KEY);
        } catch (error: unknown) {
          console.error('Failed to merge guest cart:', error);
          set({ isLoading: false });
        }
      },

      // ============================================================
      // GET ITEM QUANTITY (HELPER)
      // ============================================================

      getItemQuantity: (medicineId: string, pharmacyId?: string) => {
        const items = get().items || [];
        const item = items.find((i) => {
          const medId = getId(i.medicineId);
          const pharmId = getId(i.pharmacyId);

          if (pharmacyId) {
            return medId === medicineId && pharmId === pharmacyId;
          }
          return medId === medicineId;
        });

        return item ? item.quantity : 0;
      },

      // ============================================================
      // GET ITEM COUNT & GET CART COUNT
      // ============================================================

      getItemCount: () => get().totalItems,
      getCartCount: () => get().totalItems,
      getTotalItems: () => get().totalItems,
      getTotalPrice: () => get().totalPrice,

      // ============================================================
      // GET ITEMS BY PHARMACY
      // ============================================================

      getItemsByPharmacy: () => {
        const items = get().items || [];
        const grouped: Record<string, { pharmacyName: string; items: CartItem[] }> = {};

        items.forEach((item) => {
          const key = item.pharmacyId;
          if (!grouped[key]) {
            grouped[key] = {
              pharmacyName: item.pharmacyName,
              items: [],
            };
          }
          grouped[key].items.push(item);
        });

        return grouped;
      },

      // ============================================================
      // RESET
      // ============================================================

      reset: () => {
        set({
          items: [],
          totalItems: 0,
          totalPrice: 0,
          isLoading: false,
          isSynced: false,
        });
      },
      resetCart: () => get().reset(),
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({
        items: state.items,
        totalItems: state.totalItems,
        totalPrice: state.totalPrice,
      }),
    }
  )
);