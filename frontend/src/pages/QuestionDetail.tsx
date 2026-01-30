import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowUp, ArrowDown, MessageCircle, Eye, CheckCircle, ArrowLeft, Bookmark, BookmarkCheck, FolderPlus } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MarkdownEditor } from "@/components/MarkdownEditor";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MarkdownPreview } from "@/components/MarkdownEditor";
import { AIAnswerSuggestion } from "@/components/AIAnswerSuggestion";
import { TypingIndicator } from "@/components/TypingIndicator";
import { CommentSection } from "@/components/CommentSection";
import { LiveViewers } from "@/components/LiveViewers";
import { ConnectionStatus } from "@/components/ConnectionStatus";
import { LiveVoteCounter } from "@/components/LiveVoteCounter";
import { AddToCollectionDialog } from "@/components/AddToCollectionDialog";
import { useSocket } from "@/hooks/useSocket";
import api from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { useAuth } from "@/context/auth";
import { AnimatedPage } from "@/components/AnimatedPage";

const QuestionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [answerContent, setAnswerContent] = useState("");
  const [questionVotes, setQuestionVotes] = useState(0);
  const [answerVotes, setAnswerVotes] = useState<Record<string, number>>({});
  const [isSaved, setIsSaved] = useState(false);
  const [isCollectionDialogOpen, setIsCollectionDialogOpen] = useState(false);
  
  // Socket.IO for real-time features
  const { 
    joinQuestion, 
    leaveQuestion, 
    startTyping, 
    stopTyping,
    emitVote,
    emitAnswer,
    socket,
    isConnected
  } = useSocket();
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Join question room on mount
  useEffect(() => {
    if (id) {
      joinQuestion(id);
      return () => {
        leaveQuestion(id);
      };
    }
  }, [id, joinQuestion, leaveQuestion]);

  // Listen for real-time updates
  useEffect(() => {
    if (!socket || !isConnected) return;

    // Listen for new answers
    const handleNewAnswer = (data: any) => {
      if (data.questionId === id) {
        queryClient.invalidateQueries({ queryKey: ["question", id] });
        toast.info("New answer posted!");
      }
    };

    // Listen for vote updates
    const handleVoteUpdate = (data: any) => {
      if (data.targetType === 'question' && data.targetId === id) {
        setQuestionVotes(data.voteCount);
      } else if (data.targetType === 'answer') {
        setAnswerVotes(prev => ({ ...prev, [data.targetId]: data.voteCount }));
      }
    };

    // Listen for new comments
    const handleNewComment = (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["question", id] });
    };

    socket.on('answer:new', handleNewAnswer);
    socket.on('vote:update', handleVoteUpdate);
    socket.on('comment:new', handleNewComment);

    return () => {
      socket.off('answer:new', handleNewAnswer);
      socket.off('vote:update', handleVoteUpdate);
      socket.off('comment:new', handleNewComment);
    };
  }, [socket, isConnected, id, queryClient]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["question", id],
    queryFn: async () => {
      const res: any = await api.getQuestionById(id!);
      return res.data;
    },
    enabled: !!id,
  });

  // Fetch vote stats separately after question loads
  useQuery({
    queryKey: ["question-votes", id],
    queryFn: async () => {
      const voteScore: any = await api.getVoteStats(id);
      setQuestionVotes(voteScore.data.score);
      return voteScore.data;
    },
    enabled: !!id && !!data,
  });

  // Fetch answer votes separately
  useQuery({
    queryKey: ["answer-votes", id],
    queryFn: async () => {
      if (data?.answers) {
        const answerVotesMap: Record<string, number> = {};
        for (const answer of data.answers) {
          try {
            const answerVoteScore: any = await api.getVoteStats(undefined, answer.id);
            answerVotesMap[answer.id] = answerVoteScore.data.score;
          } catch (error) {
            answerVotesMap[answer.id] = 0;
          }
        }
        setAnswerVotes(answerVotesMap);
        return answerVotesMap;
      }
      return {};
    },
    enabled: !!id && !!data && !!data.answers,
  });

  const createAnswerMutation = useMutation({
    mutationFn: async (data: { content: string; questionId: string }) => {
      return api.createAnswer(data);
    },
    onSuccess: () => {
      toast.success("Answer posted!");
      setAnswerContent("");
      queryClient.invalidateQueries({ queryKey: ["question", id] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to post answer");
    },
  });

  const voteQuestionMutation = useMutation({
    mutationFn: (value: 1 | -1) => api.vote({ value, questionId: id }),
    onMutate: (value) => {
      setQuestionVotes(prev => prev + value);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["question", id] });
    },
    onError: (error: any, value) => {
      setQuestionVotes(prev => prev - value);
      toast.error(error.message || "Failed to vote");
    },
  });

  const voteAnswerMutation = useMutation({
    mutationFn: ({ answerId, value }: { answerId: string; value: 1 | -1 }) => 
      api.vote({ value, answerId }),
    onMutate: ({ answerId, value }) => {
      setAnswerVotes(prev => ({ ...prev, [answerId]: (prev[answerId] || 0) + value }));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["question", id] });
    },
    onError: (error: any, { answerId, value }) => {
      setAnswerVotes(prev => ({ ...prev, [answerId]: (prev[answerId] || 0) - value }));
      toast.error(error.message || "Failed to vote");
    },
  });

  const acceptAnswerMutation = useMutation({
    mutationFn: (answerId: string) => api.acceptAnswer(answerId),
    onSuccess: () => {
      toast.success("Answer accepted!");
      queryClient.invalidateQueries({ queryKey: ["question", id] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to accept answer");
    },
  });

  // Save/Unsave question mutation
  const saveQuestionMutation = useMutation({
    mutationFn: () => isSaved ? api.unsaveQuestion(id!) : api.saveQuestion(id!),
    onSuccess: () => {
      setIsSaved(!isSaved);
      toast.success(isSaved ? "Removed from saved" : "Saved successfully!");
      queryClient.invalidateQueries({ queryKey: ["saved-questions"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error?.message || "Failed to save question");
    },
  });

  const handleQuestionVote = (value: 1 | -1) => {
    voteQuestionMutation.mutate(value);
    // Emit real-time vote update
    if (id) {
      emitVote({
        questionId: id,
        targetId: id,
        targetType: 'question',
        voteCount: questionVotes + value,
      });
    }
  };

  const handleAnswerVote = (answerId: string, value: 1 | -1) => {
    voteAnswerMutation.mutate({ answerId, value });
    // Emit real-time vote update
    if (id) {
      emitVote({
        questionId: id,
        targetId: answerId,
        targetType: 'answer',
        voteCount: (answerVotes[answerId] || 0) + value,
      });
    }
  };

  if (isLoading) {
    return (
      <AnimatedPage className="min-h-screen">
        <Navbar />
        <main className="pt-20 pb-16">
          <div className="container mx-auto px-6 max-w-[1800px]">
            <div className="flex gap-6">
              <Sidebar />
              <div className="flex-1 min-w-0">
                <div className="text-center text-muted-foreground">Loading question...</div>
              </div>
            </div>
          </div>
        </main>
      </AnimatedPage>
    );
  }

  if (isError || !data) {
    return (
      <AnimatedPage className="min-h-screen">
        <Navbar />
        <main className="pt-20 pb-16">
          <div className="container mx-auto px-6 max-w-[1800px]">
            <div className="flex gap-6">
              <Sidebar />
              <div className="flex-1 min-w-0">
                <div className="flex flex-col items-center justify-center gap-4 py-12">
                  <div className="text-center text-destructive text-xl font-semibold">Question Not Found</div>
                  <p className="text-muted-foreground text-center max-w-md">
                    This question might not exist, has been deleted, or the database was recently reset.
                    Please navigate to the Explore page to view available questions.
                  </p>
                  <div className="flex gap-3">
                    <Button onClick={() => navigate("/explore")} variant="default">
                      Go to Explore
                    </Button>
                    <Button onClick={() => navigate(-1)} variant="outline">
                      Go Back
                    </Button>
                  </div>
                  <div className="mt-4 p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground max-w-md">
                    <p className="font-semibold mb-2">💡 Tip:</p>
                    <p>If you just reseeded the database, try clearing your browser cache (Ctrl+Shift+Delete) and refreshing the page.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </AnimatedPage>
    );
  }

  const question = data;

  return (
    <AnimatedPage className="min-h-screen">
      <Navbar />
      <main className="pt-16 pb-8">
        <div className="container mx-auto px-4 max-w-[1800px]">
          <div className="flex gap-4">
            <Sidebar />
          
            <div className="flex-1 min-w-0 space-y-4">
            {/* Back Button */}
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              
              <div className="flex items-center gap-3">
                <LiveViewers questionId={id!} />
                <ConnectionStatus />
              </div>
            </div>

            {/* Question */}
            <div className="glass rounded-2xl p-6 mb-6">
              <div className="flex gap-4">
                {/* Voting */}
                <div className="flex flex-col items-center gap-2 shrink-0">
                  <button 
                    onClick={() => handleQuestionVote(1)}
                    disabled={voteQuestionMutation.isPending}
                    className="p-2 rounded-lg hover:bg-success/20 transition-colors group"
                  >
                    <ArrowUp className="w-6 h-6 text-muted-foreground group-hover:text-success transition-colors" />
                  </button>
                  <LiveVoteCounter
                    targetId={id!}
                    targetType="question"
                    initialVoteCount={questionVotes}
                    questionId={id!}
                  />
                  <button 
                    onClick={() => handleQuestionVote(-1)}
                    disabled={voteQuestionMutation.isPending}
                    className="p-2 rounded-lg hover:bg-destructive/20 transition-colors group"
                  >
                    <ArrowDown className="w-6 h-6 text-muted-foreground group-hover:text-destructive transition-colors" />
                  </button>
                </div>

                <div className="flex-1">
                  {/* Title & Status */}
                  <div className="flex items-start gap-2 mb-4">
                    <h1 className="text-2xl font-bold text-foreground flex-1">{question.title}</h1>
                    {question.isSolved && (
                      <Badge variant="default" className="bg-success/20 text-success">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Solved
                      </Badge>
                    )}
                  </div>

                  {/* Content */}
                  <div className="prose prose-sm dark:prose-invert max-w-none mb-4">
                    <MarkdownPreview content={question.content} />
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {(question.tags || []).map((tagObj: any) => (
                      <Badge key={tagObj.tag.id} variant="secondary">
                        {tagObj.tag.name}
                      </Badge>
                    ))}
                  </div>

                  {/* Save and Collection Buttons */}
                  <div className="flex items-center gap-2 mb-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => saveQuestionMutation.mutate()}
                      disabled={saveQuestionMutation.isPending || !user}
                      className="gap-2"
                    >
                      {isSaved ? (
                        <>
                          <BookmarkCheck className="w-4 h-4" />
                          Saved
                        </>
                      ) : (
                        <>
                          <Bookmark className="w-4 h-4" />
                          Save
                        </>
                      )}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsCollectionDialogOpen(true)}
                      disabled={!user}
                      className="gap-2"
                    >
                      <FolderPlus className="w-4 h-4" />
                      Add to Collection
                    </Button>
                  </div>

                  {/* Meta */}
                  <div className="flex items-center justify-between border-t border-white/10 pt-4">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={question.author.avatar} />
                        <AvatarFallback>{question.author.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="text-sm">
                        <div className="font-medium">{question.author.name}</div>
                        <div className="text-muted-foreground">
                          {formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {question.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        {question.answers?.length || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Question Comments */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <CommentSection
                  comments={question.comments || []}
                  questionId={id}
                />
              </div>
            </div>

            {/* Answers */}
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-4">
                {question.answers?.length || 0} {question.answers?.length === 1 ? "Answer" : "Answers"}
              </h2>

              {question.answers && question.answers.length > 0 && (
                <div className="space-y-4">
                  {question.answers.map((answer: any) => (
                    <div key={answer.id} className="glass rounded-2xl p-6">
                      <div className="flex gap-4">
                        {/* Voting */}
                        <div className="flex flex-col items-center gap-2 shrink-0">
                          <button 
                            onClick={() => handleAnswerVote(answer.id, 1)}
                            disabled={voteAnswerMutation.isPending}
                            className="p-2 rounded-lg hover:bg-success/20 transition-colors group"
                          >
                            <ArrowUp className="w-5 h-5 text-muted-foreground group-hover:text-success transition-colors" />
                          </button>
                          <span className="text-lg font-semibold">{answerVotes[answer.id] || 0}</span>
                          <button 
                            onClick={() => handleAnswerVote(answer.id, -1)}
                            disabled={voteAnswerMutation.isPending}
                            className="p-2 rounded-lg hover:bg-destructive/20 transition-colors group"
                          >
                            <ArrowDown className="w-5 h-5 text-muted-foreground group-hover:text-destructive transition-colors" />
                          </button>
                          {answer.isAccepted && (
                            <CheckCircle className="w-6 h-6 text-success mt-2" />
                          )}
                        </div>

                        <div className="flex-1">
                          {/* Accepted Badge */}
                          {answer.isAccepted && (
                            <div className="mb-4 flex items-center gap-2 text-success">
                              <CheckCircle className="w-5 h-5" />
                              <span className="font-semibold">Accepted Answer</span>
                            </div>
                          )}
                          
                          {/* Content */}
                          <div className="prose prose-sm dark:prose-invert max-w-none mb-4">
                            <MarkdownPreview content={answer.content} />
                          </div>

                          {/* Meta & Actions */}
                          <div className="flex items-center justify-between border-t border-white/10 pt-4">
                            <div className="flex items-center gap-2">
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={answer.author.avatar} />
                                <AvatarFallback>{answer.author.name[0]}</AvatarFallback>
                              </Avatar>
                              <div className="text-sm">
                                <div className="font-medium">{answer.author.name}</div>
                                <div className="text-muted-foreground">
                                  {formatDistanceToNow(new Date(answer.createdAt), { addSuffix: true })}
                                </div>
                              </div>
                            </div>
                            
                            {/* Accept Answer Button - Only for question author */}
                            {user && user.id === question.authorId && !answer.isAccepted && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => acceptAnswerMutation.mutate(answer.id)}
                                disabled={acceptAnswerMutation.isPending}
                                className="gap-2 border-success/50 text-success hover:bg-success/10"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Accept Answer
                              </Button>
                            )}
                          </div>

                          {/* Answer Comments */}
                          <div className="mt-4 pt-4 border-t border-white/10">
                            <CommentSection
                              comments={answer.comments || []}
                              answerId={answer.id}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* AI Answer Suggestion */}
            <AIAnswerSuggestion
              questionId={id!}
              onUse={(suggestion) => setAnswerContent(suggestion)}
            />

            {/* Post Answer */}
            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">Your Answer</h3>
              
              {/* Typing Indicator */}
              <TypingIndicator questionId={id!} />
              
              <MarkdownEditor
                value={answerContent}
                onChange={(value) => {
                  setAnswerContent(value);
                  
                  // Emit typing indicator
                  if (value && user?.username && id) {
                    startTyping(id, user.username);
                    
                    // Clear previous timeout
                    if (typingTimeoutRef.current) {
                      clearTimeout(typingTimeoutRef.current);
                    }
                    
                    // Stop typing after 2 seconds of inactivity
                    typingTimeoutRef.current = setTimeout(() => {
                      stopTyping(id);
                    }, 2000);
                  } else if (!value && id) {
                    stopTyping(id);
                  }
                }}
                placeholder="Write your answer here... (Markdown supported)"
                minHeight="200px"
                showToolbar={true}
                showPreview={true}
              />
              <Button
                onClick={() => {
                  createAnswerMutation.mutate({ content: answerContent, questionId: id! });
                  if (id) stopTyping(id);
                }}
                disabled={!answerContent.trim() || createAnswerMutation.isPending}
                className="mt-4"
              >
                {createAnswerMutation.isPending ? "Posting..." : "Post Answer"}
              </Button>
            </div>
            </div>
          </div>
        </div>
      </main>

      {/* Add to Collection Dialog */}
      <AddToCollectionDialog
        open={isCollectionDialogOpen}
        onOpenChange={setIsCollectionDialogOpen}
        questionId={id!}
      />
    </AnimatedPage>
  );
};

export default QuestionDetail;
