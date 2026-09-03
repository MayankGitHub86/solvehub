import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, Clock, CheckCircle2, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Challenge {
  id: string;
  name: string;
  description: string;
  type: string;
  requirement: string;
  points: number;
  icon: string;
  progress?: number;
  completed?: boolean;
}

export function DailyChallenges() {
  // Mock data for now - will be replaced with actual API call
  const challenges: Challenge[] = [
    {
      id: "1",
      name: "Answer Seeker",
      description: "Answer 3 questions today",
      type: "daily",
      requirement: "answer_3",
      points: 20,
      icon: "💡",
      progress: 1,
      completed: false,
    },
    {
      id: "2",
      name: "Helpful Hand",
      description: "Get 5 upvotes today",
      type: "daily",
      requirement: "upvotes_5",
      points: 15,
      icon: "👍",
      progress: 3,
      completed: false,
    },
    {
      id: "3",
      name: "Question Master",
      description: "Ask 2 quality questions today",
      type: "daily",
      requirement: "ask_2",
      points: 10,
      icon: "❓",
      progress: 2,
      completed: true,
    },
    {
      id: "4",
      name: "Community Helper",
      description: "Comment on 5 posts today",
      type: "daily",
      requirement: "comment_5",
      points: 10,
      icon: "💬",
      progress: 0,
      completed: false,
    },
  ];

  const completedCount = challenges.filter(c => c.completed).length;
  const totalPoints = challenges.reduce((sum, c) => sum + (c.completed ? c.points : 0), 0);

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              Daily Challenges
            </CardTitle>
            <CardDescription>
              Complete challenges to earn bonus points
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">{totalPoints}</div>
            <div className="text-xs text-muted-foreground">Points Earned</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Progress Overview */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {completedCount}/{challenges.length} Completed
            </span>
          </div>
          <Badge variant={completedCount === challenges.length ? "default" : "secondary"}>
            {completedCount === challenges.length ? "All Done! 🎉" : "In Progress"}
          </Badge>
        </div>

        {/* Challenges List */}
        <div className="space-y-2">
          {challenges.map((challenge) => {
            const progressPercent = challenge.completed
              ? 100
              : ((challenge.progress || 0) / parseInt(challenge.requirement.split('_')[1] || '1')) * 100;

            return (
              <div
                key={challenge.id}
                className={cn(
                  "p-3 rounded-lg border transition-all duration-200",
                  challenge.completed
                    ? "bg-success/10 border-success/20"
                    : "bg-background/50 border-border hover:border-primary/30"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{challenge.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-medium flex items-center gap-2">
                        {challenge.name}
                        {challenge.completed && (
                          <CheckCircle2 className="w-4 h-4 text-success" />
                        )}
                      </h4>
                      <span className="text-xs font-semibold text-primary">
                        +{challenge.points} pts
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {challenge.description}
                    </p>
                    {!challenge.completed && (
                      <>
                        <Progress value={progressPercent} className="h-1.5 mb-1" />
                        <p className="text-xs text-muted-foreground">
                          {challenge.progress || 0} / {challenge.requirement.split('_')[1] || '?'}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Reset Timer */}
        <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-muted/30 border border-border">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            Resets in <span className="font-semibold text-foreground">12h 34m</span>
          </span>
        </div>

        {/* Weekly Challenge Teaser */}
        <div className="p-3 rounded-lg bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-500/20">
              <Lock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold">Weekly Warrior</h4>
              <p className="text-xs text-muted-foreground">
                Complete 5 daily challenges this week
              </p>
            </div>
            <span className="text-xs font-bold text-yellow-600 dark:text-yellow-400">
              +50 pts
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
