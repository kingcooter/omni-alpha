"use client";

import { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThoughtCard } from "./thought-card";
import { Lightbulb, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Thought, Project } from "@/lib/db";
import type { ThoughtWithProject } from "@/actions/thoughts";

interface ThoughtListProps {
  thoughtsWithProjects: ThoughtWithProject[];
  projects: Project[];
}

export function ThoughtList({ thoughtsWithProjects, projects }: ThoughtListProps) {
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Combine pinned and regular for keyboard navigation
  const pinnedThoughts = thoughtsWithProjects.filter((t) => t.isPinned);
  const regularThoughts = thoughtsWithProjects.filter((t) => !t.isPinned);
  const allThoughts = [...pinnedThoughts, ...regularThoughts];

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (allThoughts.length === 0) return;

      // Only handle if no input is focused
      const activeElement = document.activeElement;
      if (
        activeElement?.tagName === "INPUT" ||
        activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      switch (e.key) {
        case "j":
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < allThoughts.length - 1 ? prev + 1 : prev
          );
          break;
        case "k":
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
          break;
        case "Escape":
          setSelectedIndex(-1);
          break;
      }
    },
    [allThoughts.length]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Scroll selected thought into view
  useEffect(() => {
    if (selectedIndex >= 0) {
      const element = document.getElementById(`thought-${selectedIndex}`);
      element?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [selectedIndex]);

  if (thoughtsWithProjects.length === 0) {
    return (
      <Card className="border-0 bg-card/50">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Lightbulb className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-medium text-foreground">
            No thoughts yet
          </h3>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Your captured thoughts will appear here. Start by typing in the
            inbox above.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/20">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Recent Thoughts
            </h2>
            <p className="text-[11px] text-muted-foreground/60">
              {thoughtsWithProjects.length} captured
            </p>
          </div>
        </div>
        <span className="hidden text-[11px] text-muted-foreground/40 sm:flex items-center gap-1.5 rounded-lg bg-secondary/30 px-2.5 py-1.5">
          <kbd className="rounded border border-border/30 bg-muted/30 px-1.5 py-0.5 font-mono text-[10px]">
            j
          </kbd>
          <kbd className="rounded border border-border/30 bg-muted/30 px-1.5 py-0.5 font-mono text-[10px]">
            k
          </kbd>
          <span className="ml-1 text-muted-foreground/50">navigate</span>
        </span>
      </div>

      <div className="space-y-3">
        {pinnedThoughts.length > 0 && (
          <div className="space-y-2">
            {pinnedThoughts.map((thought, index) => (
              <div
                key={thought.id}
                id={`thought-${index}`}
                className={cn(
                  "transition-all duration-200",
                  selectedIndex === index &&
                    "ring-2 ring-primary/50 ring-offset-2 ring-offset-background rounded-xl"
                )}
              >
                <ThoughtCard thought={thought} project={thought.project} projects={projects} />
              </div>
            ))}
          </div>
        )}

        {regularThoughts.length > 0 && (
          <div className="space-y-2">
            {regularThoughts.map((thought, index) => {
              const globalIndex = pinnedThoughts.length + index;
              return (
                <div
                  key={thought.id}
                  id={`thought-${globalIndex}`}
                  className={cn(
                    "transition-all duration-200",
                    selectedIndex === globalIndex &&
                      "ring-2 ring-primary/50 ring-offset-2 ring-offset-background rounded-xl"
                  )}
                >
                  <ThoughtCard thought={thought} project={thought.project} projects={projects} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
