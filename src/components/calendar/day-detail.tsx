"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  AlertCircle,
  Sparkles,
  ChevronRight,
  Trash2,
  FolderKanban,
  CalendarX,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { updateThoughtDueDate, archiveThought } from "@/actions/thoughts";
import { toast } from "sonner";
import type { ThoughtWithProject } from "@/actions/thoughts";

interface DayDetailProps {
  selectedDate: Date | null;
  thoughts: ThoughtWithProject[];
  allThoughts: ThoughtWithProject[];
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function DayDetail({ selectedDate, thoughts, allThoughts }: DayDetailProps) {
  const [isPending, startTransition] = useTransition();

  if (!selectedDate) {
    // Show upcoming overview when no date selected
    const now = new Date();
    const overdueThoughts = allThoughts.filter(t => {
      if (!t.dueDate) return false;
      return new Date(t.dueDate) < now;
    });

    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-border/30">
          <h3 className="text-sm font-semibold text-foreground">Select a Date</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Click on any day to see its thoughts
          </p>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {overdueThoughts.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <span className="text-xs font-semibold uppercase tracking-wider text-destructive/80">
                  Overdue ({overdueThoughts.length})
                </span>
              </div>
              <div className="space-y-2">
                {overdueThoughts.slice(0, 3).map((thought) => (
                  <MiniThoughtCard key={thought.id} thought={thought} variant="overdue" />
                ))}
                {overdueThoughts.length > 3 && (
                  <p className="text-xs text-muted-foreground text-center py-2">
                    +{overdueThoughts.length - 3} more overdue
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-2 mt-4">
            <div className="rounded-xl bg-secondary/30 p-3 text-center">
              <div className="text-2xl font-bold text-foreground">{allThoughts.length}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Scheduled</div>
            </div>
            <div className="rounded-xl bg-destructive/10 p-3 text-center">
              <div className="text-2xl font-bold text-destructive">{overdueThoughts.length}</div>
              <div className="text-[10px] uppercase tracking-wider text-destructive/70">Overdue</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const now = new Date();
  const isToday =
    selectedDate.getDate() === now.getDate() &&
    selectedDate.getMonth() === now.getMonth() &&
    selectedDate.getFullYear() === now.getFullYear();

  const isPast = selectedDate < new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dayName = DAYS[selectedDate.getDay()];
  const monthName = MONTHS[selectedDate.getMonth()];

  const handleRemoveDate = (thoughtId: string) => {
    startTransition(async () => {
      try {
        await updateThoughtDueDate(thoughtId, null, null);
        toast.success("Date removed");
      } catch {
        toast.error("Failed to remove date");
      }
    });
  };

  const handleArchive = (thoughtId: string) => {
    startTransition(async () => {
      try {
        await archiveThought(thoughtId);
        toast.success("Archived");
      } catch {
        toast.error("Failed to archive");
      }
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Date Header */}
      <div className={cn(
        "p-4 border-b border-border/30",
        isToday && "bg-primary/5",
        isPast && !isToday && "bg-destructive/5"
      )}>
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex h-12 w-12 items-center justify-center rounded-xl",
            isToday ? "bg-primary/20 text-primary" : isPast ? "bg-destructive/20 text-destructive" : "bg-secondary/50 text-foreground"
          )}>
            <span className="text-lg font-bold">{selectedDate.getDate()}</span>
          </div>
          <div>
            <h3 className={cn(
              "text-sm font-semibold",
              isToday ? "text-primary" : isPast ? "text-destructive" : "text-foreground"
            )}>
              {isToday ? "Today" : dayName}
            </h3>
            <p className="text-xs text-muted-foreground">
              {monthName} {selectedDate.getDate()}, {selectedDate.getFullYear()}
            </p>
          </div>
        </div>

        {/* Status badge */}
        {isToday && (
          <div className="mt-3 flex items-center gap-1.5 text-xs text-primary">
            <Clock className="h-3 w-3" />
            <span>Focus on these today</span>
          </div>
        )}
        {isPast && !isToday && thoughts.length > 0 && (
          <div className="mt-3 flex items-center gap-1.5 text-xs text-destructive">
            <AlertCircle className="h-3 w-3" />
            <span>{thoughts.length} overdue {thoughts.length === 1 ? "item" : "items"}</span>
          </div>
        )}
      </div>

      {/* Thoughts List */}
      <div className="flex-1 overflow-auto p-4">
        {thoughts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <div className="rounded-full bg-secondary/50 p-3 mb-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No thoughts scheduled</p>
            <p className="text-xs text-muted-foreground/60 mt-1 max-w-[200px]">
              Capture thoughts with "{monthName.slice(0, 3)} {selectedDate.getDate()}" to add them here
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {thoughts.map((thought) => (
              <Card
                key={thought.id}
                className={cn(
                  "border-0 group transition-all",
                  isPast && !isToday
                    ? "bg-destructive/5 hover:bg-destructive/10"
                    : "bg-secondary/30 hover:bg-secondary/50"
                )}
              >
                <CardContent className="p-3">
                  <p className="text-sm text-foreground/90 leading-relaxed">
                    {thought.content}
                  </p>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      {thought.project && (
                        <Link
                          href={`/projects/${thought.project.id}`}
                          className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full hover:opacity-80 transition-opacity"
                          style={{
                            backgroundColor: `${thought.project.color}15`,
                            color: thought.project.color ?? "#d4a574",
                          }}
                        >
                          <FolderKanban className="h-2.5 w-2.5" />
                          {thought.project.name}
                        </Link>
                      )}
                      {thought.dueDateText && (
                        <span className="text-[10px] text-muted-foreground">
                          {thought.dueDateText}
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleRemoveDate(thought.id)}
                        disabled={isPending}
                        className="p-1 rounded hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                        title="Remove date"
                      >
                        <CalendarX className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleArchive(thought.id)}
                        disabled={isPending}
                        className="p-1 rounded hover:bg-secondary transition-colors text-muted-foreground hover:text-destructive"
                        title="Archive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add thought CTA */}
      <div className="p-4 border-t border-border/30">
        <Link href="/">
          <Button variant="outline" size="sm" className="w-full gap-2 border-border/50">
            <Plus className="h-3.5 w-3.5" />
            Add thought for {isToday ? "today" : dayName}
          </Button>
        </Link>
      </div>
    </div>
  );
}

function MiniThoughtCard({
  thought,
  variant,
}: {
  thought: ThoughtWithProject;
  variant: "overdue" | "today" | "default";
}) {
  const styles = {
    overdue: "bg-destructive/5 border-destructive/20",
    today: "bg-amber-500/5 border-amber-500/20",
    default: "bg-secondary/30 border-border/20",
  };

  return (
    <div className={cn("rounded-lg border p-2.5", styles[variant])}>
      <p className="text-xs text-foreground/80 line-clamp-2">{thought.content}</p>
      <div className="flex items-center gap-2 mt-1.5">
        {thought.dueDateText && (
          <span className="text-[10px] text-muted-foreground">{thought.dueDateText}</span>
        )}
        {thought.project && (
          <span
            className="text-[10px] px-1 py-0.5 rounded-full"
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
  );
}
