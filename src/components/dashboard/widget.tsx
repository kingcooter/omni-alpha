"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Calendar, Mail, Newspaper, TrendingUp, Zap, Brain, Clock, Target, ArrowUpRight } from "lucide-react";

const iconMap = {
  calendar: Calendar,
  mail: Mail,
  newspaper: Newspaper,
  trending: TrendingUp,
  zap: Zap,
  brain: Brain,
  clock: Clock,
  target: Target,
} as const;

type IconName = keyof typeof iconMap;

interface WidgetProps {
  title: string;
  value: string;
  subtitle: string;
  icon: IconName;
  accentColor?: "gold" | "purple" | "green" | "blue";
  className?: string;
}

const accentStyles = {
  gold: {
    gradient: "from-amber-500/15 via-orange-500/10 to-transparent",
    hoverGradient: "from-amber-500/25 via-orange-500/15 to-transparent",
    iconBg: "bg-gradient-to-br from-amber-500/25 to-orange-500/10",
    iconColor: "text-amber-400",
    glowColor: "rgba(251, 191, 36, 0.15)",
    ring: "ring-amber-500/20",
    accentBar: "from-amber-500 to-orange-500",
  },
  purple: {
    gradient: "from-violet-500/15 via-purple-500/10 to-transparent",
    hoverGradient: "from-violet-500/25 via-purple-500/15 to-transparent",
    iconBg: "bg-gradient-to-br from-violet-500/25 to-purple-500/10",
    iconColor: "text-violet-400",
    glowColor: "rgba(139, 92, 246, 0.15)",
    ring: "ring-violet-500/20",
    accentBar: "from-violet-500 to-purple-500",
  },
  green: {
    gradient: "from-emerald-500/15 via-green-500/10 to-transparent",
    hoverGradient: "from-emerald-500/25 via-green-500/15 to-transparent",
    iconBg: "bg-gradient-to-br from-emerald-500/25 to-green-500/10",
    iconColor: "text-emerald-400",
    glowColor: "rgba(16, 185, 129, 0.15)",
    ring: "ring-emerald-500/20",
    accentBar: "from-emerald-500 to-green-500",
  },
  blue: {
    gradient: "from-blue-500/15 via-cyan-500/10 to-transparent",
    hoverGradient: "from-blue-500/25 via-cyan-500/15 to-transparent",
    iconBg: "bg-gradient-to-br from-blue-500/25 to-cyan-500/10",
    iconColor: "text-blue-400",
    glowColor: "rgba(59, 130, 246, 0.15)",
    ring: "ring-blue-500/20",
    accentBar: "from-blue-500 to-cyan-500",
  },
};

export function Widget({
  title,
  value,
  subtitle,
  icon,
  accentColor = "gold",
  className,
}: WidgetProps) {
  const styles = accentStyles[accentColor];
  const Icon = iconMap[icon];

  return (
    <Card
      className={cn(
        "group relative overflow-hidden border-0 bg-card/80 backdrop-blur-sm cursor-pointer transition-all duration-300",
        "hover:bg-card hover:-translate-y-1",
        className
      )}
      style={{
        boxShadow: `0 4px 24px -8px rgba(0, 0, 0, 0.3)`,
      }}
    >
      {/* Animated background gradient */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-500 group-hover:opacity-100",
          styles.gradient
        )}
      />

      {/* Top accent bar */}
      <div className={cn(
        "absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r opacity-0 transition-opacity duration-300 group-hover:opacity-100",
        styles.accentBar
      )} />

      {/* Subtle top line */}
      <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />

      {/* Corner glow on hover */}
      <div
        className="absolute -top-20 -right-20 h-40 w-40 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
        style={{ backgroundColor: styles.glowColor }}
      />

      <CardContent className="relative p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                {title}
              </p>
              <ArrowUpRight className="h-3 w-3 text-muted-foreground/30 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
            <div>
              <p className="text-2xl font-bold tracking-tight text-foreground value-display">
                {value}
              </p>
              <p className="mt-1.5 text-xs text-muted-foreground/80">{subtitle}</p>
            </div>
          </div>

          <div
            className={cn(
              "relative flex h-11 w-11 items-center justify-center rounded-xl ring-1 transition-all duration-300 group-hover:scale-105 group-hover:rotate-3",
              styles.iconBg,
              styles.ring
            )}
          >
            {/* Icon glow effect */}
            <div className={cn(
              "absolute inset-0 rounded-xl blur-md opacity-0 transition-opacity duration-300 group-hover:opacity-50",
              styles.iconBg
            )} />
            <Icon className={cn("relative h-5 w-5 transition-transform duration-300", styles.iconColor)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
