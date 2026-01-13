"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { CalendarHeader } from "./calendar-header";
import { CalendarGrid } from "./calendar-grid";
import { DayDetail } from "./day-detail";
import { TimelineView } from "./timeline-view";
import type { ThoughtWithProject } from "@/actions/thoughts";

interface CalendarViewProps {
  overdue: ThoughtWithProject[];
  today: ThoughtWithProject[];
  upcoming: ThoughtWithProject[];
  later: ThoughtWithProject[];
  allThoughts: ThoughtWithProject[];
}

export function CalendarView({
  overdue,
  today,
  upcoming,
  later,
  allThoughts,
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [view, setView] = useState<"month" | "agenda">("month");

  const handlePrevMonth = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  const handleToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
  };

  // Get thoughts for selected date
  const selectedDateThoughts = useMemo(() => {
    if (!selectedDate) return [];
    return allThoughts.filter((t) => {
      if (!t.dueDate) return false;
      const dueDate = new Date(t.dueDate);
      return (
        dueDate.getDate() === selectedDate.getDate() &&
        dueDate.getMonth() === selectedDate.getMonth() &&
        dueDate.getFullYear() === selectedDate.getFullYear()
      );
    });
  }, [selectedDate, allThoughts]);

  if (view === "agenda") {
    return (
      <div>
        <CalendarHeader
          currentDate={currentDate}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onToday={handleToday}
          view={view}
          onViewChange={setView}
        />
        <TimelineView
          overdue={overdue}
          today={today}
          upcoming={upcoming}
          later={later}
        />
      </div>
    );
  }

  return (
    <div>
      <CalendarHeader
        currentDate={currentDate}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onToday={handleToday}
        view={view}
        onViewChange={setView}
      />

      {/* Split Layout */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2">
          <Card className="border-0 bg-card/80 p-6">
            <CalendarGrid
              currentDate={currentDate}
              selectedDate={selectedDate}
              onSelectDate={handleSelectDate}
              thoughts={allThoughts}
            />

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-border/30">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-destructive" />
                <span>Overdue</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-amber-400" />
                <span>Today</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span>Upcoming</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Day Detail */}
        <div className="lg:col-span-1">
          <Card className="border-0 bg-card/80 h-[500px] overflow-hidden">
            <DayDetail
              selectedDate={selectedDate}
              thoughts={selectedDateThoughts}
              allThoughts={allThoughts}
            />
          </Card>
        </div>
      </div>

      {/* Quick Stats Bar */}
      <div className="mt-6 grid grid-cols-4 gap-4">
        <QuickStat
          label="Overdue"
          count={overdue.length}
          variant="destructive"
          onClick={() => {
            if (overdue.length > 0 && overdue[0].dueDate) {
              setSelectedDate(new Date(overdue[0].dueDate));
            }
          }}
        />
        <QuickStat
          label="Today"
          count={today.length}
          variant="warning"
          onClick={() => setSelectedDate(new Date())}
        />
        <QuickStat
          label="This Week"
          count={upcoming.length}
          variant="primary"
        />
        <QuickStat
          label="Later"
          count={later.length}
          variant="muted"
        />
      </div>
    </div>
  );
}

function QuickStat({
  label,
  count,
  variant,
  onClick,
}: {
  label: string;
  count: number;
  variant: "destructive" | "warning" | "primary" | "muted";
  onClick?: () => void;
}) {
  const styles = {
    destructive: "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20",
    warning: "bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20",
    primary: "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20",
    muted: "bg-secondary/50 text-muted-foreground border-border/30 hover:bg-secondary",
  };

  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={`rounded-xl border p-4 text-center transition-colors ${styles[variant]} ${onClick ? "cursor-pointer" : "cursor-default"}`}
    >
      <div className="text-2xl font-bold">{count}</div>
      <div className="text-xs font-medium uppercase tracking-wider opacity-80">{label}</div>
    </button>
  );
}
