// src/api/client.ts
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// ============================================================
// ✅ SESSION ID MANAGEMENT
// ============================================================

const getSessionId = (): string => {
  let sessionId = localStorage.getItem('cart-session-id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('cart-session-id', sessionId);
  }
  return sessionId;
};

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Refresh lock to prevent multiple refresh requests
let isRefreshing = false;
let refreshPromise: Promise<any> | null = null;
let failedQueue: Array<{
  resolve: (value: any) => void;
  reject: (reason: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// ============================================================
// ✅ REQUEST INTERCEPTOR - Add Token AND Session ID
// ============================================================

apiClient.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState();
    
    // ✅ Add Authorization header if token exists
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    
    // ✅ Always add session ID for cart
    config.headers['x-session-id'] = getSessionId();
    
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// ============================================================
// ✅ RESPONSE INTERCEPTOR - Handle Token Refresh
// ============================================================

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const url = originalRequest?.url || '';

    // =========================================================
    // 1. DON'T attempt refresh for auth endpoints
    // =========================================================
    const isAuthRequest =
      url.includes('/auth/login') ||
      url.includes('/auth/register') ||
      url.includes('/auth/verify-email') ||
      url.includes('/auth/resend-otp') ||
      url.includes('/auth/logout');

    // ✅ If it's an auth request with 401, just reject and let the component handle it
    if (error.response?.status === 401 && isAuthRequest) {
      return Promise.reject(error);
    }

    // =========================================================
    // 2. Refresh token request itself failed - session expired
    // =========================================================
    if (
      error.response?.status === 401 &&
      url.includes('/auth/refresh-token')
    ) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // =========================================================
    // 3. Access token expired - try to refresh
    // =========================================================
    if (error.response?.status === 401 && !originalRequest._retry) {
      // ✅ Prevent multiple refresh attempts
      if (isRefreshing) {
        // ✅ Queue the request and wait for the refresh to complete
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const { refreshToken, user } = useAuthStore.getState();

      // ✅ Check if user exists before attempting refresh
      if (!user || !refreshToken) {
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        // ✅ Store the refresh promise so multiple requests can await it
        refreshPromise = axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/refresh-token`,
          { refreshToken }
        );

        const response = await refreshPromise;

        const { accessToken, refreshToken: newRefreshToken } = response.data.data;

        // ✅ Update the store with new tokens
        useAuthStore.getState().login(user, accessToken, newRefreshToken);

        // ✅ Process queued requests with the new token
        processQueue(null, accessToken);

        // ✅ Retry the original request
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // ✅ Refresh failed – log out
        processQueue(refreshError, null);
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
        refreshPromise = null;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;