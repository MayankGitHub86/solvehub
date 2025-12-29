import { useEffect, useState } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface LiveVoteCounterProps {
  targetId: string;
  targetType: 'question' | 'answer';
  initialVoteCount: number;
  questionId: string;
}

export function LiveVoteCounter({
  targetId,
  targetType,
  initialVoteCount,
  questionId,
}: LiveVoteCounterProps) {
  const { socket, isConnected } = useSocket();
  const [voteCount, setVoteCount] = useState(initialVoteCount);
  const [showAnimation, setShowAnimation] = useState(false);
  const [animationType, setAnimationType] = useState<'up' | 'down'>('up');

  useEffect(() => {
    setVoteCount(initialVoteCount);
  }, [initialVoteCount]);

  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleVoteUpdate = (data: any) => {
      if (data.targetId === targetId && data.targetType === targetType) {
        const oldCount = voteCount;
        setVoteCount(data.voteCount);
        
        // Show animation
        if (data.voteCount > oldCount) {
          setAnimationType('up');
        } else {
          setAnimationType('down');
        }
        setShowAnimation(true);
        setTimeout(() => setShowAnimation(false), 1000);
      }
    };

    socket.on('vote:update', handleVoteUpdate);

    return () => {
      socket.off('vote:update', handleVoteUpdate);
    };
  }, [socket, isConnected, targetId, targetType, voteCount]);

  return (
    <div className="relative">
      <motion.div
        key={voteCount}
        initial={{ scale: 1 }}
        animate={{ scale: showAnimation ? [1, 1.2, 1] : 1 }}
        className="text-lg font-bold"
      >
        {voteCount}
      </motion.div>
      
      <AnimatePresence>
        {showAnimation && (
          <motion.div
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 0, y: animationType === 'up' ? -20 : 20 }}
            exit={{ opacity: 0 }}
            className="absolute -top-6 left-1/2 -translate-x-1/2"
          >
            {animationType === 'up' ? (
              <ArrowUp className="h-4 w-4 text-green-500" />
            ) : (
              <ArrowDown className="h-4 w-4 text-red-500" />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
