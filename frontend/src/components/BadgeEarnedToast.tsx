import { Award, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface BadgeEarnedToastProps {
  badgeName: string;
  badgeIcon: string;
  badgePoints: number;
}

export function BadgeEarnedToast({ badgeName, badgeIcon, badgePoints }: BadgeEarnedToastProps) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30">
      <div className="relative">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-2xl">
          {badgeIcon}
        </div>
        <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-yellow-500 animate-pulse" />
      </div>
      
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <Award className="w-4 h-4 text-primary" />
          <p className="font-semibold text-sm">Badge Earned!</p>
        </div>
        <p className="text-sm text-foreground font-medium">{badgeName}</p>
        <p className="text-xs text-muted-foreground">+{badgePoints} points</p>
      </div>
    </div>
  );
}
