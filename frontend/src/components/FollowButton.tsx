import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UserPlus, UserMinus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/context/auth";
import { cn } from "@/lib/utils";

interface FollowButtonProps {
  userId: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  showIcon?: boolean;
  className?: string;
}

export function FollowButton({
  userId,
  variant = "default",
  size = "default",
  showIcon = true,
  className,
}: FollowButtonProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Don't show button for own profile
  if (!user || user.id === userId) {
    return null;
  }

  // Check follow status
  const { data: statusData, isLoading: isLoadingStatus } = useQuery({
    queryKey: ["follow-status", userId],
    queryFn: async () => {
      const res: any = await api.getFollowStatus(userId);
      return res.data;
    },
  });

  const isFollowing = statusData?.isFollowing || false;

  // Follow mutation
  const followMutation = useMutation({
    mutationFn: () => api.followUser(userId),
    onSuccess: () => {
      toast.success("User followed successfully!");
      queryClient.invalidateQueries({ queryKey: ["follow-status", userId] });
      queryClient.invalidateQueries({ queryKey: ["follow-stats", userId] });
      queryClient.invalidateQueries({ queryKey: ["followers", userId] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to follow user");
    },
  });

  // Unfollow mutation
  const unfollowMutation = useMutation({
    mutationFn: () => api.unfollowUser(userId),
    onSuccess: () => {
      toast.success("User unfollowed successfully!");
      queryClient.invalidateQueries({ queryKey: ["follow-status", userId] });
      queryClient.invalidateQueries({ queryKey: ["follow-stats", userId] });
      queryClient.invalidateQueries({ queryKey: ["followers", userId] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to unfollow user");
    },
  });

  const handleClick = () => {
    if (isFollowing) {
      unfollowMutation.mutate();
    } else {
      followMutation.mutate();
    }
  };

  const isLoading = followMutation.isPending || unfollowMutation.isPending || isLoadingStatus;

  return (
    <Button
      variant={isFollowing ? "outline" : variant}
      size={size}
      onClick={handleClick}
      disabled={isLoading}
      className={cn(
        isFollowing && "hover:bg-destructive/20 hover:text-destructive hover:border-destructive",
        className
      )}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          {isFollowing ? "Unfollowing..." : "Following..."}
        </>
      ) : (
        <>
          {showIcon && (
            isFollowing ? (
              <UserMinus className="w-4 h-4 mr-2" />
            ) : (
              <UserPlus className="w-4 h-4 mr-2" />
            )
          )}
          {isFollowing ? "Unfollow" : "Follow"}
        </>
      )}
    </Button>
  );
}
