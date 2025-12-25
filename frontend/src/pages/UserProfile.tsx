import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { 
  User, MapPin, Link as LinkIcon, Calendar, Award, 
  MessageCircle, Github, Twitter, Linkedin, Edit, ArrowLeft 
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProblemCard } from "@/components/ProblemCard";
import { BadgeCard } from "@/components/BadgeCard";
import { ReputationGraph } from "@/components/ReputationGraph";
import { StreakCounter } from "@/components/StreakCounter";
import { FollowButton } from "@/components/FollowButton";
import { FollowStats } from "@/components/FollowStats";
import { AnimatedPage, FadeIn } from "@/components/AnimatedPage";
import { useAuth } from "@/context/auth";
import api from "@/lib/api";
import { formatDistanceToNow } from "date-fns";

const UserProfile = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch user profile
  const { data: profileData, isLoading } = useQuery({
    queryKey: ["user-profile", username],
    queryFn: async () => {
      const res: any = await api.getUserByUsername(username!);
      return res.data;
    },
    enabled: !!username,
  });

  // Fetch user's questions
  const { data: questionsData } = useQuery({
    queryKey: ["user-questions", profileData?.id],
    queryFn: async () => {
      const res: any = await api.getUserQuestions(profileData.id);
      return res.data;
    },
    enabled: !!profileData?.id && activeTab === "questions",
  });

  // Fetch user's answers
  const { data: answersData } = useQuery({
    queryKey: ["user-answers", profileData?.id],
    queryFn: async () => {
      const res: any = await api.getUserAnswers(profileData.id);
      return res.data;
    },
    enabled: !!profileData?.id && activeTab === "answers",
  });

  // Fetch user's badges
  const { data: badgesData } = useQuery({
    queryKey: ["user-badges", profileData?.id],
    queryFn: async () => {
      const res: any = await api.getUserBadges(profileData.id);
      return res.data;
    },
    enabled: !!profileData?.id && activeTab === "badges",
  });

  if (isLoading) {
    return (
      <AnimatedPage className="min-h-screen">
        <Navbar />
        <main className="pt-20 pb-16">
          <div className="container mx-auto px-6 max-w-[1800px]">
            <div className="flex gap-6">
              <Sidebar />
              <div className="flex-1 min-w-0">
                <div className="text-center text-muted-foreground">Loading profile...</div>
              </div>
            </div>
          </div>
        </main>
      </AnimatedPage>
    );
  }

  if (!profileData) {
    return (
      <AnimatedPage className="min-h-screen">
        <Navbar />
        <main className="pt-20 pb-16">
          <div className="container mx-auto px-6 max-w-[1800px]">
            <div className="flex gap-6">
              <Sidebar />
              <div className="flex-1 min-w-0">
                <div className="glass rounded-2xl p-12 text-center">
                  <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-2">User Not Found</h2>
                  <p className="text-muted-foreground mb-6">
                    The user you're looking for doesn't exist.
                  </p>
                  <Button onClick={() => navigate("/community")}>
                    Browse Community
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </AnimatedPage>
    );
  }

  const user = profileData;
  const isOwnProfile = currentUser?.id === user.id;

  return (
    <AnimatedPage className="min-h-screen">
      <Navbar />
      <main className="pt-16 pb-8">
        <div className="container mx-auto px-4 max-w-[1800px]">
          <div className="flex gap-4">
            <Sidebar />
            
            <div className="flex-1 min-w-0 space-y-6">
              {/* Back Button */}
              <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                className="mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>

              {/* Profile Header */}
              <FadeIn>
                <div className="glass rounded-2xl p-8">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Avatar */}
                    <Avatar className="w-32 h-32">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="text-4xl">{user.name[0]}</AvatarFallback>
                    </Avatar>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h1 className="text-3xl font-bold mb-1">{user.name}</h1>
                          <p className="text-muted-foreground">@{user.username}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {isOwnProfile ? (
                            <Button
                              variant="outline"
                              onClick={() => navigate("/settings")}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Profile
                            </Button>
                          ) : (
                            <>
                              <FollowButton userId={user.id} />
                              <Button 
                                variant="outline" 
                                size="icon"
                                onClick={async () => {
                                  try {
                                    const res: any = await api.getOrCreateConversation(user.id);
                                    navigate(`/messages?conversation=${res.data.id}`);
                                  } catch (error) {
                                    toast.error("Failed to start conversation");
                                  }
                                }}
                              >
                                <MessageCircle className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Bio */}
                      {user.bio && (
                        <p className="text-foreground mb-4">{user.bio}</p>
                      )}

                      {/* Meta Info */}
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                        {user.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {user.location}
                          </span>
                        )}
                        {user.website && (
                          <a
                            href={user.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 hover:text-primary"
                          >
                            <LinkIcon className="w-4 h-4" />
                            Website
                          </a>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Joined {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                        </span>
                      </div>

                      {/* Social Links */}
                      <div className="flex gap-2">
                        {user.github && (
                          <Button variant="ghost" size="icon" asChild>
                            <a href={`https://github.com/${user.github}`} target="_blank" rel="noopener noreferrer">
                              <Github className="w-4 h-4" />
                            </a>
                          </Button>
                        )}
                        {user.twitter && (
                          <Button variant="ghost" size="icon" asChild>
                            <a href={`https://twitter.com/${user.twitter}`} target="_blank" rel="noopener noreferrer">
                              <Twitter className="w-4 h-4" />
                            </a>
                          </Button>
                        )}
                        {user.linkedin && (
                          <Button variant="ghost" size="icon" asChild>
                            <a href={`https://linkedin.com/in/${user.linkedin}`} target="_blank" rel="noopener noreferrer">
                              <Linkedin className="w-4 h-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{user.points || 0}</div>
                      <div className="text-sm text-muted-foreground">Reputation</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{questionsData?.length || 0}</div>
                      <div className="text-sm text-muted-foreground">Questions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{answersData?.length || 0}</div>
                      <div className="text-sm text-muted-foreground">Answers</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{badgesData?.length || 0}</div>
                      <div className="text-sm text-muted-foreground">Badges</div>
                    </div>
                  </div>

                  {/* Follow Stats */}
                  <div className="mt-4 pt-4 border-t border-border">
                    <FollowStats userId={user.id} />
                  </div>
                </div>
              </FadeIn>

              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="questions">Questions</TabsTrigger>
                  <TabsTrigger value="answers">Answers</TabsTrigger>
                  <TabsTrigger value="badges">Badges</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Reputation Graph */}
                    <ReputationGraph userId={user.id} />
                    
                    {/* Streak Counter */}
                    <StreakCounter userId={user.id} />
                  </div>

                  {/* Recent Activity */}
                  <div className="glass rounded-2xl p-6">
                    <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                    <p className="text-muted-foreground">Activity feed coming soon...</p>
                  </div>
                </TabsContent>

                {/* Questions Tab */}
                <TabsContent value="questions" className="space-y-4">
                  {questionsData && questionsData.length > 0 ? (
                    questionsData.map((q: any) => (
                      <ProblemCard key={q.id} {...q} />
                    ))
                  ) : (
                    <div className="glass rounded-2xl p-12 text-center">
                      <p className="text-muted-foreground">No questions yet</p>
                    </div>
                  )}
                </TabsContent>

                {/* Answers Tab */}
                <TabsContent value="answers" className="space-y-4">
                  {answersData && answersData.length > 0 ? (
                    answersData.map((a: any) => (
                      <div key={a.id} className="glass rounded-2xl p-6">
                        <p className="text-sm text-muted-foreground mb-2">
                          Answered: {a.question?.title}
                        </p>
                        <div className="prose prose-sm dark:prose-invert">
                          {a.content.substring(0, 200)}...
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="glass rounded-2xl p-12 text-center">
                      <p className="text-muted-foreground">No answers yet</p>
                    </div>
                  )}
                </TabsContent>

                {/* Badges Tab */}
                <TabsContent value="badges">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {badgesData && badgesData.length > 0 ? (
                      badgesData.map((userBadge: any) => (
                        <BadgeCard
                          key={userBadge.id}
                          badge={userBadge.badge}
                          earned={true}
                          earnedAt={userBadge.earnedAt}
                        />
                      ))
                    ) : (
                      <div className="col-span-full glass rounded-2xl p-12 text-center">
                        <Award className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No badges earned yet</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Activity Tab */}
                <TabsContent value="activity">
                  <div className="glass rounded-2xl p-12 text-center">
                    <p className="text-muted-foreground">Activity timeline coming soon...</p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
    </AnimatedPage>
  );
};

export default UserProfile;
