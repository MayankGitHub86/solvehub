import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';

interface UseSocketOptions {
  onNotification?: (data: any) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export function useSocket(options: UseSocketOptions = {}) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      return;
    }

    // Initialize socket connection
    const socket = io(SOCKET_URL, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    // Connection handlers
    socket.on('connect', () => {
      console.log('✅ Socket connected');
      setIsConnected(true);
      options.onConnect?.();
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      setIsConnected(false);
      options.onDisconnect?.();
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    // Notification handler
    socket.on('notification', (data) => {
      console.log('📬 Notification received:', data);
      options.onNotification?.(data);
      
      // Show toast notification
      if (data.type === 'badge') {
        toast.success(data.message, {
          description: `You earned ${data.data?.badgePoints || 0} points!`,
          duration: 5000,
        });
      } else {
        toast.info(data.message);
      }
    });

    // Online users count
    socket.on('online:count', (count: number) => {
      setOnlineUsers(count);
    });

    // Cleanup
    return () => {
      socket.disconnect();
    };
  }, []);

  // Join a question room
  const joinQuestion = (questionId: string) => {
    socketRef.current?.emit('join:question', questionId);
  };

  // Leave a question room
  const leaveQuestion = (questionId: string) => {
    socketRef.current?.emit('leave:question', questionId);
  };

  // Join a conversation room
  const joinConversation = (conversationId: string) => {
    socketRef.current?.emit('join:conversation', conversationId);
  };

  // Leave a conversation room
  const leaveConversation = (conversationId: string) => {
    socketRef.current?.emit('leave:conversation', conversationId);
  };

  // Emit typing indicator
  const startTyping = (questionId: string, username: string) => {
    socketRef.current?.emit('typing:start', { questionId, username });
  };

  const stopTyping = (questionId: string) => {
    socketRef.current?.emit('typing:stop', { questionId });
  };

  // Emit vote cast
  const emitVote = (data: {
    questionId: string;
    targetId: string;
    targetType: 'question' | 'answer';
    voteCount: number;
  }) => {
    socketRef.current?.emit('vote:cast', data);
  };

  // Emit answer submission
  const emitAnswer = (questionId: string, answer: any) => {
    socketRef.current?.emit('answer:submit', { questionId, answer });
  };

  // Emit comment submission
  const emitComment = (data: {
    questionId: string;
    targetId: string;
    targetType: 'question' | 'answer';
    comment: any;
  }) => {
    socketRef.current?.emit('comment:submit', data);
  };

  // Emit question update
  const emitQuestionUpdate = (questionId: string, question: any) => {
    socketRef.current?.emit('question:update', { questionId, question });
  };

  // Emit activity
  const emitActivity = (activity: {
    type: 'answer' | 'vote' | 'comment' | 'badge' | 'question';
    message: string;
  }) => {
    socketRef.current?.emit('activity:broadcast', activity);
  };

  return {
    socket: socketRef.current,
    isConnected,
    onlineUsers,
    joinQuestion,
    leaveQuestion,
    joinConversation,
    leaveConversation,
    startTyping,
    stopTyping,
    emitVote,
    emitAnswer,
    emitComment,
    emitQuestionUpdate,
    emitActivity,
  };
}
