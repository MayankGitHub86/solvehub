import { Bell, X, Clock } from "lucide-react";
import { useNotificationStore } from "@/lib/notification-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function NotificationPanel() {
  const { notifications, markAsRead, clearAll, unreadCount } = useNotificationStore();
  const [isOpen, setIsOpen] = useState(false);
  const unread = unreadCount();

  const typeColors: Record<string, string> = {
    'question:new': 'bg-blue-500/20 text-blue-400',
    'answer:new': 'bg-green-500/20 text-green-400',
    'answer:accepted': 'bg-yellow-500/20 text-yellow-400',
    'vote:received': 'bg-purple-500/20 text-purple-400',
    'comment:new': 'bg-pink-500/20 text-pink-400',
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
      >
        <Bell className="w-5 h-5 text-muted-foreground" />
        {unread > 0 && (
          <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-destructive text-white rounded-full text-xs flex items-center justify-center font-bold animate-pulse">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-80 glass rounded-2xl p-4 shadow-xl border border-white/10 z-50">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Notifications</h3>
            {notifications.length > 0 && (
              <button
                onClick={() => clearAll()}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto space-y-2">
            {notifications.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <Bell className="w-6 h-6 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => markAsRead(notif.id)}
                  className={cn(
                    "p-3 rounded-xl cursor-pointer transition-all hover:bg-muted/50",
                    notif.read ? 'opacity-60' : 'bg-primary/10 border border-primary/20'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "w-2 h-2 rounded-full mt-1.5 shrink-0",
                      typeColors[notif.type] || 'bg-muted'
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground line-clamp-2">
                        {notif.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(notif.timestamp)}
                      </p>
                    </div>
                    {!notif.read && (
                      <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Overlay to close panel */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

function formatTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}
