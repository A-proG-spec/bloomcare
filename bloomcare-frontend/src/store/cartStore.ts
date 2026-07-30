import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  medicineId: string;
  medicineName: string;
  price: number;
  quantity: number;
  image?: string;
  pharmacyId: string;
  pharmacyName: string;
  stockStatus: string;
  maxQuantity: number;
}

interface CartState {
  items: CartItem[];
  
  getItemQuantity: (medicineId: string) => number;
  isInCart: (medicineId: string) => boolean;
  getItemsByPharmacy: () => { [pharmacyId: string]: { pharmacyName: string; items: CartItem[] } };
  getPharmacyIds: () => string[];
  addItem: (item: CartItem) => boolean;
  removeItem: (medicineId: string) => void;
  updateQuantity: (medicineId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getCartCount: () => number;
  getTotalPriceByPharmacy: (pharmacyId: string) => number;
  
  // ✅ Add method to clear cart with storage
  clearCartAndStorage: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      getItemQuantity: (medicineId) => {
        const item = get().items.find(i => i.medicineId === medicineId);
        return item?.quantity || 0;
      },

      isInCart: (medicineId) => {
        return get().items.some(i => i.medicineId === medicineId);
      },

      getItemsByPharmacy: () => {
        const items = get().items;
        const grouped: { [pharmacyId: string]: { pharmacyName: string; items: CartItem[] } } = {};
        
        items.forEach(item => {
          if (!grouped[item.pharmacyId]) {
            grouped[item.pharmacyId] = {
              pharmacyName: item.pharmacyName,
              items: [],
            };
          }
          grouped[item.pharmacyId].items.push(item);
        });
        
        return grouped;
      },

      getPharmacyIds: () => {
        const items = get().items;
        const ids = new Set(items.map(item => item.pharmacyId));
        return Array.from(ids);
      },

      addItem: (item) => {
        const { items } = get();
        
        const existing = items.find(i => i.medicineId === item.medicineId && i.pharmacyId === item.pharmacyId);
        let updatedItems;
        
        if (existing) {
          const newQty = Math.min(existing.quantity + item.quantity, item.maxQuantity || 999);
          updatedItems = items.map(i =>
            i.medicineId === item.medicineId && i.pharmacyId === item.pharmacyId
              ? { ...i, quantity: newQty }
              : i
          );
        } else {
          updatedItems = [...items, { ...item, quantity: item.quantity || 1 }];
        }
        
        set({ items: updatedItems });
        return true;
      },

      removeItem: (medicineId) => {
        set((state) => ({
          items: state.items.filter(i => i.medicineId !== medicineId),
        }));
      },

      updateQuantity: (medicineId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(medicineId);
          return;
        }
        set((state) => ({
          items: state.items.map(i =>
            i.medicineId === medicineId
              ? { ...i, quantity: Math.min(quantity, i.maxQuantity || 999) }
              : i
          ),
        }));
      },

      clearCart: () => {
        console.log('🛒 Clearing cart...');
        set({ items: [] });
      },

      // ✅ Add this method to clear cart AND storage
      clearCartAndStorage: () => {
        console.log('🛒 Clearing cart and storage...');
        set({ items: [] });
        // ✅ Remove the persisted cart from localStorage
        localStorage.removeItem('cart-storage');
      },

      getTotalItems: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },

      getCartCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },

      getTotalPriceByPharmacy: (pharmacyId) => {
        return get().items
          .filter(item => item.pharmacyId === pharmacyId)
          .reduce((sum, item) => sum + item.price * item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);