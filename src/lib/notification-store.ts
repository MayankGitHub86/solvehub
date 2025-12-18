import { create } from 'zustand';

export type Notification = {
  id: string;
  type: string;
  message: string;
  data?: any;
  read: boolean;
  timestamp: Date;
};

type NotificationStore = {
  notifications: Notification[];
  addNotification: (event: { type: string; message: string; data?: any }) => void;
  markAsRead: (id: string) => void;
  clearAll: () => void;
  unreadCount: () => number;
};

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  addNotification: (event) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const notification: Notification = {
      id,
      type: event.type,
      message: event.message,
      data: event.data,
      read: false,
      timestamp: new Date(),
    };
    set((state) => ({
      notifications: [notification, ...state.notifications].slice(0, 50), // Keep last 50
    }));
  },
  markAsRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    }));
  },
  clearAll: () => set({ notifications: [] }),
  unreadCount: () => get().notifications.filter((n) => !n.read).length,
}));
