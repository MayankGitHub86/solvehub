import { Code, Zap, Users, Shield, TrendingUp, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, useAnimation } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Code,
    title: "Code Syntax Highlighting",
    description: "Beautiful code blocks with syntax highlighting for all major programming languages",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Zap,
    title: "Lightning Fast Search",
    description: "Find answers instantly with our advanced search and filtering system",
    color: "from-yellow-500 to-orange-500",
  },
  {
    icon: Users,
    title: "Active Community",
    description: "Connect with thousands of developers ready to help and share knowledge",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Shield,
    title: "Quality Moderation",
    description: "Curated content with voting system ensures high-quality answers",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: TrendingUp,
    title: "Reputation System",
    description: "Earn points and badges by contributing valuable content to the community",
    color: "from-orange-500 to-red-500",
  },
  {
    icon: Sparkles,
    title: "Smart Recommendations",
    description: "Get personalized question recommendations based on your interests",
    color: "from-pink-500 to-purple-500",
  },
];

export function FeaturesSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      const newScrollLeft = direction === 'left' 
        ? scrollRef.current.scrollLeft - scrollAmount
        : scrollRef.current.scrollLeft + scrollAmount;
      
      scrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
      setIsAutoScrolling(false);
    }
  };

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    checkScroll();
    scrollContainer.addEventListener('scroll', checkScroll);

    // Auto-scroll functionality
    let autoScrollInterval: NodeJS.Timeout;
    
    if (isAutoScrolling) {
      autoScrollInterval = setInterval(() => {
        if (scrollContainer) {
          const { scrollLeft, scrollWidth, clientWidth } = scrollContainer;
          
          // If reached the end, scroll back to start
          if (scrollLeft >= scrollWidth - clientWidth - 10) {
            scrollContainer.scrollTo({ left: 0, behavior: 'smooth' });
          } else {
            scrollContainer.scrollBy({ left: 2, behavior: 'auto' });
          }
        }
      }, 30);
    }

    return () => {
      scrollContainer.removeEventListener('scroll', checkScroll);
      if (autoScrollInterval) clearInterval(autoScrollInterval);
    };
  }, [isAutoScrolling]);

  return (
    <section className="relative py-16 px-4 overflow-hidden">
      {/* Blue Tech Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-35"
        style={{
          backgroundImage: `url('/assets/blue-tech-bg.jpg')`,
          backgroundBlendMode: 'overlay'
        }}
      />
      
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/70 to-background/90" />
      
      {/* Animated particles effect */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
          className="absolute top-1/4 left-1/6 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
            x: [0, 20, 0],
            y: [0, -10, 0]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute top-3/4 right-1/6 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.2, 0.3],
            x: [0, -15, 0],
            y: [0, 15, 0]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 w-16 h-16 bg-purple-500/10 rounded-full blur-xl"
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [0.1, 0.3, 0.1],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />
      </div>
      
      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="text-center mb-12">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Powerful Features
          </motion.h2>
          <motion.p 
            className="text-muted-foreground text-lg max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Everything you need to solve problems and share knowledge
          </motion.p>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Scroll Buttons */}
          {canScrollLeft && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm hover:bg-background/90 shadow-lg"
              onClick={() => scroll('left')}
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
          )}
          
          {canScrollRight && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm hover:bg-background/90 shadow-lg"
              onClick={() => scroll('right')}
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          )}

          {/* Scrollable Container */}
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide pb-4"
            onMouseEnter={() => setIsAutoScrolling(false)}
            onMouseLeave={() => setIsAutoScrolling(true)}
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  className="glass rounded-xl p-6 hover:shadow-lg transition-shadow min-w-[300px] flex-shrink-0"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
