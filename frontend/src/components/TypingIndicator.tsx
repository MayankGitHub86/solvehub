import { useEffect, useState } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { motion, AnimatePresence } from 'framer-motion';

interface TypingIndicatorProps {
  questionId: string;
}

interface TypingUser {
  userId: string;
  username: string;
}

export function TypingIndicator({ questionId }: TypingIndicatorProps) {
  const { socket, isConnected } = useSocket();
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleTypingStart = (data: TypingUser) => {
      setTypingUsers((prev) => {
        const newMap = new Map(prev);
        newMap.set(data.userId, data.username);
        return newMap;
      });
    };

    const handleTypingStop = (data: TypingUser) => {
      setTypingUsers((prev) => {
        const newMap = new Map(prev);
        newMap.delete(data.userId);
        return newMap;
      });
    };

    socket.on('typing:start', handleTypingStart);
    socket.on('typing:stop', handleTypingStop);

    return () => {
      socket.off('typing:start', handleTypingStart);
      socket.off('typing:stop', handleTypingStop);
    };
  }, [socket, isConnected, questionId]);

  const typingArray = Array.from(typingUsers.values());

  if (typingArray.length === 0) return null;

  const getTypingText = () => {
    if (typingArray.length === 1) {
      return `${typingArray[0]} is typing`;
    } else if (typingArray.length === 2) {
      return `${typingArray[0]} and ${typingArray[1]} are typing`;
    } else {
      return `${typingArray[0]} and ${typingArray.length - 1} others are typing`;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="flex items-center gap-2 text-sm text-muted-foreground italic py-2"
      >
        <div className="flex gap-1">
          <motion.span
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
            className="w-2 h-2 bg-blue-500 rounded-full"
          />
          <motion.span
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
            className="w-2 h-2 bg-blue-500 rounded-full"
          />
          <motion.span
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
            className="w-2 h-2 bg-blue-500 rounded-full"
          />
        </div>
        <span>{getTypingText()}...</span>
      </motion.div>
    </AnimatePresence>
  );
}
