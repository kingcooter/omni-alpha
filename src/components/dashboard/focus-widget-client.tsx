"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import {
  Target,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/format";
import type { ThoughtWithProject } from "@/actions/thoughts";

interface FocusWidgetClientProps {
  overdue: ThoughtWithProject[];
  dueToday: ThoughtWithProject[];
  pinned: ThoughtWithProject[];
}

export function FocusWidgetClient({ overdue, dueToday, pinned }: FocusWidgetClientProps) {
  const totalFocusItems = overdue.length + dueToday.length + pinned.length;

  // If nothing needs attention, show a zen state
  if (totalFocusItems === 0) {
    return (
      <Card className="border-0 bg-gradient-to-br from-emerald-500/10 via-card to-card">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 ring-1 ring-emerald-500/30">
              <CheckCircle2 className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">All clear</h3>
              <p className="text-sm text-muted-foreground">
                No urgent items. Capture a new thought or explore your projects.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 bg-card/80 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/30 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/20">
            <Target className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Today's Focus</h2>
            <p className="text-xs text-muted-foreground">
              {totalFocusItems} {totalFocusItems === 1 ? "item" : "items"} need attention
            </p>
          </div>
        </div>
        <Link
          href="/calendar"
          className="flex items-center gap-1 text-xs text-primary/70 hover:text-primary transition-colors"
        >
          View all
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Overdue items - most urgent */}
        {overdue.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-1">
              <AlertCircle className="h-3.5 w-3.5 text-destructive" />
              <span className="text-[11px] font-semibold uppercase tracking-widest text-destructive/80">
                Overdue
              </span>
            </div>
            {overdue.slice(0, 2).map((thought) => (
              <FocusItem
                key={thought.id}
                thought={thought}
                variant="overdue"
              />
            ))}
            {overdue.length > 2 && (
              <Link
                href="/calendar"
                className="block px-3 py-1.5 text-xs text-destructive/70 hover:text-destructive transition-colors"
              >
                +{overdue.length - 2} more overdue items
              </Link>
            )}
          </div>
        )}

        {/* Due today */}
        {dueToday.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-1">
              <Clock className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-[11px] font-semibold uppercase tracking-widest text-amber-500/80">
                Due Today
              </span>
            </div>
            {dueToday.slice(0, 2).map((thought) => (
              <FocusItem
                key={thought.id}
                thought={thought}
                variant="today"
              />
            ))}
            {dueToday.length > 2 && (
              <Link
                href="/calendar"
                className="block px-3 py-1.5 text-xs text-amber-500/70 hover:text-amber-500 transition-colors"
              >
                +{dueToday.length - 2} more due today
              </Link>
            )}
          </div>
        )}

        {/* Pinned priorities */}
        {pinned.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-1">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="text-[11px] font-semibold uppercase tracking-widest text-primary/80">
                Pinned
              </span>
            </div>
            {pinned.slice(0, 2).map((thought) => (
              <FocusItem
                key={thought.id}
                thought={thought}
                variant="pinned"
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface FocusItemProps {
  thought: ThoughtWithProject;
  variant: "overdue" | "today" | "pinned";
}

function FocusItem({ thought, variant }: FocusItemProps) {
  const variantStyles = {
    overdue: {
      bg: "bg-destructive/5 hover:bg-destructive/10 border-destructive/20",
      icon: "bg-destructive/20 text-destructive",
      text: "text-destructive/90",
    },
    today: {
      bg: "bg-amber-500/5 hover:bg-amber-500/10 border-amber-500/20",
      icon: "bg-amber-500/20 text-amber-500",
      text: "text-amber-500/90",
    },
    pinned: {
      bg: "bg-primary/5 hover:bg-primary/10 border-primary/20",
      icon: "bg-primary/20 text-primary",
      text: "text-primary/90",
    },
  };

  const styles = variantStyles[variant];

  return (
    <Link
      href="/recents"
      className={cn(
        "group flex items-start gap-3 rounded-xl border p-3 transition-all",
        styles.bg
      )}
    >
      <div className={cn("mt-0.5 flex h-6 w-6 items-center justify-center rounded-lg", styles.icon)}>
        {variant === "overdue" && <AlertCircle className="h-3.5 w-3.5" />}
        {variant === "today" && <Calendar className="h-3.5 w-3.5" />}
        {variant === "pinned" && <Sparkles className="h-3.5 w-3.5" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground/90 line-clamp-2 leading-snug">
          {thought.content}
        </p>
        <div className="mt-1.5 flex items-center gap-2 text-[11px] text-muted-foreground/60">
          {thought.project && (
            <span
              className="rounded-full px-1.5 py-0.5"
              style={{
                backgroundColor: `${thought.project.color}15`,
                color: thought.project.color ?? "#d4a574",
              }}
            >
              {thought.project.name}
            </span>
          )}
          {thought.dueDateText && (
            <span className={styles.text}>{thought.dueDateText}</span>
          )}
          {!thought.dueDateText && thought.createdAt && (
            <span>{formatRelativeTime(thought.createdAt)}</span>
          )}
        </div>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground/30 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5" />
    </Link>
  );
}
