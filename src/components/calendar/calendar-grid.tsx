"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { ThoughtWithProject } from "@/actions/thoughts";

interface CalendarGridProps {
  currentDate: Date;
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  thoughts: ThoughtWithProject[];
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarGrid({
  currentDate,
  selectedDate,
  onSelectDate,
  thoughts,
}: CalendarGridProps) {
  // Build the calendar grid
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // First day of the month
    const firstDay = new Date(year, month, 1);
    const startingDay = firstDay.getDay();

    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    const totalDays = lastDay.getDate();

    // Previous month days to show
    const prevMonthLastDay = new Date(year, month, 0).getDate();

    const days: Array<{
      date: Date;
      isCurrentMonth: boolean;
      isToday: boolean;
      thoughts: ThoughtWithProject[];
    }> = [];

    // Previous month days
    for (let i = startingDay - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        thoughts: [],
      });
    }

    // Current month days
    const today = new Date();
    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(year, month, day);
      const isToday =
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();

      // Find thoughts for this day
      const dayThoughts = thoughts.filter((t) => {
        if (!t.dueDate) return false;
        const dueDate = new Date(t.dueDate);
        return (
          dueDate.getDate() === day &&
          dueDate.getMonth() === month &&
          dueDate.getFullYear() === year
        );
      });

      days.push({
        date,
        isCurrentMonth: true,
        isToday,
        thoughts: dayThoughts,
      });
    }

    // Next month days to fill the grid (always show 6 weeks)
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        thoughts: [],
      });
    }

    return days;
  }, [currentDate, thoughts]);

  const isSelected = (date: Date) => {
    if (!selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const now = new Date();
  const isOverdue = (date: Date) => {
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return dateOnly < todayOnly;
  };

  return (
    <div className="select-none">
      {/* Day headers */}
      <div className="grid grid-cols-7 mb-2">
        {DAYS.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-muted-foreground/60 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => {
          const hasThoughts = day.thoughts.length > 0;
          const hasOverdue = hasThoughts && isOverdue(day.date) && day.thoughts.some(t => t.dueDate && new Date(t.dueDate) < now);

          return (
            <button
              key={index}
              onClick={() => onSelectDate(day.date)}
              className={cn(
                "relative aspect-square flex flex-col items-center justify-center rounded-xl transition-all",
                "hover:bg-secondary/50",
                day.isCurrentMonth
                  ? "text-foreground"
                  : "text-muted-foreground/30",
                day.isToday && "ring-2 ring-primary/50",
                isSelected(day.date) && "bg-primary/20 text-primary ring-2 ring-primary"
              )}
            >
              <span
                className={cn(
                  "text-sm font-medium",
                  day.isToday && !isSelected(day.date) && "text-primary"
                )}
              >
                {day.date.getDate()}
              </span>

              {/* Thought indicators */}
              {hasThoughts && day.isCurrentMonth && (
                <div className="absolute bottom-1.5 flex gap-0.5">
                  {day.thoughts.slice(0, 3).map((thought, i) => (
                    <div
                      key={thought.id}
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        hasOverdue && isOverdue(day.date)
                          ? "bg-destructive"
                          : day.isToday
                            ? "bg-amber-400"
                            : thought.project?.color
                              ? ""
                              : "bg-primary"
                      )}
                      style={
                        thought.project?.color && !hasOverdue
                          ? { backgroundColor: thought.project.color }
                          : undefined
                      }
                    />
                  ))}
                  {day.thoughts.length > 3 && (
                    <span className="text-[8px] text-muted-foreground ml-0.5">
                      +{day.thoughts.length - 3}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
