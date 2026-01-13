"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import {
  Lightbulb,
  Sparkles,
  Calendar,
  FolderKanban,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { DashboardStats } from "@/actions/stats";

interface StatsWidgetsClientProps {
  stats: DashboardStats;
}

export function StatsWidgetsClient({ stats }: StatsWidgetsClientProps) {
  return (
    <Card className="border-0 bg-card/80 h-full">
      <CardContent className="p-4">
        <div className="grid grid-cols-2 gap-3">
          <MiniStatCard
            title="Today"
            value={stats.todayThoughts}
            icon={Calendar}
            color="gold"
            href="/recents"
          />
          <MiniStatCard
            title="Total"
            value={stats.totalThoughts}
            icon={Lightbulb}
            color="blue"
            href="/recents"
          />
          <MiniStatCard
            title="Pinned"
            value={stats.pinnedThoughts}
            icon={Sparkles}
            color="purple"
            href="/recents"
          />
          <MiniStatCard
            title="Projects"
            value={stats.totalProjects}
            icon={FolderKanban}
            color="green"
            href="/projects"
          />
        </div>
      </CardContent>
    </Card>
  );
}

interface MiniStatCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  color: "gold" | "blue" | "purple" | "green";
  href: string;
}

const colorStyles = {
  gold: {
    iconBg: "bg-amber-500/20",
    iconColor: "text-amber-400",
    valueBg: "group-hover:bg-amber-500/10",
  },
  blue: {
    iconBg: "bg-blue-500/20",
    iconColor: "text-blue-400",
    valueBg: "group-hover:bg-blue-500/10",
  },
  purple: {
    iconBg: "bg-violet-500/20",
    iconColor: "text-violet-400",
    valueBg: "group-hover:bg-violet-500/10",
  },
  green: {
    iconBg: "bg-emerald-500/20",
    iconColor: "text-emerald-400",
    valueBg: "group-hover:bg-emerald-500/10",
  },
};

function MiniStatCard({ title, value, icon: Icon, color, href }: MiniStatCardProps) {
  const styles = colorStyles[color];

  return (
    <Link
      href={href}
      className={cn(
        "group flex flex-col items-center justify-center rounded-xl p-3 transition-all",
        "bg-secondary/30 hover:bg-secondary/50",
        styles.valueBg
      )}
    >
      <div className={cn("mb-2 flex h-8 w-8 items-center justify-center rounded-lg", styles.iconBg)}>
        <Icon className={cn("h-4 w-4", styles.iconColor)} />
      </div>
      <span className="text-2xl font-bold text-foreground tabular-nums">{value}</span>
      <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
        {title}
      </span>
    </Link>
  );
}
