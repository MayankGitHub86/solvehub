import { useQuery } from "@tanstack/react-query";
import { Users } from "lucide-react";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

interface FollowStatsProps {
  userId: string;
  className?: string;
  onFollowersClick?: () => void;
  onFollowingClick?: () => void;
}

export function FollowStats({
  userId,
  className,
  onFollowersClick,
  onFollowingClick,
}: FollowStatsProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["follow-stats", userId],
    queryFn: async () => {
      const res: any = await api.getFollowStats(userId);
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <div className={cn("flex items-center gap-4 text-sm text-muted-foreground", className)}>
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  const followers = data?.followers || 0;
  const following = data?.following || 0;

  return (
    <div className={cn("flex items-center gap-4 text-sm", className)}>
      <button
        onClick={onFollowersClick}
        className="flex items-center gap-1 hover:text-primary transition-colors"
      >
        <span className="font-semibold">{followers}</span>
        <span className="text-muted-foreground">
          {followers === 1 ? "Follower" : "Followers"}
        </span>
      </button>
      
      <div className="w-px h-4 bg-border" />
      
      <button
        onClick={onFollowingClick}
        className="flex items-center gap-1 hover:text-primary transition-colors"
      >
        <span className="font-semibold">{following}</span>
        <span className="text-muted-foreground">Following</span>
      </button>
    </div>
  );
}
