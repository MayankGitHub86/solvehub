import { useEffect, useState } from 'react';
import { Eye, Users } from 'lucide-react';
import { useSocket } from '@/hooks/useSocket';
import { motion, AnimatePresence } from 'framer-motion';

interface LiveViewersProps {
  questionId: string;
}

export function LiveViewers({ questionId }: LiveViewersProps) {
  const { socket, isConnected } = useSocket();
  const [viewersCount, setViewersCount] = useState(0);
  const [viewers, setViewers] = useState<string[]>([]);

  useEffect(() => {
    if (!socket || !isConnected) return;

    // Listen for viewer updates
    const handleViewersUpdate = (data: any) => {
      if (data.questionId === questionId) {
        setViewersCount(data.count);
        setViewers(data.viewers);
      }
    };

    socket.on('question:viewers', handleViewersUpdate);

    return () => {
      socket.off('question:viewers', handleViewersUpdate);
    };
  }, [socket, isConnected, questionId]);

  if (!isConnected || viewersCount === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-sm"
      >
        <div className="relative">
          <Eye className="h-4 w-4 text-blue-500" />
          <motion.div
            className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
        <span className="text-blue-500 font-medium">
          {viewersCount} {viewersCount === 1 ? 'viewer' : 'viewers'} watching
        </span>
      </motion.div>
    </AnimatePresence>
  );
}
