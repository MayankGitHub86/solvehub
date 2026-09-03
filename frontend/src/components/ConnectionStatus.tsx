import { useSocket } from '@/hooks/useSocket';
import { motion } from 'framer-motion';
import { Wifi, WifiOff, Users } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function ConnectionStatus() {
  const { isConnected, onlineUsers } = useSocket();

  return (
    <TooltipProvider>
      <div className="flex items-center gap-3">
        {/* Connection Status */}
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border"
              whileHover={{ scale: 1.05 }}
            >
              {isConnected ? (
                <>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Wifi className="h-4 w-4 text-green-500" />
                  </motion.div>
                  <span className="text-xs font-medium text-green-500">Live</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 text-red-500" />
                  <span className="text-xs font-medium text-red-500">Offline</span>
                </>
              )}
            </motion.div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isConnected ? 'Connected to real-time updates' : 'Disconnected'}</p>
          </TooltipContent>
        </Tooltip>

        {/* Online Users Count */}
        {isConnected && onlineUsers > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20"
              >
                <Users className="h-4 w-4 text-blue-500" />
                <span className="text-xs font-medium text-blue-500">
                  {onlineUsers} online
                </span>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{onlineUsers} users currently active</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}
