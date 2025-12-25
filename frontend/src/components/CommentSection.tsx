import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageCircle, Edit2, Trash2, X, Check } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MentionInput } from "@/components/MentionInput";
import { useAuth } from "@/context/auth";
import api from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
  };
}

interface CommentSectionProps {
  comments: Comment[];
  questionId?: string;
  answerId?: string;
  onCommentAdded?: () => void;
}

export const CommentSection = ({ 
  comments, 
  questionId, 
  answerId,
  onCommentAdded 
}: CommentSectionProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showInput, setShowInput] = useState(false);
  const [commentContent, setCommentContent] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  // Create comment mutation
  const createCommentMutation = useMutation({
    mutationFn: async (data: { content: string; questionId?: string; answerId?: string }) => {
      return api.createComment(data);
    },
    onSuccess: () => {
      toast.success("Comment posted!");
      setCommentContent("");
      setShowInput(false);
      queryClient.invalidateQueries({ queryKey: ["question"] });
      onCommentAdded?.();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to post comment");
    },
  });

  // Update comment mutation
  const updateCommentMutation = useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      return api.updateComment(id, content);
    },
    onSuccess: () => {
      toast.success("Comment updated!");
      setEditingId(null);
      setEditContent("");
      queryClient.invalidateQueries({ queryKey: ["question"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update comment");
    },
  });

  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.deleteComment(id);
    },
    onSuccess: () => {
      toast.success("Comment deleted!");
      queryClient.invalidateQueries({ queryKey: ["question"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete comment");
    },
  });

  const handlePostComment = () => {
    if (!commentContent.trim()) return;
    
    createCommentMutation.mutate({
      content: commentContent,
      ...(questionId ? { questionId } : { answerId }),
    });
  };

  const handleUpdateComment = (id: string) => {
    if (!editContent.trim()) return;
    updateCommentMutation.mutate({ id, content: editContent });
  };

  const handleDeleteComment = (id: string) => {
    if (confirm("Are you sure you want to delete this comment?")) {
      deleteCommentMutation.mutate(id);
    }
  };

  const startEditing = (comment: Comment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditContent("");
  };

  return (
    <div className="space-y-3">
      {/* Comments List */}
      {comments && comments.length > 0 && (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className={cn(
                "flex gap-3 p-3 rounded-lg transition-colors",
                editingId === comment.id ? "bg-muted/50" : "hover:bg-muted/30"
              )}
            >
              <Avatar className="w-8 h-8 shrink-0">
                <AvatarImage src={comment.user.avatar} />
                <AvatarFallback>{comment.user.name[0]}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                {editingId === comment.id ? (
                  // Edit Mode
                  <div className="space-y-2">
                    <MentionInput
                      value={editContent}
                      onChange={setEditContent}
                      rows={2}
                      className="text-sm"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleUpdateComment(comment.id)}
                        disabled={!editContent.trim() || updateCommentMutation.isPending}
                      >
                        <Check className="w-3 h-3 mr-1" />
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={cancelEditing}
                      >
                        <X className="w-3 h-3 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{comment.user.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      </span>
                      {comment.updatedAt !== comment.createdAt && (
                        <span className="text-xs text-muted-foreground">(edited)</span>
                      )}
                    </div>
                    <p className="text-sm text-foreground break-words">{comment.content}</p>
                    
                    {/* Actions - Only for comment author */}
                    {user && user.id === comment.user.id && (
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => startEditing(comment)}
                          className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                        >
                          <Edit2 className="w-3 h-3" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Comment Button/Input */}
      {user ? (
        showInput ? (
          <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
            <MentionInput
              placeholder="Add a comment... (Type @ to mention users)"
              value={commentContent}
              onChange={setCommentContent}
              rows={2}
              className="text-sm"
              autoFocus
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handlePostComment}
                disabled={!commentContent.trim() || createCommentMutation.isPending}
              >
                {createCommentMutation.isPending ? "Posting..." : "Post Comment"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setShowInput(false);
                  setCommentContent("");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowInput(true)}
            className="text-muted-foreground hover:text-foreground"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Add comment
          </Button>
        )
      ) : (
        <p className="text-xs text-muted-foreground">
          Please log in to comment
        </p>
      )}
    </div>
  );
};
