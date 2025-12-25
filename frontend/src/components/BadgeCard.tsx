import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface BadgeCardProps {
  name: string;
  description: string;
  icon: string;
  category: string;
  points: number;
  requirement?: string;
  earned?: boolean;
  earnedAt?: string;
  progress?: number;
  current?: number;
  required?: number;
}

export function BadgeCard({
  name,
  description,
  icon,
  category,
  points,
  requirement,
  earned = false,
  earnedAt,
  progress = 0,
  current = 0,
  required = 1,
}: BadgeCardProps) {
  const categoryColors: Record<string, string> = {
    'getting-started': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    'contribution': 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    'engagement': 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    'quality': 'bg-green-500/10 text-green-500 border-green-500/20',
    'community': 'bg-pink-500/10 text-pink-500 border-pink-500/20',
    'special': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  };

  return (
    <div
      className={cn(
        "relative p-4 rounded-xl border transition-all duration-300",
        earned
          ? "bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20 hover:border-primary/40"
          : "bg-muted/30 border-border hover:border-border/60 opacity-75"
      )}
    >
      {/* Badge Icon */}
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "relative flex items-center justify-center w-16 h-16 rounded-xl text-3xl",
            earned ? "bg-gradient-to-br from-primary/20 to-secondary/20" : "bg-muted"
          )}
        >
          {earned ? (
            icon
          ) : (
            <div className="relative">
              <span className="opacity-30">{icon}</span>
              <Lock className="absolute inset-0 m-auto w-6 h-6 text-muted-foreground" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* Badge Name & Points */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className={cn(
              "font-semibold text-sm",
              earned ? "text-foreground" : "text-muted-foreground"
            )}>
              {name}
            </h3>
            <span className="text-xs font-medium text-primary">
              +{points} pts
            </span>
          </div>

          {/* Description */}
          <p className="text-xs text-muted-foreground mb-2">
            {description}
          </p>

          {/* Category Badge */}
          <div className="flex items-center gap-2 mb-2">
            <span
              className={cn(
                "px-2 py-0.5 text-xs font-medium rounded-full border",
                categoryColors[category] || categoryColors['getting-started']
              )}
            >
              {category.replace('-', ' ')}
            </span>
          </div>

          {/* Requirement */}
          {requirement && !earned && (
            <p className="text-xs text-muted-foreground italic">
              {requirement}
            </p>
          )}

          {/* Earned Date */}
          {earned && earnedAt && (
            <p className="text-xs text-muted-foreground">
              Earned {new Date(earnedAt).toLocaleDateString()}
            </p>
          )}

          {/* Progress Bar */}
          {!earned && progress > 0 && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Progress</span>
                <span>{current} / {required}</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
