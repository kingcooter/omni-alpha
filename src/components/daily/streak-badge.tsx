"use client";

import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { getStreakIntensity, getStreakMilestone } from "@/lib/habits/streaks";

interface StreakBadgeProps {
  streak: number;
  atRisk?: boolean;
  showMilestone?: boolean;
  size?: "sm" | "md" | "lg";
}

export function StreakBadge({
  streak,
  atRisk = false,
  showMilestone = false,
  size = "sm",
}: StreakBadgeProps) {
  if (streak === 0) return null;

  const intensity = getStreakIntensity(streak);
  const { milestone, nextMilestone } = getStreakMilestone(streak);

  const sizeClasses = {
    sm: "text-xs px-1.5 py-0.5 gap-1",
    md: "text-sm px-2 py-1 gap-1.5",
    lg: "text-base px-3 py-1.5 gap-2",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const intensityClasses = {
    0: "bg-muted text-muted-foreground",
    1: "bg-primary/10 text-primary",
    2: "bg-orange-500/10 text-orange-400",
    3: "bg-red-500/10 text-red-400",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        sizeClasses[size],
        intensityClasses[intensity],
        atRisk && "animate-pulse"
      )}
    >
      <Flame
        className={cn(
          iconSizes[size],
          intensity >= 2 && "streak-fire",
          atRisk && "text-amber-400"
        )}
      />
      <span>{streak}</span>
      {showMilestone && milestone && (
        <span className="ml-1 text-muted-foreground">
          ({milestone}d milestone)
        </span>
      )}
    </div>
  );
}
