import { useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { Toaster as Sonner, toast as sonner } from '@/components/ui/sonner';
import { useNotificationStore } from '@/lib/notification-store';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

type EventPayload = {
  type: string;
  message: string;
  data?: any;
};

export function useNotifications(userId?: string) {
  useEffect(() => {
    const url = new URL(`${API_BASE_URL}/notifications/stream`);
    if (userId) url.searchParams.set('userId', userId);

    const es = new EventSource(url.toString(), { withCredentials: false });

    es.onmessage = (event) => {
      try {
        const payload: EventPayload = JSON.parse(event.data);
        if (payload.type === 'health') return; // skip heartbeat

        // Add to notification store
        useNotificationStore.getState().addNotification({
          type: payload.type,
          message: payload.message,
          data: payload.data,
        });

        const titleMap: Record<string, string> = {
          'question:new': 'New Question',
          'answer:new': 'New Answer',
          'answer:accepted': 'Answer Accepted',
          'vote:received': 'New Vote',
          'comment:new': 'New Comment',
        };

        const title = titleMap[payload.type] || 'Notification';

        // Sonner for prominent notification
        sonner(`${title}: ${payload.message}`);

        // shadcn toast as subtle alternative (kept for compatibility)
        toast({ title, description: payload.message });
      } catch (e) {
        console.error('Notification parse error', e);
      }
    };

    es.onerror = (e) => {
      console.warn('SSE connection error', e);
    };

    return () => es.close();
  }, [userId]);
}

export default useNotifications;
