import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { MarkdownEditor } from "./MarkdownEditor";
import { AITagSuggestion } from "./AITagSuggestion";
import { QuestionTemplates } from "./QuestionTemplates";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

interface AskQuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AskQuestionDialog({ open, onOpenChange }: AskQuestionDialogProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const queryClient = useQueryClient();

  const createQuestionMutation = useMutation({
    mutationFn: async (data: { title: string; content: string; tags: string[] }) => {
      return api.createQuestion(data);
    },
    onSuccess: (res: any) => {
      const q = res?.data;

      // Optimistically inject the new question into any cached question lists so the
      // Explore dashboard updates immediately, then let the refetch keep things in sync.
      if (q) {
        const mapped = {
          id: q.id,
          title: q.title,
          preview: q.preview || q.content?.slice(0, 200) || "",
          author: q.author,
          tags: (q.tags || []).map((t: any) => t.tag?.name || t.name).filter(Boolean),
          votes: 0,
          answers: 0,
          views: 0,
          isSolved: false,
          createdAt: q.createdAt || new Date().toISOString(),
        };

        // Update all relevant question caches (all categories that match the tags)
        queryClient.setQueriesData({ queryKey: ["questions"] }, (old: any) => {
          if (!old) return old;
          const prevQuestions = old.questions || [];
          const pagination = old.pagination
            ? { ...old.pagination, total: (old.pagination.total || 0) + 1 }
            : undefined;

          return {
            ...old,
            questions: [mapped, ...prevQuestions],
            pagination,
          };
        });

        // Also invalidate tags to update category counts
        queryClient.invalidateQueries({ queryKey: ["tags"] });
      }

      toast.success("Question posted successfully!");
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      handleClose();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to post question");
    },
  });

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < 5) {
      setTags([...tags, trimmedTag]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (tags.length === 0) {
      toast.error("Please add at least one tag");
      return;
    }

    createQuestionMutation.mutate({ title, content, tags });
  };

  const handleClose = () => {
    setTitle("");
    setContent("");
    setTags([]);
    setTagInput("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Ask a Question</DialogTitle>
          <DialogDescription>
            Share your question with the community. Be specific and provide details.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-2">
          {/* Template Selection */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
            <div>
              <p className="text-sm font-medium">Need help structuring your question?</p>
              <p className="text-xs text-muted-foreground">Use a template to get started</p>
            </div>
            <QuestionTemplates
              onSelectTemplate={(template) => {
                setTitle(template.title);
                setContent(template.content);
                setTags(template.tags);
              }}
            />
          </div>

          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Title <span className="text-destructive">*</span>
            </label>
            <Input
              placeholder="e.g., How to implement authentication in React?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              required
            />
            <p className="text-xs text-muted-foreground">
              {title.length}/200 characters
            </p>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Details <span className="text-destructive">*</span>
            </label>
            <MarkdownEditor
              value={content}
              onChange={setContent}
              placeholder="Describe your question in detail. Include any code, error messages, or context that might help others understand your problem."
              minHeight="200px"
              showToolbar={true}
              showPreview={true}
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Tags <span className="text-destructive">*</span>
            </label>
            
            {/* AI Tag Suggestion */}
            <AITagSuggestion
              title={title}
              content={content}
              currentTags={tags}
              onAddTag={(tag) => {
                if (tags.length < 5 && !tags.includes(tag)) {
                  setTags([...tags, tag]);
                }
              }}
            />
            
            <div className="flex gap-2">
              <Input
                placeholder="Add tags (max 5)"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={tags.length >= 5}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddTag}
                disabled={!tagInput.trim() || tags.length >= 5}
              >
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Add up to 5 tags to help others find your question
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 sticky bottom-0 bg-background pb-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createQuestionMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createQuestionMutation.isPending}
            >
              {createQuestionMutation.isPending ? "Posting..." : "Post Question"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
