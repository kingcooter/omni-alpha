"use client";

import { cn } from "@/lib/utils";

interface TimeAgoProps {
  date: Date | null | undefined;
  className?: string;
}

export function TimeAgo({ date, className }: TimeAgoProps) {
  if (!date) {
    return <span className={cn("player-time", className)}>Never</span>;
  }

  const timeAgo = getTimeAgo(date);

  return (
    <span className={cn("player-time", className)} title={date.toLocaleString()}>
      {timeAgo}
    </span>
  );
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffSeconds < 60) {
    return "Just now";
  }
  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }
  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }
  if (diffWeeks < 4) {
    return `${diffWeeks}w ago`;
  }
  if (diffMonths < 12) {
    return `${diffMonths}mo ago`;
  }
  return `${diffYears}y ago`;
}
