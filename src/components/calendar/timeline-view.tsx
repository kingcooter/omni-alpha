"use client";

import { Clock, AlertTriangle, Calendar as CalendarIcon, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatRelativeDate, isOverdue, isToday } from "@/lib/time";
import type { ThoughtWithProject } from "@/actions/thoughts";

interface TimelineViewProps {
  overdue: ThoughtWithProject[];
  today: ThoughtWithProject[];
  upcoming: ThoughtWithProject[];
  later: ThoughtWithProject[];
}

function TimelineSection({
  title,
  icon: Icon,
  thoughts,
  variant = "default",
}: {
  title: string;
  icon: typeof Clock;
  thoughts: ThoughtWithProject[];
  variant?: "overdue" | "today" | "upcoming" | "default";
}) {
  if (thoughts.length === 0) return null;

  const variantStyles = {
    overdue: {
      container: "border-red-500/20",
      header: "text-red-400",
      icon: "bg-red-500/10 text-red-400",
      badge: "bg-red-500/10 text-red-400",
    },
    today: {
      container: "border-amber-500/20",
      header: "text-amber-400",
      icon: "bg-amber-500/10 text-amber-400",
      badge: "bg-amber-500/10 text-amber-400",
    },
    upcoming: {
      container: "border-primary/20",
      header: "text-primary",
      icon: "bg-primary/10 text-primary",
      badge: "bg-primary/10 text-primary",
    },
    default: {
      container: "border-border/50",
      header: "text-muted-foreground",
      icon: "bg-muted/50 text-muted-foreground",
      badge: "bg-muted/50 text-muted-foreground",
    },
  };

  const styles = variantStyles[variant];

  return (
    <div className="mb-8">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className={cn("rounded-lg p-2", styles.icon)}>
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <h2 className={cn("text-lg font-semibold", styles.header)}>{title}</h2>
          <p className="text-xs text-muted-foreground">
            {thoughts.length} {thoughts.length === 1 ? "item" : "items"}
          </p>
        </div>
      </div>

      {/* Items */}
      <div className="space-y-2 pl-2 border-l-2 border-border/30 ml-4">
        {thoughts.map((thought) => (
          <Card
            key={thought.id}
            className={cn(
              "border-0 bg-card/60 hover:bg-card/80 transition-colors cursor-pointer group",
              styles.container
            )}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                {/* Timeline dot */}
                <div className="relative -ml-[25px] mt-1.5">
                  <div
                    className={cn(
                      "h-2.5 w-2.5 rounded-full ring-2 ring-background",
                      variant === "overdue" && "bg-red-400",
                      variant === "today" && "bg-amber-400",
                      variant === "upcoming" && "bg-primary",
                      variant === "default" && "bg-muted-foreground"
                    )}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground/90 line-clamp-2">
                    {thought.content}
                  </p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {thought.dueDateText && (
                      <span className={cn("text-xs px-2 py-0.5 rounded-full", styles.badge)}>
                        {thought.dueDateText}
                      </span>
                    )}
                    {thought.dueDate && (
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(thought.dueDate).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    )}
                    {thought.project && (
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded-full"
                        style={{
                          backgroundColor: `${thought.project.color}15`,
                          color: thought.project.color ?? "#d4a574",
                        }}
                      >
                        {thought.project.name}
                      </span>
                    )}
                  </div>
                </div>

                <ChevronRight className="h-4 w-4 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function TimelineView({ overdue, today, upcoming, later }: TimelineViewProps) {
  const isEmpty = overdue.length === 0 && today.length === 0 && upcoming.length === 0 && later.length === 0;

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-muted/50 p-4 mb-4">
          <CalendarIcon className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">No time-sensitive items</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Capture thoughts with dates like &quot;tomorrow&quot;, &quot;next Friday&quot;, or &quot;in 3 days&quot; and they&apos;ll appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <TimelineSection
        title="Overdue"
        icon={AlertTriangle}
        thoughts={overdue}
        variant="overdue"
      />
      <TimelineSection
        title="Today"
        icon={Clock}
        thoughts={today}
        variant="today"
      />
      <TimelineSection
        title="Upcoming"
        icon={CalendarIcon}
        thoughts={upcoming}
        variant="upcoming"
      />
      <TimelineSection
        title="Later"
        icon={CalendarIcon}
        thoughts={later}
        variant="default"
      />
    </div>
  );
}
