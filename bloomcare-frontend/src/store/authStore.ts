// src/store/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../api/types';
import { authApi } from '../api/endpoints/auth';
import { useCartStore } from './cartStore';

const GUEST_CART_KEY = 'guest-cart';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  isAdmin: () => boolean;
  isPharmacyOwner: () => boolean;
  isUser: () => boolean;
  hasRole: (role: string | string[]) => boolean;

  login: (user: User, accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      isAdmin: () => {
        const { user } = get();
        return user?.role === 'admin';
      },

      isPharmacyOwner: () => {
        const { user } = get();
        return user?.role === 'pharmacy_owner';
      },

      isUser: () => {
        const { user } = get();
        return user?.role === 'user';
      },

      hasRole: (role: string | string[]) => {
        const { user } = get();
        if (!user) return false;
        const roles = Array.isArray(role) ? role : [role];
        return roles.includes(user.role);
      },

      // ============================================================
      // ✅ FIXED LOGIN - Proper async flow with await
      // ============================================================

      login: async (user, accessToken, refreshToken) => {
        // ✅ Step 1: Set auth state FIRST
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
        });

        // ✅ Step 2: Read guest cart
        let guestItems: any[] = [];
        try {
          const guestCart = localStorage.getItem(GUEST_CART_KEY);
          if (guestCart) {
            guestItems = JSON.parse(guestCart);
            console.log('📦 Found guest cart:', guestItems.length, 'items');
          }
        } catch (error) {
          console.error('Failed to read guest cart:', error);
        }

        // ✅ Step 3: MERGE guest cart (await to ensure completion)
        if (guestItems && guestItems.length > 0) {
          try {
            console.log('🔄 Merging guest cart...');
            await useCartStore.getState().mergeGuestCart(guestItems);
            console.log('✅ Guest cart merged successfully');
          } catch (error) {
            console.error('Failed to merge guest cart:', error);
          }
        }

        // ✅ Step 4: FETCH user cart from database (await to ensure completion)
        try {
          console.log('🔄 Fetching user cart from database...');
          await useCartStore.getState().fetchCart();
          console.log('✅ User cart fetched successfully');
        } catch (error) {
          console.error('Failed to fetch user cart:', error);
        }
      },

      // ============================================================
      // LOGOUT - Clear local cart state & call auth logout
      // ============================================================

      logout: async () => {
        // 1. Save cart as guest before logout
        try {
          const cartItems = useCartStore.getState().items;
          if (cartItems && cartItems.length > 0) {
            localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cartItems));
            console.log('💾 Saved cart as guest:', cartItems.length, 'items');
          }
        } catch (error) {
          console.error('Failed to save guest cart:', error);
        }

        // 2. Reset client-side cart store
        try {
          useCartStore.getState().reset();
        } catch (error) {
          console.error('Failed to reset local cart:', error);
        }

        // Clean up persisted storage
        localStorage.removeItem('cart-storage');

        // 3. Call backend logout API
        try {
          const { refreshToken } = get();
          if (refreshToken) {
            await authApi.logout(refreshToken);
          }
        } catch (error) {
          console.log('Logout API error:', error);
        }

        // 4. Clear auth state
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },

      updateUser: (userData) => {
        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                ...userData,
                pharmacyApplication: userData.pharmacyApplication
                  ? { ...state.user.pharmacyApplication, ...userData.pharmacyApplication }
                  : state.user.pharmacyApplication,
              }
            : null,
        }));
      },

      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,  // ✅ Fixed typo
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);