import { Users, MessageCircle, Award } from "lucide-react";

const stats = [
  { label: "Active Users", value: "50K+", icon: Users },
  { label: "Problems Solved", value: "125K+", icon: MessageCircle },
  { label: "Expert Contributors", value: "2.5K+", icon: Award },
];

export function StatsSection() {
  return (
    <section className="relative py-20 bg-background/50 backdrop-blur-sm border-y border-white/5">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="glass card-hover rounded-2xl p-8 text-center group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6 group-hover:bg-primary/20 transition-all duration-300 group-hover:scale-110">
                  <Icon className="w-8 h-8 text-primary" />
                </div>
                <div className="text-5xl font-bold gradient-text mb-2">
                  {stat.value}
                </div>
                <div className="text-base text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
