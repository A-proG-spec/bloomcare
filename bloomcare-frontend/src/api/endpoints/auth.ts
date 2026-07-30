import apiClient from '../client';
import type { AuthResponse, User } from '../types';

export const authApi = {
  register: async (data: {
    fullName: string;
    email: string;
    password: string;
    phone?: string;
    image?: File | null;
  }): Promise<AuthResponse> => {
    const formData = new FormData();
    formData.append('fullName', data.fullName);
    formData.append('email', data.email);
    formData.append('password', data.password);
    if (data.phone) formData.append('phone', data.phone);
    if (data.image) formData.append('image', data.image);

    const response = await apiClient.post('/auth/register', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  verifyEmail: async (data: { email: string; otp: string }): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/verify-email', data);
    return response.data;
  },

  resendOTP: async (data: { email: string }): Promise<{ message: string }> => {
    const response = await apiClient.post('/auth/resend-otp', data);
    return response.data;
  },

  login: async (data: { email: string; password: string }): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/login', data);
    return response.data;
  },

  refreshToken: async (refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> => {
    const response = await apiClient.post('/auth/refresh-token', { refreshToken });
    return response.data;
  },

  // ✅ Fixed: Accept refreshToken in body
  logout: async (refreshToken?: string): Promise<{ message: string }> => {
    const response = await apiClient.post('/auth/logout', { refreshToken });
    return response.data;
  },

  getProfile: async (): Promise<{ user: User }> => {
    const response = await apiClient.get('/auth/profile');
    return response.data;
  },

  updateProfile: async (data: { fullName?: string; phone?: string; image?: File | null }): Promise<{ user: User }> => {
    const formData = new FormData();
    if (data.fullName) formData.append('fullName', data.fullName);
    if (data.phone) formData.append('phone', data.phone);
    if (data.image) formData.append('image', data.image);

    const response = await apiClient.put('/auth/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }): Promise<{ message: string }> => {
    const response = await apiClient.put('/auth/change-password', data);
    return response.data;
  },
};