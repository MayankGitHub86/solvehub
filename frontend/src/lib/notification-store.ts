import { create } from 'zustand';
import api from './api';

export type Notification = {
  id: string;
  type: string;
  title?: string;
  message: string;
  link?: string;
  data?: any;
  isRead: boolean;
  read?: boolean; // Alias for backward compatibility
  createdAt: Date;
  timestamp?: Date; // Alias for backward compatibility
};

type NotificationStore = {
  notifications: Notification[];
  isLoading: boolean;
  addNotification: (event: { type: string; message: string; title?: string; link?: string; data?: any }) => void;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearAll: () => Promise<void>;
  unreadCount: () => number;
};

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  isLoading: false,
  
  // Fetch notifications from database
  fetchNotifications: async () => {
    try {
      set({ isLoading: true });
      const response: any = await api.getNotifications();
      const notifications = response.data.notifications.map((n: any) => ({
        ...n,
        read: n.isRead, // Alias
        timestamp: new Date(n.createdAt), // Alias
      }));
      set({ notifications, isLoading: false });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      set({ isLoading: false });
    }
  },
  
  // Add notification (for real-time updates)
  addNotification: (event) => {
    const notification: Notification = {
      id: `temp-${Date.now()}`,
      type: event.type,
      title: event.title,
      message: event.message,
      link: event.link,
      data: event.data,
      isRead: false,
      read: false,
      createdAt: new Date(),
      timestamp: new Date(),
    };
    set((state) => ({
      notifications: [notification, ...state.notifications].slice(0, 50),
    }));
  },
  
  // Mark as read
  markAsRead: async (id) => {
    try {
      await api.markNotificationAsRead(id);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, isRead: true, read: true } : n
        ),
      }));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  },
  
  // Mark all as read
  markAllAsRead: async () => {
    try {
      await api.markAllNotificationsAsRead();
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true, read: true })),
      }));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  },
  
  // Clear all
  clearAll: async () => {
    try {
      await api.deleteAllNotifications();
      set({ notifications: [] });
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  },
  
  // Get unread count
  unreadCount: () => get().notifications.filter((n) => !n.isRead && !n.read).length,
}));
