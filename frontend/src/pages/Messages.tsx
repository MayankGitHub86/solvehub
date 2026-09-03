import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Send, Search, MoreVertical, Trash2, User as UserIcon, Plus, X } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AnimatedPage, FadeIn } from "@/components/AnimatedPage";
import { useAuth } from "@/context/auth";
import { useSocket } from "@/hooks/useSocket";
import api from "@/lib/api";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const Messages = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [showNewMessageDialog, setShowNewMessageDialog] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { socket, joinConversation, leaveConversation } = useSocket();

  // Fetch conversations
  const { data: conversationsData } = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const res: any = await api.getConversations();
      return res.data;
    },
    enabled: !!user,
  });

  // Search users for new conversation
  const { data: usersData } = useQuery({
    queryKey: ["users-search", userSearchQuery],
    queryFn: async () => {
      const res: any = await api.searchUsers(userSearchQuery);
      return res.data;
    },
    enabled: userSearchQuery.length >= 2,
  });

  // Create new conversation
  const createConversationMutation = useMutation({
    mutationFn: async (userId: string) => {
      return api.getOrCreateConversation(userId);
    },
    onSuccess: (res: any) => {
      setSelectedConversation(res.data.id);
      setShowNewMessageDialog(false);
      setUserSearchQuery("");
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      toast.success("Conversation started!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to start conversation");
    },
  });

  // Fetch messages for selected conversation
  const { data: messagesData } = useQuery({
    queryKey: ["messages", selectedConversation],
    queryFn: async () => {
      const res: any = await api.getMessages(selectedConversation!);
      return res.data;
    },
    enabled: !!selectedConversation,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (content: string) => api.sendMessage(selectedConversation!, content),
    onSuccess: () => {
      setMessageInput("");
      queryClient.invalidateQueries({ queryKey: ["messages", selectedConversation] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to send message");
    },
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (conversationId: string) => api.markMessagesAsRead(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  // Delete conversation mutation
  const deleteConversationMutation = useMutation({
    mutationFn: (conversationId: string) => api.deleteConversation(conversationId),
    onSuccess: () => {
      toast.success("Conversation deleted");
      setSelectedConversation(null);
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete conversation");
    },
  });

  // Join conversation room on selection
  useEffect(() => {
    if (selectedConversation) {
      joinConversation(selectedConversation);
      markAsReadMutation.mutate(selectedConversation);
      
      return () => {
        leaveConversation(selectedConversation);
      };
    }
  }, [selectedConversation]);

  // Listen for new messages
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message: any) => {
      queryClient.invalidateQueries({ queryKey: ["messages", selectedConversation] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    };

    socket.on("message:new", handleNewMessage);

    return () => {
      socket.off("message:new", handleNewMessage);
    };
  }, [socket, selectedConversation]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesData]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageInput.trim() && selectedConversation) {
      sendMessageMutation.mutate(messageInput.trim());
    }
  };

  const conversations = conversationsData || [];
  const messages = messagesData?.messages || [];
  const selectedConv = conversations.find((c: any) => c.id === selectedConversation);

  const filteredConversations = conversations.filter((conv: any) =>
    conv.otherUser.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.otherUser.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AnimatedPage className="min-h-screen">
      <Navbar />
      <main className="pt-16 pb-8">
        <div className="container mx-auto px-4 max-w-[1800px]">
          <div className="flex gap-4">
            <Sidebar />
            
            <div className="flex-1 min-w-0">
              <div className="glass rounded-2xl overflow-hidden h-[calc(100vh-8rem)]">
                <div className="grid grid-cols-12 h-full">
                  {/* Conversations List */}
                  <div className="col-span-12 md:col-span-4 border-r border-border flex flex-col">
                    {/* Header */}
                    <div className="p-4 border-b border-border">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold">Messages</h2>
                        <Dialog open={showNewMessageDialog} onOpenChange={setShowNewMessageDialog}>
                          <DialogTrigger asChild>
                            <Button size="sm">
                              <Plus className="w-4 h-4 mr-2" />
                              New Message
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Start New Conversation</DialogTitle>
                              <DialogDescription>
                                Search for a user to start messaging
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                  placeholder="Search users..."
                                  value={userSearchQuery}
                                  onChange={(e) => setUserSearchQuery(e.target.value)}
                                  className="pl-10"
                                />
                              </div>
                              <ScrollArea className="h-[300px]">
                                {userSearchQuery.length < 2 ? (
                                  <div className="text-center text-muted-foreground py-8">
                                    <UserIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <p>Type at least 2 characters to search</p>
                                  </div>
                                ) : usersData && usersData.length > 0 ? (
                                  <div className="space-y-2">
                                    {usersData.map((searchUser: any) => (
                                      <button
                                        key={searchUser.id}
                                        onClick={() => createConversationMutation.mutate(searchUser.id)}
                                        disabled={createConversationMutation.isPending}
                                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                                      >
                                        <Avatar className="w-10 h-10">
                                          <AvatarImage src={searchUser.avatar} />
                                          <AvatarFallback>{searchUser.name[0]}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 text-left">
                                          <div className="font-medium">{searchUser.name}</div>
                                          <div className="text-sm text-muted-foreground">@{searchUser.username}</div>
                                        </div>
                                      </button>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-center text-muted-foreground py-8">
                                    <UserIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <p>No users found</p>
                                  </div>
                                )}
                              </ScrollArea>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Search conversations..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    {/* Conversations */}
                    <ScrollArea className="flex-1">
                      {filteredConversations.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                          <UserIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p>No conversations yet</p>
                          <p className="text-sm mt-1">Start chatting with other users!</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-border">
                          {filteredConversations.map((conv: any) => (
                            <button
                              key={conv.id}
                              onClick={() => setSelectedConversation(conv.id)}
                              className={cn(
                                "w-full p-4 text-left hover:bg-muted/50 transition-colors",
                                selectedConversation === conv.id && "bg-muted"
                              )}
                            >
                              <div className="flex items-start gap-3">
                                <div className="relative">
                                  <Avatar className="w-12 h-12">
                                    <AvatarImage src={conv.otherUser.avatar} />
                                    <AvatarFallback>{conv.otherUser.name[0]}</AvatarFallback>
                                  </Avatar>
                                  {conv.otherUser.isOnline && (
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-semibold truncate">{conv.otherUser.name}</span>
                                    {conv.lastMessage && (
                                      <span className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(new Date(conv.lastMessage.createdAt), { addSuffix: true })}
                                      </span>
                                    )}
                                  </div>
                                  {conv.lastMessage && (
                                    <p className="text-sm text-muted-foreground truncate">
                                      {conv.lastMessage.content}
                                    </p>
                                  )}
                                  {conv.unreadCount > 0 && (
                                    <div className="mt-1">
                                      <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-primary rounded-full">
                                        {conv.unreadCount}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </div>

                  {/* Chat Area */}
                  <div className="col-span-12 md:col-span-8 flex flex-col">
                    {selectedConv ? (
                      <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-border flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={selectedConv.otherUser.avatar} />
                              <AvatarFallback>{selectedConv.otherUser.name[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-semibold">{selectedConv.otherUser.name}</h3>
                              <p className="text-xs text-muted-foreground">
                                {selectedConv.otherUser.isOnline ? "Online" : "Offline"}
                              </p>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => deleteConversationMutation.mutate(selectedConv.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Conversation
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {/* Messages */}
                        <ScrollArea className="flex-1 p-4">
                          <div className="space-y-4">
                            {messages.map((message: any) => {
                              const isOwn = message.senderId === user?.id;
                              return (
                                <div
                                  key={message.id}
                                  className={cn(
                                    "flex",
                                    isOwn ? "justify-end" : "justify-start"
                                  )}
                                >
                                  <div
                                    className={cn(
                                      "max-w-[70%] rounded-2xl px-4 py-2",
                                      isOwn
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted"
                                    )}
                                  >
                                    <p className="text-sm">{message.content}</p>
                                    <p className={cn(
                                      "text-xs mt-1",
                                      isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                                    )}>
                                      {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                            <div ref={messagesEndRef} />
                          </div>
                        </ScrollArea>

                        {/* Message Input */}
                        <form onSubmit={handleSendMessage} className="p-4 border-t border-border">
                          <div className="flex gap-2">
                            <Input
                              placeholder="Type a message..."
                              value={messageInput}
                              onChange={(e) => setMessageInput(e.target.value)}
                              disabled={sendMessageMutation.isPending}
                            />
                            <Button
                              type="submit"
                              disabled={!messageInput.trim() || sendMessageMutation.isPending}
                            >
                              <Send className="w-4 h-4" />
                            </Button>
                          </div>
                        </form>
                      </>
                    ) : (
                      <div className="flex-1 flex items-center justify-center text-muted-foreground">
                        <div className="text-center">
                          <UserIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                          <p className="text-lg">Select a conversation to start messaging</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </AnimatedPage>
  );
};

export default Messages;
