import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/auth";
import api from "@/lib/api";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  Eye, 
  ThumbsUp, 
  Trash2, 
  Edit, 
  Clock,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { FadeIn } from "@/components/AnimatedPage";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function MyQuestions() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Fetch user's questions
  const { data: questions, isLoading } = useQuery({
    queryKey: ["my-questions", user?.id],
    queryFn: async () => {
      const response = await api.getUserQuestions(user?.id || "");
      return response.data.questions;
    },
    enabled: !!user?.id,
  });

  // Delete question mutation
  const deleteMutation = useMutation({
    mutationFn: async (questionId: string) => {
      await api.deleteQuestion(questionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-questions"] });
      toast.success("Question deleted successfully");
      setDeleteId(null);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error?.message || "Failed to delete question");
    },
  });

  const handleDelete = (questionId: string) => {
    setDeleteId(questionId);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
    }
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="pt-16 pb-8">
        <div className="container mx-auto px-4 max-w-[1800px]">
          <div className="flex gap-4">
            <Sidebar />
            
            <div className="flex-1 min-w-0 space-y-4">
              {/* Header */}
              <FadeIn>
                <div className="glass rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        My Questions
                      </h1>
                      <p className="text-muted-foreground mt-1">
                        Manage all your posted questions
                      </p>
                    </div>
                    <Button onClick={() => navigate("/ask")} className="gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Ask New Question
                    </Button>
                  </div>
                  
                  {questions && (
                    <div className="mt-4 flex gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{questions.length}</Badge>
                        <span className="text-muted-foreground">Total Questions</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                          {questions.filter((q: any) => q.answers?.length > 0).length}
                        </Badge>
                        <span className="text-muted-foreground">Answered</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400">
                          {questions.filter((q: any) => q.answers?.length === 0).length}
                        </Badge>
                        <span className="text-muted-foreground">Unanswered</span>
                      </div>
                    </div>
                  )}
                </div>
              </FadeIn>

              {/* Questions List */}
              <div className="space-y-3">
                {isLoading ? (
                  <div className="glass rounded-xl p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-muted-foreground mt-4">Loading your questions...</p>
                  </div>
                ) : questions?.length === 0 ? (
                  <div className="glass rounded-xl p-12 text-center">
                    <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground opacity-50 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No questions yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start by asking your first question!
                    </p>
                    <Button onClick={() => navigate("/ask")}>
                      Ask Your First Question
                    </Button>
                  </div>
                ) : (
                  <AnimatePresence>
                    {questions?.map((question: any, index: number) => (
                      <motion.div
                        key={question.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ delay: index * 0.05 }}
                        className="glass rounded-xl p-6 hover:border-primary/50 transition-all"
                      >
                        <div className="flex gap-4">
                          {/* Stats Column */}
                          <div className="flex flex-col gap-2 text-center min-w-[80px]">
                            <div className="flex flex-col items-center">
                              <span className="text-2xl font-bold text-foreground">
                                {question.votes || 0}
                              </span>
                              <span className="text-xs text-muted-foreground">votes</span>
                            </div>
                            <div className="flex flex-col items-center">
                              <span className={`text-xl font-semibold ${
                                question.answers?.length > 0 ? 'text-green-500' : 'text-muted-foreground'
                              }`}>
                                {question.answers?.length || 0}
                              </span>
                              <span className="text-xs text-muted-foreground">answers</span>
                            </div>
                            <div className="flex flex-col items-center">
                              <span className="text-lg text-muted-foreground">
                                {question.views || 0}
                              </span>
                              <span className="text-xs text-muted-foreground">views</span>
                            </div>
                          </div>

                          {/* Content Column */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <h3 
                                  onClick={() => navigate(`/questions/${question.id}`)}
                                  className="text-lg font-semibold text-foreground hover:text-primary cursor-pointer mb-2 line-clamp-2"
                                >
                                  {question.title}
                                </h3>
                                
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                  {question.preview || question.content?.substring(0, 200)}
                                </p>

                                <div className="flex flex-wrap items-center gap-2">
                                  {question.tags?.map((tagObj: any) => (
                                    <Badge 
                                      key={tagObj.tag.id} 
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      {tagObj.tag.name}
                                    </Badge>
                                  ))}
                                  
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
                                    <Clock className="w-3 h-3" />
                                    {formatDate(question.createdAt)}
                                  </div>
                                  
                                  {question.answers?.some((a: any) => a.isAccepted) && (
                                    <Badge className="bg-green-500/20 text-green-400 gap-1">
                                      <CheckCircle2 className="w-3 h-3" />
                                      Solved
                                    </Badge>
                                  )}
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => navigate(`/questions/${question.id}`)}
                                  className="gap-2"
                                >
                                  <Eye className="w-4 h-4" />
                                  View
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDelete(question.id)}
                                  className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-destructive" />
              Delete Question?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this question? This action cannot be undone.
              All answers and comments will also be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
