import { create } from 'zustand';
import type { Notification } from '../api/types';
import { notificationApi } from '../api/endpoints';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  isOpen: boolean;
  
  fetchNotifications: (params?: {
    page?: number;
    limit?: number;
    isRead?: boolean;
  }) => Promise<void>;
  
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAsUnread: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  toggleNotifications: () => void;
  closeNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  isOpen: false,

  toggleNotifications: () => set((state) => ({ isOpen: !state.isOpen })),
  closeNotifications: () => set({ isOpen: false }),

  fetchNotifications: async (params) => {
    set({ isLoading: true });
    try {
      const response = await notificationApi.getNotifications(params);
      set({
        notifications: response.data?.notifications || [],
        unreadCount: response.data?.pagination?.unreadCount || 0,
      });
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      set({ notifications: [], unreadCount: 0 });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const result = await notificationApi.getUnreadCount();
      set({ unreadCount: result.unreadCount || 0 });
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
      set({ unreadCount: 0 });
    }
  },

  markAsRead: async (id) => {
    try {
      await notificationApi.markAsRead(id);
      const notifications = get().notifications.map(n =>
        n._id === id ? { ...n, isRead: true } : n
      );
      set({ 
        notifications, 
        unreadCount: Math.max(0, get().unreadCount - 1) 
      });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  },

  markAsUnread: async (id) => {
    try {
      await notificationApi.markAsUnread(id);
      const notifications = get().notifications.map(n =>
        n._id === id ? { ...n, isRead: false } : n
      );
      set({ 
        notifications, 
        unreadCount: get().unreadCount + 1 
      });
    } catch (error) {
      console.error('Failed to mark notification as unread:', error);
    }
  },

  markAllAsRead: async () => {
    try {
      await notificationApi.markAllAsRead();
      const notifications = get().notifications.map(n => ({ ...n, isRead: true }));
      set({ notifications, unreadCount: 0 });
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  },

  deleteNotification: async (id) => {
    try {
      await notificationApi.deleteNotification(id);
      const notification = get().notifications.find(n => n._id === id);
      const notifications = get().notifications.filter(n => n._id !== id);
      set({
        notifications,
        unreadCount: notification?.isRead ? get().unreadCount : Math.max(0, get().unreadCount - 1),
      });
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  },
}));