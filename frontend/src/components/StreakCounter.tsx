import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Calendar, Trophy, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakCounterProps {
  currentStreak?: number;
  longestStreak?: number;
  lastActive?: string;
}

export function StreakCounter({
  currentStreak = 5,
  longestStreak = 12,
  lastActive = "today",
}: StreakCounterProps) {
  const streakDays = Array.from({ length: 7 }, (_, i) => {
    const isActive = i < currentStreak;
    const isFuture = i >= currentStreak;
    return { day: i + 1, isActive, isFuture };
  });

  const getStreakLevel = (streak: number) => {
    if (streak >= 30) return { label: "Legendary", color: "text-purple-500", icon: "🔥" };
    if (streak >= 14) return { label: "On Fire", color: "text-orange-500", icon: "🔥" };
    if (streak >= 7) return { label: "Hot Streak", color: "text-red-500", icon: "🔥" };
    if (streak >= 3) return { label: "Building", color: "text-yellow-500", icon: "⚡" };
    return { label: "Getting Started", color: "text-blue-500", icon: "✨" };
  };

  const level = getStreakLevel(currentStreak);

  return (
    <Card className="border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-red-500/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              Activity Streak
            </CardTitle>
            <CardDescription>Keep your streak alive!</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-orange-500">{currentStreak}</div>
            <div className="text-xs text-muted-foreground">Days</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Streak Level */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{level.icon}</span>
            <div>
              <div className={cn("font-semibold text-sm", level.color)}>
                {level.label}
              </div>
              <div className="text-xs text-muted-foreground">
                Current Status
              </div>
            </div>
          </div>
          <Badge variant="secondary" className="gap-1">
            <Zap className="w-3 h-3" />
            Active
          </Badge>
        </div>

        {/* Weekly Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">This Week</span>
            <span className="font-medium">{currentStreak}/7 days</span>
          </div>
          <div className="flex gap-1">
            {streakDays.map((day) => (
              <div
                key={day.day}
                className={cn(
                  "flex-1 h-8 rounded-md transition-all duration-200",
                  day.isActive && "bg-gradient-to-t from-orange-500 to-red-500 shadow-lg",
                  day.isFuture && "bg-muted/30 border border-dashed border-muted-foreground/20"
                )}
                title={`Day ${day.day}`}
              />
            ))}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border">
          <div className="text-center p-3 rounded-lg bg-muted/30">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span className="text-xl font-bold">{longestStreak}</span>
            </div>
            <div className="text-xs text-muted-foreground">Longest Streak</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/30">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Calendar className="w-4 h-4 text-blue-500" />
              <span className="text-xl font-bold">{Math.floor(currentStreak / 7)}</span>
            </div>
            <div className="text-xs text-muted-foreground">Weeks Active</div>
          </div>
        </div>

        {/* Milestones */}
        <div className="space-y-2 pt-3 border-t border-border">
          <h4 className="text-sm font-semibold">Streak Milestones</h4>
          <div className="space-y-1">
            {[
              { days: 7, reward: "+25 pts", achieved: currentStreak >= 7 },
              { days: 14, reward: "+50 pts", achieved: currentStreak >= 14 },
              { days: 30, reward: "+100 pts", achieved: currentStreak >= 30 },
            ].map((milestone) => (
              <div
                key={milestone.days}
                className={cn(
                  "flex items-center justify-between p-2 rounded-lg text-sm",
                  milestone.achieved ? "bg-green-500/10" : "bg-muted/30"
                )}
              >
                <span className={milestone.achieved ? "text-green-500" : "text-muted-foreground"}>
                  {milestone.days} Day Streak
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{milestone.reward}</span>
                  {milestone.achieved && <span className="text-green-500">✓</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Motivation */}
        <div className="p-3 rounded-lg bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20">
          <p className="text-sm text-center">
            <span className="font-semibold">🔥 Keep it up!</span>
            <br />
            <span className="text-xs text-muted-foreground">
              Come back tomorrow to maintain your streak
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
