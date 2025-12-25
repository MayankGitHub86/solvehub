import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Award, Calendar } from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

type TimeRange = "week" | "month" | "year" | "all";

interface ReputationGraphProps {
  userId?: string;
}

export function ReputationGraph({ userId }: ReputationGraphProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("month");

  // Mock data - will be replaced with actual API call
  const generateMockData = (range: TimeRange) => {
    const now = new Date();
    const data = [];
    
    let days = 7;
    if (range === "month") days = 30;
    else if (range === "year") days = 365;
    else if (range === "all") days = 90;

    for (let i = days; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toLocaleDateString("en-US", { 
          month: "short", 
          day: "numeric",
          ...(range === "year" || range === "all" ? {} : {})
        }),
        reputation: Math.floor(Math.random() * 50) + (days - i) * 10,
        questions: Math.floor(Math.random() * 3),
        answers: Math.floor(Math.random() * 5),
      });
    }
    
    return data;
  };

  const data = generateMockData(timeRange);
  const currentReputation = data[data.length - 1]?.reputation || 0;
  const previousReputation = data[0]?.reputation || 0;
  const growth = currentReputation - previousReputation;
  const growthPercent = previousReputation > 0 
    ? ((growth / previousReputation) * 100).toFixed(1)
    : "0";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Reputation Growth
            </CardTitle>
            <CardDescription>Track your progress over time</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">{currentReputation}</div>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {growth >= 0 ? "+" : ""}{growth} ({growthPercent}%)
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Time Range Selector */}
        <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="year">Year</TabsTrigger>
            <TabsTrigger value="all">All Time</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Main Chart */}
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorReputation" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="date" 
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis 
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Area
                type="monotone"
                dataKey="reputation"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorReputation)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Activity Breakdown */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-500">
              {data.reduce((sum, d) => sum + d.questions, 0)}
            </div>
            <div className="text-xs text-muted-foreground">Questions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">
              {data.reduce((sum, d) => sum + d.answers, 0)}
            </div>
            <div className="text-xs text-muted-foreground">Answers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-500">
              {Math.floor(currentReputation / 10)}
            </div>
            <div className="text-xs text-muted-foreground">Avg/Day</div>
          </div>
        </div>

        {/* Milestones */}
        <div className="space-y-2 pt-4 border-t border-border">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <Award className="w-4 h-4 text-yellow-500" />
            Upcoming Milestones
          </h4>
          <div className="space-y-2">
            {[
              { points: 500, label: "Rising Star", achieved: currentReputation >= 500 },
              { points: 1000, label: "Expert", achieved: currentReputation >= 1000 },
              { points: 2500, label: "Master", achieved: currentReputation >= 2500 },
            ].map((milestone) => (
              <div
                key={milestone.points}
                className="flex items-center justify-between p-2 rounded-lg bg-muted/30"
              >
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    milestone.achieved ? "bg-green-500" : "bg-muted-foreground"
                  }`} />
                  <span className="text-sm">{milestone.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {milestone.points} pts
                  </span>
                  {milestone.achieved && (
                    <span className="text-xs text-green-500">✓</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
