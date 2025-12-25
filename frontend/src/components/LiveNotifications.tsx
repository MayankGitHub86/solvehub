import { useEffect, useState } from "react";
import { useSocket } from "@/hooks/useSocket";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";

export function LiveNotifications() {
  const queryClient = useQueryClient();
  const [notifications, setNotifications] = useState<any[]>([]);

  const { isConnected, onlineUsers } = useSocket({
    onNotification: (data) => {
      // Add to notifications list
      setNotifications((prev) => [data, ...prev].slice(0, 5));

      // Invalidate relevant queries based on notification type
      if (data.type === 'answer') {
        queryClient.invalidateQueries({ queryKey: ['question', data.data?.questionId] });
      } else if (data.type === 'vote') {
        queryClient.invalidateQueries({ queryKey: ['question'] });
      } else if (data.type === 'badge') {
        queryClient.invalidateQueries({ queryKey: ['badge-progress'] });
        queryClient.invalidateQueries({ queryKey: ['user-stats'] });
      }
    },
    onConnect: () => {
      console.log('Connected to real-time updates');
    },
    onDisconnect: () => {
      console.log('Disconnected from real-time updates');
    },
  });

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {/* Connection Status */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg glass-strong border border-border shadow-lg">
        {isConnected ? (
          <>
            <Wifi className="w-4 h-4 text-green-500 animate-pulse" />
            <span className="text-xs text-muted-foreground">Live</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4 text-red-500" />
            <span className="text-xs text-muted-foreground">Offline</span>
          </>
        )}
        
        {onlineUsers > 0 && (
          <>
            <div className="w-px h-4 bg-border" />
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{onlineUsers}</span>
          </>
        )}
      </div>

      {/* Recent Notifications (optional - can be removed if using toast) */}
      {notifications.length > 0 && (
        <div className="space-y-2 max-w-sm">
          {notifications.slice(0, 3).map((notif, index) => (
            <div
              key={index}
              className={cn(
                "p-3 rounded-lg glass-strong border shadow-lg animate-in slide-in-from-right",
                "transition-all duration-300",
                notif.type === 'badge' && "border-primary/30 bg-primary/5"
              )}
            >
              <p className="text-sm font-medium">{notif.message}</p>
              {notif.data && (
                <p className="text-xs text-muted-foreground mt-1">
                  {notif.data.badgeName || notif.data.questionId || ''}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
