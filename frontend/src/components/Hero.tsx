<<<<<<< HEAD
import { useState, useEffect } from "react";
import { ArrowRight, LogIn, UserPlus, Zap, Users, MessageCircle, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
=======
import { ArrowRight, Zap, Users, MessageCircle, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
>>>>>>> 20a36825eeb7c80c6c05af70e41f3fb47753d6d4

const stats = [
  { label: "Active Users", value: "50K+", icon: Users },
  { label: "Problems Solved", value: "125K+", icon: MessageCircle },
  { label: "Expert Contributors", value: "2.5K+", icon: Award },
];

<<<<<<< HEAD
const backgroundImages = [
  "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1920&q=80",
  "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1920&q=80",
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1920&q=80",
  "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1920&q=80",
  "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=1920&q=80",
  "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&q=80",
];

export function Hero() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background Image Carousel */}
      <div className="absolute inset-0">
        {backgroundImages.map((image, index) => (
          <div
            key={image}
            className="absolute inset-0 transition-opacity duration-1000"
            style={{
              opacity: index === currentImageIndex ? 1 : 0,
              backgroundImage: `url(${image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        ))}
        <div className="absolute inset-0 bg-background/85 backdrop-blur-sm" />
      </div>

      {/* Animated Background Mesh */}
      <div className="absolute inset-0 mesh-gradient opacity-50" />
=======
export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Animated Background Mesh */}
      <div className="absolute inset-0 mesh-gradient" />
>>>>>>> 20a36825eeb7c80c6c05af70e41f3fb47753d6d4
      
      {/* Floating Orbs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "-3s" }} />
      <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-neon-green/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "-5s" }} />
      
      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
<<<<<<< HEAD
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
          {/* Left Content */}
          <div className="stagger-children text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">AI-Powered Knowledge Sharing</span>
            </div>

            {/* Heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
              Share Knowledge,
              <br />
              <span className="gradient-text">Solve Problems</span>
            </h1>

            {/* Subheading */}
            <p className="text-lg sm:text-xl text-muted-foreground mb-10">
              Join the most innovative community of problem solvers. Ask questions, 
              share expertise, and unlock solutions with AI-enhanced discussions.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center lg:items-start gap-4">
              <Link to="/signup" className="w-full sm:w-auto">
                <Button variant="hero" size="xl" className="group w-full">
                  Join Free
                  <UserPlus className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/login" className="w-full sm:w-auto">
                <Button variant="outline" size="xl" className="w-full">
                  Log In
                  <LogIn className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/explore" className="w-full sm:w-auto">
                <Button variant="ghost" size="xl" className="w-full">
                  Explore Problems
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Side - Device Mockups */}
          <div className="hidden lg:block relative">
            <div className="relative">
              {/* Laptop Mockup */}
              <div className="relative z-10 animate-float">
                <div className="glass rounded-2xl p-3 shadow-2xl border border-white/10">
                  {/* Laptop Screen */}
                  <div className="relative aspect-[16/10] rounded-lg overflow-hidden bg-background">
                    {/* Browser Chrome */}
                    <div className="absolute top-0 left-0 right-0 h-8 bg-muted/50 backdrop-blur-sm border-b border-white/5 flex items-center px-3 gap-2">
                      <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
                      </div>
                      <div className="flex-1 flex items-center justify-center">
                        <div className="text-xs text-muted-foreground bg-background/50 px-3 py-1 rounded">
                          lumina-share.com
                        </div>
                      </div>
                    </div>
                    {/* Website Preview */}
                    <div className="absolute inset-0 pt-8">
                      <iframe 
                        src={window.location.origin + "/explore"} 
                        className="w-full h-full border-0 pointer-events-none"
                        title="Desktop Preview"
                      />
                    </div>
                  </div>
                  {/* Laptop Base */}
                  <div className="h-4 bg-muted/30 rounded-b-lg mt-1"></div>
                </div>
              </div>

              {/* Phone Mockup */}
              <div 
                className="absolute -bottom-12 -right-8 z-20 animate-float"
                style={{ animationDelay: "-2s" }}
              >
                <div className="glass rounded-[2.5rem] p-3 shadow-2xl border border-white/10 w-56">
                  {/* Phone Screen */}
                  <div className="relative aspect-[9/19] rounded-[1.8rem] overflow-hidden bg-background">
                    {/* Notch */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-background rounded-b-2xl z-10"></div>
                    {/* Status Bar */}
                    <div className="absolute top-0 left-0 right-0 h-10 bg-muted/50 backdrop-blur-sm flex items-center justify-between px-6 pt-2">
                      <span className="text-xs">9:41</span>
                      <div className="flex gap-1 items-center">
                        <div className="text-xs">5G</div>
                      </div>
                    </div>
                    {/* Website Preview */}
                    <div className="absolute inset-0 pt-10">
                      <iframe 
                        src={window.location.origin} 
                        className="w-full h-full border-0 pointer-events-none scale-50 origin-top-left"
                        style={{ width: '200%', height: '200%' }}
                        title="Mobile Preview"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
=======
        <div className="max-w-4xl mx-auto text-center stagger-children">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">AI-Powered Knowledge Sharing</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
            Share Knowledge,
            <br />
            <span className="gradient-text">Solve Problems</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Join the most innovative community of problem solvers. Ask questions, 
            share expertise, and unlock solutions with AI-enhanced discussions.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button variant="hero" size="xl" className="group">
              Get Started Free
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button variant="outline" size="xl">
              Explore Problems
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="glass card-hover rounded-2xl p-6 text-center group"
                  style={{ animationDelay: `${0.6 + index * 0.1}s` }}
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-4 group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-3xl font-bold gradient-text mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              );
            })}
>>>>>>> 20a36825eeb7c80c6c05af70e41f3fb47753d6d4
          </div>
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
