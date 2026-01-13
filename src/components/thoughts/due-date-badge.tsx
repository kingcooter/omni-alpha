"use client";

import { Clock, AlertCircle, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRelativeDate, isOverdue, isToday, isWithinDays } from "@/lib/time";

interface DueDateBadgeProps {
  dueDate: Date;
  dueDateText?: string | null;
  className?: string;
  showIcon?: boolean;
}

export function DueDateBadge({
  dueDate,
  dueDateText,
  className,
  showIcon = true,
}: DueDateBadgeProps) {
  const overdue = isOverdue(dueDate);
  const today = isToday(dueDate);
  const soon = isWithinDays(dueDate, 2);

  // Determine styling based on urgency
  const getStyles = () => {
    if (overdue) {
      return {
        bg: "bg-red-500/10",
        text: "text-red-400",
        icon: AlertCircle,
      };
    }
    if (today) {
      return {
        bg: "bg-amber-500/10",
        text: "text-amber-400",
        icon: Clock,
      };
    }
    if (soon) {
      return {
        bg: "bg-orange-500/10",
        text: "text-orange-400",
        icon: Clock,
      };
    }
    return {
      bg: "bg-muted/50",
      text: "text-muted-foreground",
      icon: Calendar,
    };
  };

  const styles = getStyles();
  const Icon = styles.icon;
  const displayText = dueDateText || formatRelativeDate(dueDate);

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
        styles.bg,
        styles.text,
        className
      )}
      title={`Due: ${dueDate.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })}`}
    >
      {showIcon && <Icon className="h-2.5 w-2.5" />}
      <span>
        {overdue ? "Overdue: " : ""}
        {displayText}
      </span>
    </div>
  );
}
