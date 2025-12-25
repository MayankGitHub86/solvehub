import { useEffect, useState } from "react";
import { useSocket } from "@/hooks/useSocket";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

interface TypingIndicatorProps {
  questionId: string;
}

export function TypingIndicator({ questionId }: TypingIndicatorProps) {
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket || !questionId) return;

    // Listen for typing events
    const handleTypingStart = (data: { username: string }) => {
      setTypingUsers((prev) => {
        if (!prev.includes(data.username)) {
          return [...prev, data.username];
        }
        return prev;
      });
    };

    const handleTypingStop = (data: { username: string }) => {
      setTypingUsers((prev) => prev.filter((u) => u !== data.username));
    };

    socket.on("typing:start", handleTypingStart);
    socket.on("typing:stop", handleTypingStop);

    return () => {
      socket.off("typing:start", handleTypingStart);
      socket.off("typing:stop", handleTypingStop);
    };
  }, [socket, questionId]);

  if (typingUsers.length === 0) return null;

  const displayText =
    typingUsers.length === 1
      ? `${typingUsers[0]} is typing...`
      : typingUsers.length === 2
      ? `${typingUsers[0]} and ${typingUsers[1]} are typing...`
      : `${typingUsers[0]} and ${typingUsers.length - 1} others are typing...`;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="flex items-center gap-2 text-sm text-muted-foreground py-2"
      >
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>{displayText}</span>
      </motion.div>
    </AnimatePresence>
  );
}
