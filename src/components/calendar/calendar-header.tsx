"use client";

import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  List,
  CalendarDays,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CalendarHeaderProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  view: "month" | "agenda";
  onViewChange: (view: "month" | "agenda") => void;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function CalendarHeader({
  currentDate,
  onPrevMonth,
  onNextMonth,
  onToday,
  view,
  onViewChange,
}: CalendarHeaderProps) {
  const month = MONTHS[currentDate.getMonth()];
  const year = currentDate.getFullYear();

  const isCurrentMonth = () => {
    const now = new Date();
    return (
      currentDate.getMonth() === now.getMonth() &&
      currentDate.getFullYear() === now.getFullYear()
    );
  };

  return (
    <div className="flex items-center justify-between mb-6">
      {/* Month/Year + Navigation */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onPrevMonth}
            className="h-8 w-8 rounded-lg"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-[180px] text-center">
            <h2 className="text-xl font-bold text-foreground">
              {month} {year}
            </h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onNextMonth}
            className="h-8 w-8 rounded-lg"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {!isCurrentMonth() && (
          <Button
            variant="outline"
            size="sm"
            onClick={onToday}
            className="gap-1.5 text-xs border-border/50"
          >
            <CalendarDays className="h-3.5 w-3.5" />
            Today
          </Button>
        )}
      </div>

      {/* View Toggle */}
      <div className="flex items-center gap-1 rounded-xl bg-secondary/30 p-1">
        <button
          onClick={() => onViewChange("month")}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
            view === "month"
              ? "bg-primary/20 text-primary shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Calendar className="h-3.5 w-3.5" />
          Month
        </button>
        <button
          onClick={() => onViewChange("agenda")}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
            view === "agenda"
              ? "bg-primary/20 text-primary shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <List className="h-3.5 w-3.5" />
          Agenda
        </button>
      </div>
    </div>
  );
}
