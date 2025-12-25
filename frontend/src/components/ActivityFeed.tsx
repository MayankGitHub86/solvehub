import { useQuery } from "@tanstack/react-query";
import { MessageCircle, Award, ThumbsUp, CheckCircle, User as UserIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import api from "@/lib/api";

interface ActivityFeedProps {
  userId?: string;
  limit?: number;
  showFollowedOnly?: boolean;
}

export function ActivityFeed({ userId, limit = 20, showFollowedOnly = false }: ActivityFeedProps) {
  // For now, we'll fetch recent questions and answers as activity
  // In a real implementation, you'd have a dedicated activity feed endpoint
  const { data: questionsData, isLoading: questionsLoading } = useQuery({
    queryKey: ["recent-questions", limit],
    queryFn: async () => {
      const res: any = await api.getAllQuestions({ sort: "recent", limit });
      return res.data;
    },
  });

  const { data: badgesData } = useQuery({
    queryKey: ["recent-badges"],
    queryFn: async () => {
      // This would be a real endpoint in production
      return { data: [] };
    },
  });

  if (questionsLoading) {
    return (
      <div className="glass rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-4">Activity Feed</h3>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-10 h-10 rounded-full bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const questions = questionsData?.questions || [];

  // Create activity items from questions
  const activities = questions.map((q: any) => ({
    id: q.id,
    type: "question",
    user: q.author,
    content: q.title,
    timestamp: q.createdAt,
    metadata: {
      tags: q.tags,
      votes: q.votes,
      answers: q.answers,
      isSolved: q.isSolved,
    },
  }));

  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
      
      {activities.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <UserIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No recent activity</p>
        </div>
      ) : (
        <ScrollArea className="h-[600px]">
          <div className="space-y-4 pr-4">
            {activities.map((activity: any) => (
              <div key={activity.id} className="flex gap-3 pb-4 border-b border-border last:border-0">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={activity.user.avatar} />
                  <AvatarFallback>{activity.user.name[0]}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        to={`/users/${activity.user.username}`}
                        className="font-semibold hover:text-primary transition-colors"
                      >
                        {activity.user.name}
                      </Link>
                      <span className="text-sm text-muted-foreground">
                        {activity.type === "question" && "asked a question"}
                        {activity.type === "answer" && "answered"}
                        {activity.type === "badge" && "earned a badge"}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </span>
                  </div>

                  {activity.type === "question" && (
                    <>
                      <Link
                        to={`/questions/${activity.id}`}
                        className="text-foreground hover:text-primary transition-colors line-clamp-2 mb-2"
                      >
                        {activity.content}
                      </Link>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="w-3 h-3" />
                          {activity.metadata.votes}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" />
                          {activity.metadata.answers}
                        </span>
                        {activity.metadata.isSolved && (
                          <span className="flex items-center gap-1 text-success">
                            <CheckCircle className="w-3 h-3" />
                            Solved
                          </span>
                        )}
                      </div>

                      {activity.metadata.tags && activity.metadata.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {activity.metadata.tags.slice(0, 3).map((tag: string) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  {activity.type === "badge" && (
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-primary" />
                      <span className="font-medium">{activity.content}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
