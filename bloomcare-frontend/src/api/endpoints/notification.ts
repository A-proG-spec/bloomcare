import apiClient from '../client';

export const notificationApi = {
  getNotifications: async (params?: {
    page?: number;
    limit?: number;
    isRead?: boolean;
  }) => {
    const response = await apiClient.get('/notifications', { params });
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await apiClient.get('/notifications/unread-count');
    return response.data.data;
  },

  getNotificationById: async (id: string) => {
    const response = await apiClient.get(`/notifications/${id}`);
    return response.data.data;
  },

  markAsRead: async (id: string) => {
    const response = await apiClient.put(`/notifications/${id}/read`);
    return response.data.data;
  },

  markAsUnread: async (id: string) => {
    const response = await apiClient.put(`/notifications/${id}/unread`);
    return response.data.data;
  },

  markMultipleAsRead: async (data: {
    notificationIds?: string[];
    markAll?: boolean;
  }) => {
    const response = await apiClient.post('/notifications/mark-read', data);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await apiClient.post('/notifications/mark-all-read');
    return response.data;
  },

  deleteNotification: async (id: string) => {
    const response = await apiClient.delete(`/notifications/${id}`);
    return response.data;
  },

  deleteAllNotifications: async () => {
    const response = await apiClient.delete('/notifications');
    return response.data;
  },
};