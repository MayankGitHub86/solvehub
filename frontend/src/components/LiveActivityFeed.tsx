import { useEffect, useState } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, ThumbsUp, Award, User, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Activity {
  userId: string;
  type: 'answer' | 'vote' | 'comment' | 'badge' | 'question';
  message: string;
  timestamp: Date;
  id: string;
}

export function LiveActivityFeed() {
  const { socket, isConnected } = useSocket();
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleNewActivity = (data: any) => {
      const newActivity: Activity = {
        userId: data.userId,
        type: data.activity.type,
        message: data.activity.message,
        timestamp: new Date(data.timestamp),
        id: `${data.userId}-${Date.now()}`,
      };

      setActivities((prev) => [newActivity, ...prev].slice(0, 10)); // Keep last 10
    };

    socket.on('activity:new', handleNewActivity);

    return () => {
      socket.off('activity:new', handleNewActivity);
    };
  }, [socket, isConnected]);

  const getIcon = (type: Activity['type']) => {
    switch (type) {
      case 'answer':
        return <MessageSquare className="h-4 w-4 text-green-500" />;
      case 'vote':
        return <ThumbsUp className="h-4 w-4 text-blue-500" />;
      case 'comment':
        return <MessageSquare className="h-4 w-4 text-purple-500" />;
      case 'badge':
        return <Award className="h-4 w-4 text-yellow-500" />;
      case 'question':
        return <User className="h-4 w-4 text-indigo-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  if (!isConnected || activities.length === 0) return null;

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          🔴
        </motion.div>
        Live Activity
      </h3>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {activities.map((activity) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex items-start gap-3 p-2 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="mt-1">{getIcon(activity.type)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground">{activity.message}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
