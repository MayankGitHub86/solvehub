import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Copy, Check, Loader2, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { MarkdownPreview } from "./MarkdownEditor";

interface AIAnswerSuggestionProps {
  questionId: string;
  onUse?: (suggestion: string) => void;
}

export function AIAnswerSuggestion({ questionId, onUse }: AIAnswerSuggestionProps) {
  const [copied, setCopied] = useState(false);

  // Check if AI is available
  const { data: aiStatus } = useQuery({
    queryKey: ["ai-availability"],
    queryFn: async () => {
      const response = await api.checkAIAvailability();
      return response;
    },
  });

  // Generate answer suggestion
  const suggestMutation = useMutation({
    mutationFn: async () => {
      const response: any = await api.suggestAnswer(questionId);
      return response.suggestion;
    },
    onError: (error: any) => {
      // Handle specific error codes
      if (error.code === 'QUOTA_EXCEEDED') {
        toast.error("AI service temporarily unavailable", {
          description: "OpenAI API quota exceeded. The feature will be available once credits are added."
        });
      } else if (error.code === 'RATE_LIMIT') {
        toast.error("Too many requests", {
          description: "Please wait a moment before trying again."
        });
      } else {
        toast.error(error.message || "Failed to generate suggestion");
      }
    },
  });

  const handleCopy = () => {
    if (suggestMutation.data) {
      navigator.clipboard.writeText(suggestMutation.data);
      setCopied(true);
      toast.success("Suggestion copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleUse = () => {
    if (suggestMutation.data && onUse) {
      onUse(suggestMutation.data);
      toast.success("Suggestion added to your answer!");
    }
  };

  if (!aiStatus?.available) {
    return null; // Don't show if AI is not available
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="w-5 h-5 text-primary" />
          AI Answer Suggestion
        </CardTitle>
        <CardDescription>
          Get an AI-powered answer suggestion to help you get started
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!suggestMutation.data && !suggestMutation.isPending && (
          <Button
            onClick={() => suggestMutation.mutate()}
            disabled={suggestMutation.isPending}
            className="w-full gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Generate AI Suggestion
          </Button>
        )}

        {suggestMutation.isPending && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">
              Generating suggestion...
            </span>
          </div>
        )}

        {suggestMutation.isError && (
          <div className="flex items-center gap-2 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <AlertCircle className="w-5 h-5 text-destructive" />
            <p className="text-sm text-destructive">
              {(suggestMutation.error as any)?.message || "Failed to generate suggestion"}
            </p>
          </div>
        )}

        {suggestMutation.data && (
          <>
            <div className="prose prose-sm dark:prose-invert max-w-none p-4 rounded-lg border border-border bg-background">
              <MarkdownPreview content={suggestMutation.data} />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleCopy}
                className="flex-1 gap-2"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </Button>
              {onUse && (
                <Button
                  onClick={handleUse}
                  className="flex-1 gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Use This Answer
                </Button>
              )}
              <Button
                variant="ghost"
                onClick={() => suggestMutation.mutate()}
                className="gap-2"
              >
                Regenerate
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              💡 This is an AI-generated suggestion. Please review and customize it before posting.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
