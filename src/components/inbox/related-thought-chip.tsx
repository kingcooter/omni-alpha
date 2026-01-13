"use client";

import { Link2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/format";

interface RelatedThought {
  id: string;
  content: string;
  createdAt: Date;
}

interface RelatedThoughtChipProps {
  thought: RelatedThought;
  onClick?: (thoughtId: string) => void;
  className?: string;
}

export function RelatedThoughtChip({
  thought,
  onClick,
  className,
}: RelatedThoughtChipProps) {
  // Truncate content for display
  const snippet =
    thought.content.length > 50
      ? thought.content.slice(0, 50) + "..."
      : thought.content;

  return (
    <button
      onClick={() => onClick?.(thought.id)}
      className={cn(
        "suggestion-chip group flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs",
        "bg-secondary/50 text-muted-foreground",
        "ring-1 ring-border/20",
        "transition-all duration-200",
        "hover:scale-105 hover:bg-secondary/70 hover:text-foreground",
        "focus:outline-none focus:ring-2 focus:ring-primary/50",
        className
      )}
      title={`Related thought from ${formatRelativeTime(thought.createdAt)}: ${thought.content}`}
    >
      <Link2 className="h-3 w-3 text-primary/60" />
      <span className="max-w-[150px] truncate">Related: {snippet}</span>
      <span className="text-[10px] text-muted-foreground/60">
        {formatRelativeTime(thought.createdAt)}
      </span>
    </button>
  );
}
