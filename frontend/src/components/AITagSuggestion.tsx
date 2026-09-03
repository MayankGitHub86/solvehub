import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, Plus } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface AITagSuggestionProps {
  title: string;
  content: string;
  currentTags: string[];
  onAddTag: (tag: string) => void;
}

export function AITagSuggestion({
  title,
  content,
  currentTags,
  onAddTag,
}: AITagSuggestionProps) {
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);

  // Check if AI is available
  const { data: aiStatus } = useQuery({
    queryKey: ["ai-availability"],
    queryFn: async () => {
      const response = await api.checkAIAvailability();
      return response;
    },
  });

  // Suggest tags
  const suggestMutation = useMutation({
    mutationFn: async () => {
      const response: any = await api.suggestTags(title, content);
      return response.tags;
    },
    onSuccess: (tags: string[]) => {
      // Filter out tags that are already added
      const newTags = tags.filter(tag => !currentTags.includes(tag));
      setSuggestedTags(newTags);
      if (newTags.length === 0) {
        toast.info("All suggested tags are already added!");
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to suggest tags");
    },
  });

  const handleSuggest = () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Please enter a title and description first");
      return;
    }
    suggestMutation.mutate();
  };

  const handleAddTag = (tag: string) => {
    onAddTag(tag);
    setSuggestedTags(prev => prev.filter(t => t !== tag));
    toast.success(`Added tag: ${tag}`);
  };

  if (!aiStatus?.available) {
    return null; // Don't show if AI is not available
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Let AI suggest relevant tags
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleSuggest}
          disabled={suggestMutation.isPending || !title.trim() || !content.trim()}
          className="gap-2"
        >
          {suggestMutation.isPending ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin" />
              Suggesting...
            </>
          ) : (
            <>
              <Sparkles className="w-3 h-3" />
              Suggest Tags
            </>
          )}
        </Button>
      </div>

      {suggestedTags.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
          <span className="text-xs text-muted-foreground">Suggested:</span>
          {suggestedTags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="cursor-pointer hover:bg-primary/20 transition-colors"
              onClick={() => handleAddTag(tag)}
            >
              <Plus className="w-3 h-3 mr-1" />
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
