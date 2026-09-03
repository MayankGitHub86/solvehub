import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { BadgeCard } from "@/components/BadgeCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Award, TrendingUp, Users, Star, Sparkles, Trophy } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/auth";

export default function Badges() {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState<string>("all");

  // Fetch badge progress for current user
  const { data: badgeProgress, isLoading } = useQuery({
    queryKey: ["badge-progress", user?.id],
    queryFn: async () => {
      try {
        const response = await api.getBadgeProgress();
        return response;
      } catch (error: any) {
        // If unauthorized, return empty array
        if (error?.response?.status === 401) {
          return [];
        }
        throw error;
      }
    },
    enabled: !!user,
    retry: false,
  });

  const categories = [
    { id: "all", label: "All Badges", icon: Award },
    { id: "getting-started", label: "Getting Started", icon: Star },
    { id: "contribution", label: "Contribution", icon: TrendingUp },
    { id: "engagement", label: "Engagement", icon: Sparkles },
    { id: "quality", label: "Quality", icon: Trophy },
    { id: "community", label: "Community", icon: Users },
    { id: "special", label: "Special", icon: Award },
  ];

  const filteredBadges = badgeProgress?.filter((badge: any) =>
    activeCategory === "all" ? true : badge.category === activeCategory
  );

  const earnedCount = badgeProgress?.filter((b: any) => b.earned).length || 0;
  const totalCount = badgeProgress?.length || 0;
  const totalPoints = badgeProgress
    ?.filter((b: any) => b.earned)
    .reduce((sum: number, b: any) => sum + b.points, 0) || 0;

  // Show message if not logged in
  const showLoginMessage = !user || !badgeProgress || badgeProgress.length === 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">
            Achievements & Badges
          </h1>
          <p className="text-muted-foreground">
            Earn badges by contributing to the community and completing challenges
          </p>
          {!user && (
            <div className="mt-4 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                Please log in to track your badge progress and earn achievements
              </p>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="glass-card p-6 rounded-xl border border-border">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10">
                <Award className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{earnedCount}</p>
                <p className="text-sm text-muted-foreground">Badges Earned</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-xl border border-border">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-secondary/10">
                <Trophy className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalPoints}</p>
                <p className="text-sm text-muted-foreground">Badge Points</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-xl border border-border">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-green-500/10">
                <TrendingUp className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {Math.round((earnedCount / totalCount) * 100)}%
                </p>
                <p className="text-sm text-muted-foreground">Completion</p>
              </div>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="mb-6">
          <TabsList className="w-full justify-start overflow-x-auto flex-wrap h-auto gap-2 bg-transparent p-0">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {category.label}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>

        {/* Badges Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-48 rounded-xl bg-muted/30 animate-pulse"
              />
            ))}
          </div>
        ) : showLoginMessage ? (
          <div className="text-center py-12">
            <Award className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-lg font-semibold mb-2">Login to View Your Badges</p>
            <p className="text-muted-foreground mb-4">
              Track your progress and earn achievements by logging in
            </p>
            <Button onClick={() => window.location.href = '/login'}>
              Log In
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBadges?.map((badge: any) => (
              <BadgeCard
                key={badge.id}
                name={badge.name}
                description={badge.description}
                icon={badge.icon}
                category={badge.category}
                points={badge.points}
                requirement={badge.requirement}
                earned={badge.earned}
                earnedAt={badge.earnedAt}
                progress={badge.progress}
                current={badge.current}
                required={badge.required}
              />
            ))}
          </div>
        )}

        {filteredBadges?.length === 0 && !showLoginMessage && (
          <div className="text-center py-12">
            <Award className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No badges in this category yet</p>
          </div>
        )}
      </main>
    </div>
  );
}
